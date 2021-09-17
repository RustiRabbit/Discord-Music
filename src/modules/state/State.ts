import { CommandInteraction } from "discord.js";
import Messages from "../Messaages";
import PlayingQueue from "../Queue";
import Video, { INPUT_TYPE } from "../Video";

class State {
    private queue_:PlayingQueue;

    constructor() {
        this.queue_ = new PlayingQueue();
    }

    async addVideo(input: string, interaction: CommandInteraction) {
        let video = new Video(input, INPUT_TYPE.URL);
        let info = await video.searchVideo();
        interaction.editReply(Messages.Search(info.url) + "\n" + Messages.Found(info.name));
    
        // Add to the queue
        this.queue_.addVideo(video);
    }

    get queue() {
        return this.queue_;
    }

}

export default State;