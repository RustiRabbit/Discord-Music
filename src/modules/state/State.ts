import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { CommandInteraction, StageChannel, TextBasedChannel, TextBasedChannels, VoiceChannel } from "discord.js";
import Messages from "../Messages";
import PlayingQueue, { QUEUE_STATE } from "../PlayingQueue";
import Video, { INPUT_TYPE } from "../Video";
import VoiceHelper from "../Voice/VoiceHelper";
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

        this.player_.on('error', () => {
            console.log("Found error lol");
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
        let video = new Video(input, INPUT_TYPE.URL);
        let info = await video.searchVideo();
        //If a video result is found then normal message, otherwise handle with error message
        let responseEmbed:MessageEmbed = new MessageEmbed();
        if (info != null) {
            responseEmbed.setTitle("Song Added to Queue");
            responseEmbed.setThumbnail(info.thumbnail);
            responseEmbed.addField(info.name,info.length,true);
            responseEmbed.setURL(info.url);
            interaction.editReply({embeds: [responseEmbed]});
        } else {
            if (video.search.type == INPUT_TYPE.SEARCH) {
                responseEmbed.setTitle("No results found");
                interaction.editReply({embeds: [responseEmbed]});
            } else {
                responseEmbed.setTitle("Invalid URL");
                interaction.editReply({embeds: [responseEmbed]});
            }
        }
    
        // Add to the queue
        this.queue_.addVideo(video);
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
        if(song.infomation == null) {
            this.sendMessage(":x: Error parsing song");
            this.player_.stop();
            return false;
        } else {
            // Download song
            const input = ytdl(song.infomation?.url, {filter: 'audioonly'}); // Download

            this.sendMessage(bold("Now Playing: ") +  song.infomation.name);

            const resource = createAudioResource(input); // Create resource
            this.player_.play(resource); // Play resource

            return true;
        }
    }


}

export default State;