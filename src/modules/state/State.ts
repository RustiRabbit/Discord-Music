import { getVoiceConnection, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { CommandInteraction, GuildChannel, VoiceChannel } from "discord.js";
import Messages from "../Messages";
import Video, { INPUT_TYPE } from "../Video";

class State {
    private queue_:Array<Video>;

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
        
    }

    get queue() {
        return this.queue_;
    }

    // Voice Connections
    



}

export default State;