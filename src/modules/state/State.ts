import { VoiceConnectionStatus, joinVoiceChannel, VoiceConnection, entersState, getVoiceConnection } from "@discordjs/voice";
import { CommandInteraction, StageChannel, TextBasedChannels, TextChannel, VoiceChannel } from "discord.js";
import Messages from "../Messages";
import Video, { INPUT_TYPE } from "../Video";
import VoiceHelper from "../Voice/VoiceHelper";

class State {
    private queue_:Array<Video>; // Video Queue
    private voiceChannel_: VoiceChannel | StageChannel | null = null; // Voice Connection
    private messageChannel_: TextBasedChannels | null = null; // Text channel to send messages

    constructor() {
        this.queue_ = [];
    }

    // Queue

    async addVideo(input: string, interaction: CommandInteraction) {
        let video = new Video(input, INPUT_TYPE.URL);
        let info = await video.searchVideo();
        interaction.editReply(Messages.Search(info.url) + "\n" + Messages.Found(info.name));
    
        // Add to the queue
        this.queue_.push(video);
    
        // Setup Message Channel
        this.messageChannel_ = interaction.channel;

        // Run the queue
        this.executeQueue(interaction);
    }


    get queue() {
        return this.queue_;
    }

    get connection() {
        return this.voiceChannel_;
    }

    private executeQueue(interaction?: CommandInteraction) {
        if(this.voiceChannel_ == null) { // If the Connection is null, then connect
            if(interaction == undefined) {
                if(this.messageChannel_ != null) {
                    this.messageChannel_.send(Messages.Error.FailedToJoin());
                    return;
                } else {
                    console.log("[Error] Failed to join the voice chat")
                }
            } else {
                let channel = VoiceHelper.GetVoiceChat(interaction); // Get the voice channel to join
                if(channel == null) { // Error Handling
                    interaction.channel?.send(Messages.Error.FailedToJoin());
                    return;
                }
    
                this.connect(channel);
            }
        }
    }

    // Voice Connections
    async connect(channel: VoiceChannel | StageChannel) {
        console.log("[Voice Channels] Attempting to connect");
        if(this.voiceChannel_ == null) { // Hasn't been created yet
            this.voiceChannel_ = channel;
            let connection = await joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

            // Create event handling
            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log("[Connection State] Ready");
            })

            // Code from https://discordjs.guide/voice/voice-connections.html#life-cycle
            // This works by entering into a promise race. The race continues until either one works or fails
            // This helps differentiate between a recoverable disconnect (such as moving the bot) or a unrecoverable disconnect (such as the bot getting disconnected)
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                if(connection != null) { // Check that the object still exists
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                        console.log("[Connection State] Reconnected");
                        // Seems to be reconnecting to a new channel - ignore disconnect
                    } catch (error) {
                        // Seems to be a real disconnect which SHOULDN'T be recovered from
                        connection.destroy();
                        this.voiceChannel_ = null;
                        console.log("[Connection State] Disconnected");
                    }    
                }     
            })
        }
    }

    // Disconnect from the voice call
    async disconnect() {
        return new Promise<void>((resolve, reject) => {
            if(this.voiceChannel_ != null) {
                // Get the connection
                try {
                    let connection = getVoiceConnection(this.voiceChannel_.guildId); // Get the connection
                    connection?.disconnect(); // Send Disconnect Messagge
                    resolve();
                } catch (error) {
                    reject();
                }
                
            }
        })
        
    }



}

export default State;