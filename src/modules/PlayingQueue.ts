import { bold, quote } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import Messages from "./Messaages";
import Video from "./Video";

enum QUEUE_STATE {
    EMPTY = 0,
    PAUSED = 1,
    PLAYING = 2,
}

class PlayingQueue {
    private state_: QUEUE_STATE = QUEUE_STATE.EMPTY; 
    private currentlyPlaying_: Video | null = null;
    private list_:Array<Video> = [];

    constructor() {
        
    }

    // Queue Modification
    addVideo(video: Video) {
        this.list_.push(video);
    }

    generateQueueMessage() {
        const Embed = new MessageEmbed();
        Embed.setTitle("Song Queue");

        let message = "";
        
        // Check Curently Playing
        if(this.currentlyPlaying_ != null) {
            message += bold("Currently Playing:") + "\n" + this.currentlyPlaying_.infomation?.name + "\n\n";
        }

        for(var i = 0; i < this.list_.length; i++) {
            message += "`" + (i + 1) + ".` - " + this.list_[i].infomation?.name + "\n\n";
        }

        Embed.setDescription(message);

        return Embed;
    }

    // State
    getNextSong() {
        // No songs in queue
        if(this.list_.length == 0) {
            return null;
        } else { // Songs to work with
            this.currentlyPlaying_ = this.list_[0]; // Sets currently playing song
            this.list_.shift(); // Removes the song from the queue

            // Change Playing State
            this.state_ = QUEUE_STATE.PLAYING;
            return this.currentlyPlaying_;
        }
    }


}
export default PlayingQueue;