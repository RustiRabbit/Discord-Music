import { CommandInteraction, MessageEmbed, MessagePayload } from "discord.js";
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
        this.queue_.push(video);
    }

    get queue() {
        return this.queue_;
    }

}

export default State;