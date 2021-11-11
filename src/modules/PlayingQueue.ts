 import { codeBlock, underscore } from "@discordjs/builders";
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
    public loop_:boolean = false;
    private loopQueue_:boolean = false;

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

    // Removes every video in the queue
    clear() {
        this.list_ = []; // Clear the list
        this.currentlyPlaying_ = null; // Clear currently playing
        this.state_ = QUEUE_STATE.STOP; // Set the state to stop
    }

    // Shuffle Queue
    shuffleQueue() {
        this.list_ = this.list_
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
    }

    // Generates a queue message, returns a message embed
    generateQueueMessage() {
        const Embed = new MessageEmbed();
        Embed.setTitle("Song Queue");

        let message = "";

        let large = false; // If this equals true, it means that the queue is large enough to need multiple pages

        // Check Curently Playing
        if(this.currentlyPlaying_ != null) {
            message += underscore("Now Playing:") + "\n [" + this.currentlyPlaying_.name + "]" + "(" + this.currentlyPlaying_.url + ") | " + "`" + this.currentlyPlaying_.displayLength + "`\n";
        }

        // Add whats coming up next
        if(this.list_.length != 0) {
            message += underscore("Next:") + "\n";
        }

        // Add the actual queue
        for(var i = 0; i < this.list_.length; i++) {
            let content = "`" + (i+1) + ".` " + "[" + this.list_[i].name + "](" + this.list_[i].url + ") | `" + this.list_[i].displayLength + "`" + "\n";
            if(message.length + content.length < 1900) {
                message += content
            } else {
                large = true;
            }
        }

        // Add the large message
        if(large == true) {
            message += "The queue is too large to fully display";
        }

        // If the queue is empty, then show a message
        if(this.list_.length == 0 && this.currentlyPlaying_ == null) {
            message += "Queue is curently empty, use `/play` to add a song to the queue";
        }

        Embed.setDescription(message);
        Embed.addField("Song Loop", this.loop_ ? ":white_check_mark: " : ":x:", true);
        Embed.addField("Queue Loop", this.loopQueue_ ? ":white_check_mark: " : ":x:", true);

        return Embed;
    }

    // Done when a song has finished played
    finished()  {
        if (this.loop_ === false) {
            this.currentlyPlaying_ = null;
        }
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

    remove(index: number) {
        if (index < this.list_.length && index > -1) {
            let atIndex = this.list_[index];
            this.list_.splice(index, 1);
            return atIndex;
        } else {
            return false;
        }
    }

    // Toggles individual song loop
    toggleLoop() {
        if (this.loop_ === false) {
            this.loop_ = true;
            return true;
        } else {
            this.loop_ = false;
            return false;
        }
    }

    // Toggles queues loop
    toggleQueueLoop() {
        if (this.loopQueue_ === false) {
            this.loopQueue_ = true;
            return true;
        } else {
            this.loopQueue_ = false;
            return false;
        }
    }

    // Disable the loop - like me :)
    disableLoop() {
        this.loop_ = false;
    }

    // Gets the next song
    getSong() {
        // No songs in queue - return null, handled by nextSong in the state class
        // 8/11/21 added the loop check so the vile gremlin doesnt keep voiding my damn loop
        if(this.list_.length == 0 && this.loop_ == false) {
            this.currentlyPlaying_ = null;
            this.state_ = QUEUE_STATE.STOP;
            return null;
        } else { // Songs to work with
            if (this.loop_ == false || this.currentlyPlaying_ == null) {
                this.currentlyPlaying_ = this.list_[0]; // Sets currently playing song
                if (this.loopQueue_ == false) {
                    this.list_.shift(); // Removes the song from the queue (so it doesn't get played again)
                } else {
                    this.list_.push(this.list_[0]);
                    this.list_.shift();
                }
                
            }

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