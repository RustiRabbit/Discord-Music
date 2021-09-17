import { bold, quote } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import Messages from "./Messages";
import Video from "./Video";

enum QUEUE_STATE {
    PLAY = 0,
    PAUSE = 1,
    STOP = 2
}

class PlayingQueue {
    private state_: QUEUE_STATE; // Queue Status
    private currentlyPlaying_: Video | null; // Currently Playing Video
    private list_:Array<Video>; // Queue list

    constructor() {
        this.state_ = QUEUE_STATE.STOP;
        this.currentlyPlaying_ = null;
        this.list_ = [];
    }

    // Queue Modification
    addVideo(video: Video) {
        this.list_.push(video);
    }

    // Generates a queue message, returns a message embed
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

    // Done when a song has finished played
    finished()  {
        this.currentlyPlaying_ = null;
        this.state_ = QUEUE_STATE.STOP;
    }

    // Pause
    pause() {
        this.state_ = QUEUE_STATE.PAUSE;
    }

    unpause() {
        this.state_ = QUEUE_STATE.PLAY;
    }

    // Gets the next song
    getSong() {
        // No songs in queue - return null, handled by nextSong in the state class
        if(this.list_.length == 0) {
            return null;
        } else { // Songs to work with
            this.currentlyPlaying_ = this.list_[0]; // Sets currently playing song
            this.list_.shift(); // Removes the song from the queue (so it doesn't get played again)

            // Change Playing State
            this.state_ = QUEUE_STATE.PLAY;
            return this.currentlyPlaying_;
        }
    }

    get state() {
        return this.state_;
    }

}
export default PlayingQueue;
export { QUEUE_STATE };