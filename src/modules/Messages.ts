import { MessageEmbed } from "discord.js";
/*
Messages object
Holds all responses to commands
Essentially just centralises for ease of access for editing
*/
const Messages = {
    Error: {
        FailedToJoinVC: () => {
            return "Failed to join the vc";
        },
        PlayerError: () => {
            return "The Audio Player returned an error that interrupted playing";
        },
        NotInVC: () => {
            return "Not in a voice chat";
        },
        ErrorParsingSong: () => {
            return "Error: Parsing Song";
        },
        NothingToPlay: () => {
            return "Nothing to play";
        },
        GenericError: () => {
            return "Error";
        }
    },
    Add: {
        Search: (term: string) => {
            return ":mag_right: Searching for `" + term + "`";
        },
        Found: (term: string) => {
            return "Found video `" + name + "`";
        }
    },
    Queue: {
        Empty: () => {
            return "Queue Empty";
        },
        Skipped: () => {
            return "Skipped";
        },
        Finished: () => {
            return "Queue Finished";
        },
        Cleared: () => {
            return "Queue has been cleared";
        }    
    },
    VC: {
        Join: () => {
            return ":thumbsup:";
        },
        Leave: () => {
            return ":wave:";
        },
        Unpaused: () => {
            return "Unpaused";
        },
        Paused: () => {
            return "Paused";
        }
    },
    Help: {
        Main: () => {
            let helpEmbed:MessageEmbed = new MessageEmbed();
            
            helpEmbed.setTitle("Help");
            helpEmbed.addField("Hi! :wave:", "I'm a music bot for personal use to replace Rythm and Groovy!");
            helpEmbed.addField("Commands",
            "`Play (Name/Url)` - Adds a song to the queue and joins the voice channel of the user\n" +
            "`Pause` - Pauses the player\n" +
            "`Unpause` - Unpauses the player\n" +
            "`Queue` - Displays the currently queued songs\n" +
            "`Remove (Index)` - Removes a song in the queue at the provided spot\n" +
            "`Skip` - Skips the currently playing song\n" +
            "`Np` - Displays the position within the currently playing song\n" +
            "`Clear` - Clears the queue and currently playing song\n" +
            "`Disconnect` - Disconnects the player"
            );

            return helpEmbed;
        }
    }

}

export default Messages;