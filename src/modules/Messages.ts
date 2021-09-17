/*
Messages object
Holds all responses to commands
Essentially just centralises for ease of access for editing
*/
const Messages = {
    Search: (url: string) => {
        return ":mag_right: Searching for `" + url + "`";
    },
    Found: (name: string) => {
        return "Found video `" + name + "`";
    },
    NotInVC: () => {
        return "Whoops! Looks like you're not in a voice channel! :flushed:  Try again when you are! :zany_face: :kissing_heart:";
    },
    Left: {
        Manually: () => {
            return ":wave:";
        }
    },
    Error: {
        FailedToJoin: () => {
            return "Failed to join vc";
        }
    }
}

export default Messages;