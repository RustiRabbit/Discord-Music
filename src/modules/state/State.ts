import { AudioPlayer, AudioPlayerStatus, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import {
    CommandInteraction,
    StageChannel,
    TextBasedChannels,
    VoiceChannel,
    MessageEmbed,
    GuildMember,
    GuildChannelResolvable, GuildChannel
} from "discord.js";
import Messages from "../Messages";
import PlayingQueue, { QUEUE_STATE } from "../PlayingQueue";
import SearchHelper from "../Search";
import ytdl from 'ytdl-core';
import { bold } from "@discordjs/builders";
import PLAYING_STATUS from "../types/PlayingStatus";

const DISCONNECT_DURATION = 2*60*1000;

/*
State class
Contains state of bot per server
All information about current state e.g. queue
*/
class State {
    private queue_:PlayingQueue;
    private player_:AudioPlayer;
    private message_:TextBasedChannels | null = null;
    private guildId_:string;
    private voiceChannel: VoiceChannel | null = null;

    private disconnectTimer: any = null;

    constructor(guildId: string) {
        this.queue_ = new PlayingQueue();
        this.player_ = new AudioPlayer();
        this.guildId_ = guildId;


        this.player_.on(AudioPlayerStatus.Idle, () => {
            console.log("[Player] Idle");
            
            // Get the next song
            this.queue_.finished(); 
            
            // Start the next song
            this.start();
        });

        this.player_.on(AudioPlayerStatus.Playing, () => {
            console.log("[Player] Playing");
            
            // Start the duration/
            this.queue_.unpause();

            // Start the disconnectTimer
            if(this.disconnectTimer == null) {
                this.disconnectTimer = setInterval(() => {
                    let number = 0; // Default number of users
                    this.voiceChannel?.members.each((member: GuildMember) => {
                        number++; // Add all the users together
                    });
                    if(number == 1) { // Means that only sink is in the vc, we therefore are compelled to forcibly remove the vile creature from the vc
                        if(this.voiceChannel != null) {
                            let connection: VoiceConnection | undefined = getVoiceConnection(this.voiceChannel.guildId);
                            if(connection != undefined) { // means that shit **didn't** happened and I cbf to work this out
                                this.disconnectAudio(); // disconnect
                                this.sendMessage("bye ig");
                                clearInterval(this.disconnectTimer);
                            }
                        }

                    }
                }, DISCONNECT_DURATION);
            }
        });

        this.player_.on(AudioPlayerStatus.Paused, () => {
            console.log("[Player] Paused");
            
            // Pause the duration
            this.queue_.pause();
        });

        this.player_.on('error', (error) => {
            // Log Error
            console.log("[Player] THe player reported an error");
            console.log(error);

            // Show the user the error
            this.sendMessage(bold("Error: ") + "The player experienced an error. Skipping to the next song");

            // Skip to the next song
            this.nextSong();
        });
    }


    // Send a message in the chat OR in the console if the chat is unable
    sendMessage(text: string) {
        if(this.message_ != null) {
            this.message_.send(text);
        } else {
            console.log("[Message - Unable to send] " + text);
        }
    }

    setMessageChannel(channel: TextBasedChannels) {
        this.message_ = channel;
    }

    // Queue
    async addVideo(input: string, interaction: CommandInteraction) {
        interaction.editReply(Messages.Add.Search(input));
        let searchResult = await SearchHelper.search(input);
        //Add user who requested and send
        searchResult.resultMessage.addField("Requested by:","`" + interaction.member?.user.username + "`");
        interaction.editReply({embeds: [searchResult.resultMessage]});
    
        // Add to the queue
        // If error ignore, otherwise loop and add
        if (searchResult.resultInfo.length > 0) {
            for (let i = 0; i < searchResult.resultInfo.length; i++) {
                this.queue_.addVideo(searchResult.resultInfo[i]);
            }
            return true;
        } else {
            return false;
        }
    }

    async clearQueue() {
        this.pause();
        this.queue_.clear();
    }

    remove(index: number) {
        return this.queue_.remove(index);
    }

    shuffleQueue() {
        this.queue_.shuffleQueue();
    }

    get queue() {
        return this.queue_;
    }

    // VOICE
    async connectAudio(channel: VoiceChannel | StageChannel) {
        let connection: VoiceConnection | undefined = getVoiceConnection(channel.guildId);
        
        if(connection == undefined) {
            console.log("[VC] Need to join vc")
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            
            // Setup subscriptions
            connection.subscribe(this.player_);

            // Set the channel
            if(channel instanceof VoiceChannel) {
                this.voiceChannel = channel;
            }

            // Shown when ready to play
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log("[VC Status] Ready");
            })    

            // Yoinked from the discordjs voice guide
            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                if(connection != undefined)  {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                        // Seems to be reconnecting to a new channel - ignore disconnect
                        console.log("[Connection State] Ignoring Disconnect")
                        connection.subscribe(this.player_);

                        // Change the current channel for the autodisconnect
                        let newConnection: VoiceConnection | undefined = getVoiceConnection(channel.guildId);
                        if(newConnection != undefined) {
                            if(newConnection.joinConfig.channelId != null) {
                                this.voiceChannel?.guild.channels.fetch(newConnection.joinConfig.channelId).then((channel: any) => {
                                    this.voiceChannel = (channel as VoiceChannel);
                                });

                            }

                        }

                    } catch (error) {
                        // Seems to be a real disconnect which SHOULDN'T be recovered from
                        console.log("[Connection State] Destroyed")
                        connection.destroy(); // Destory the connection

                        // Pause the currently playing timer
                        this.queue_.pause();
                        this.queue_.finished();

                        // Stop the timer
                        if(this.disconnectTimer != null) {
                            clearInterval(this.disconnectTimer);
                        }
                        this.disconnectTimer = null;

                        // Clear the channel
                        //this.voiceChannel = null;
                    }
                }
            });

            return this.start();
        } else {
            console.log("[VC] Already joined");
            return this.start(); // Check if something needs to be played
        }        
    }

    async disconnectAudio() {
        return new Promise<boolean>(async (resolve, reject) => {
            let connection = getVoiceConnection(this.guildId_);
            if(connection != null) {
                connection.disconnect();
                this.voiceChannel = null;
                resolve(true);
            } else {
                resolve(false)
            }

        })
    }

    get connectionStatus() { // Either returns true (meaning the bot is in a vc) or false (meaning that the bot isn't in a vc)
        let connection = getVoiceConnection(this.guildId_);
        if(connection != undefined) {
            return true; 
        } else {
            return false;
        }
    }

    // This function is run whenever there is a possibility that music needs to be played (e.g. on add command or play command)
    // Except it checks that a song isn't already being played before starting.
    async start() {
        if(this.queue_.state == QUEUE_STATE.PAUSE) {
            this.unpause();
        }
        if(this.queue_.state == QUEUE_STATE.STOP) {
            return this.nextSong();
        }
        return PLAYING_STATUS.Playing;
    }

    // This stops the current song, and changes to the next song
    async nextSong() {
        // Get next song
        let song = this.queue_.getSong();
        if(song == null) {
            this.player_.stop();
            return PLAYING_STATUS.Empty;
        }


        // Ensure that the song infomation isn't empty
        if(song == null) {
            this.sendMessage(":x: Error parsing song");
            this.player_.stop();
            return PLAYING_STATUS.Error;
        } else {
            // Download song
            const input = ytdl(song.url, {filter: 'audioonly', highWaterMark: 1 << 25}); // Download

            if (this.queue.loop_ == false) {
                this.sendMessage(bold("Now Playing: ") +  song.name);
            }

            const resource = createAudioResource(input); // Create resource
            this.player_.play(resource); // Play resource

            return PLAYING_STATUS.Playing;
        }
    }

    // Pauses
    pause() {
        this.player_.pause();
        this.queue_.pause();
    }

    private unpause() {
        this.player_.unpause();
        this.queue_.unpause();
    }

}

export default State;