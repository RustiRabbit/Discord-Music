import { AudioPlayer, AudioPlayerStatus, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CommandInteraction, StageChannel, TextBasedChannels, VoiceChannel, MessageEmbed } from "discord.js";
import Messages from "../Messages";
import PlayingQueue, { QUEUE_STATE } from "../PlayingQueue";
import SearchHelper, { URL_TYPE } from "../Search";
import ytdl from 'ytdl-core';
import { bold } from "@discordjs/builders";

/*
State class
Contains state of bot per server
All information about current state e.g. queue
*/
class State {
    private queue_:PlayingQueue;
    private player_:AudioPlayer;
    private message_:TextBasedChannels | null = null;

    constructor() {
        this.queue_ = new PlayingQueue();
        this.player_ = new AudioPlayer();

        this.player_.on(AudioPlayerStatus.Idle, () => {
            console.log("[Player] Idle");
            this.queue_.finished();
            this.start();
        })

        this.player_.on(AudioPlayerStatus.Playing, () => {
            console.log("[Player] Playing");
        })

        this.player_.on('error', (error) => {
            console.log("[Player] THe player reported an error");
            console.log(error);
        })
    }

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
        interaction.editReply(Messages.Search(input));
        let searchResult = await SearchHelper.search(input);
        //Add user who requested and send
        searchResult.resultMessage.addField("Requested by:","```" + interaction.member?.user.username + "```");
        interaction.editReply({embeds: [searchResult.resultMessage]});
    
        // Add to the queue
        // If error ignore, otherwise loop and add
        if (searchResult.resultInfo.length > 0) {
            for (let i = 0; i < searchResult.resultInfo.length; i++) {
                this.queue_.addVideo(searchResult.resultInfo[i]);
            }
        }
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
                        console.log("[Connection State] Ignoring Disconnect")
                        connection.subscribe(this.player_);
                        // Seems to be reconnecting to a new channel - ignore disconnect
                    } catch (error) {
                        // Seems to be a real disconnect which SHOULDN'T be recovered from
                        console.log("[Connection State] Destroyed")
                        connection.destroy();
                    }
                }
            });

            return this.start();
        } else {
            console.log("[VC] Already joined");
            return this.start(); // Check if something needs to be played
        }        
    }

    // This function is run whenever there is a possibility that music needs to be played (e.g. on add command or play command)
    // Except it checks that a song isn't already being played before starting.
    async start() {
        if(this.queue_.state == QUEUE_STATE.STOP) {
            return this.nextSong();
        }
        return true;
    }

    // This stops the current song, and changes to the next song
    async nextSong() {
        // Get next song
        let song = this.queue_.getSong();
        if(song == null) {
            this.player_.stop();
            return false;
        }


        // Ensure that the song infomation isn't empty
        if(song == null) {
            this.sendMessage(":x: Error parsing song");
            this.player_.stop();
            return false;
        } else {
            // Download song
            const input = ytdl(song.url, {filter: 'audioonly'}); // Download

            this.sendMessage(bold("Now Playing: ") +  song.name);

            const resource = createAudioResource(input); // Create resource
            this.player_.play(resource); // Play resource

            return true;
        }
    }


}

export default State;