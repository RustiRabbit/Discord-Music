import { CommandInteraction } from "discord.js";
import Messages from "../Messages";
import Video, { INPUT_TYPE } from "../Video";

/*
State class
Contains state of bot per server
All information about current state e.g. queue
*/
class State {
    private queue_:Array<Video>;

    constructor() {
        this.queue_ = [];
    }

    async addVideo(input: string, interaction: CommandInteraction) {
        let video = new Video(input, INPUT_TYPE.URL);
        let info = await video.searchVideo();
        interaction.editReply(Messages.Search(info.url) + "\n" + Messages.Found(info.name));
    
        // Add to the queue
        this.queue_.push(video);
    }

    get queue() {
        return this.queue_;
    }

}

export default State;