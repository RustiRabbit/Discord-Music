 import { underscore } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { VideoInformation} from "./Search";

enum QUEUE_STATE {
    PLAY = 0,
    PAUSE = 1,
    STOP = 2
}

class PlayingQueue {
    private state_: QUEUE_STATE; // Queue Status
    private currentlyPlaying_: VideoInformation | null; // Currently Playing Video
    private duration: Duration;
    private list_:Array<VideoInformation>; // Queue list

    constructor() {
        this.state_ = QUEUE_STATE.STOP;
        this.currentlyPlaying_ = null;
        this.duration = new Duration();
        this.list_ = [];
    }

    // Queue Modification
    addVideo(video: VideoInformation) {
        this.list_.push(video);
    }

    // Generates a queue message, returns a message embed
    generateQueueMessage() {
        const Embed = new MessageEmbed();
        Embed.setTitle("Song Queue");

        let message = "";
        
        // Check Curently Playing
        if(this.currentlyPlaying_ != null) {
            message += underscore("Now Playing:") + "\n [" + this.currentlyPlaying_.name + "]" + "(" + this.currentlyPlaying_.url + ") | " + "`" + this.currentlyPlaying_.displayLength + "`\n";
        }

        if(this.list_.length != 0) {
            message += underscore("Next:") + "\n";
        }

        for(var i = 0; i < this.list_.length; i++) {
            message += "`" + (i+1) + ".` " + "[" + this.list_[i].name + "](" + this.list_[i].url + ") | `" + this.list_[i].displayLength + "`" + "\n";
        }

        Embed.setDescription(message);

        return Embed;
    }

    // Done when a song has finished played
    finished()  {
        this.currentlyPlaying_ = null;
        this.state_ = QUEUE_STATE.STOP;
        this.duration.reset();
    }

    // Pause
    pause() {
        this.state_ = QUEUE_STATE.PAUSE;
        this.duration.stop();
    }

    unpause() {
        this.state_ = QUEUE_STATE.PLAY;
        this.duration.start();
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

            // Reset the duration
            this.duration.reset();

            return this.currentlyPlaying_;
        }
    }

    get state() {
        return this.state_;
    }

    get timeElasped() {
        return this.duration.timeElasped;
    }

    get currentlyPlaying() {
        return this.currentlyPlaying_;
    }

}

class Duration {
    private time: number;
    private count: boolean;

    constructor() {
        this.count = false;
        this.time = 0;

        setInterval(() => {
            if(this.count == true) {
                this.time++;
            }
        }, 1000)

    }

    reset() {
        this.time = 0;
        this.count = false;
    }

    start() {
        this.count = true;
    }

    stop() {
        this.count = false;
    }

    get timeElasped() {
        return this.time;
    }
}

export default PlayingQueue;
export { QUEUE_STATE };