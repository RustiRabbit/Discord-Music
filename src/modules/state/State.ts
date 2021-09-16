import { getVoiceConnection, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildChannel, VoiceChannel } from "discord.js";
import GetVoiceChannel from "../CheckVoiceChannel";
import Messages from "../Messages";
import Video, { INPUT_TYPE } from "../Video";

class State {
    private queue_:Array<Video>;
    private connection_:VoiceConnection | null = null;
    private currentChannel_: VoiceChannel | null = null;

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
    
        // Update the queue
        this.updateQueue(interaction);
    }

    // Resync the queue with the voice channel
    private updateQueue(interaction: CommandInteraction) {
        if(this.currentChannel_ == null) {
            // Check that the user is still in a voice channel
            if(GetVoiceChannel(interaction) != null) {
                this.currentChannel_ = GetVoiceChannel(interaction) as VoiceChannel;
                this.generateConnection(this.currentChannel_);
            } else {
                interaction.channel?.send(Messages.NotInVC());
            }

        }
    }

    get queue() {
        return this.queue_;
    }

    // Voice Connections
    private generateConnection(channel: VoiceChannel) {
        // Assign Voice Channel Connection
        this.connection_ = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        // Assign Current Channel
        this.currentChannel_ = channel;

        
    }



}

export default State;