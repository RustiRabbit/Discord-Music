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
    }

}

export default Messages;