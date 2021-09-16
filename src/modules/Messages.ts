/*
Messages object
Holds all responses to commands
Essentially just centralises for ease of access for editing
*/
const Messages = {
    // Search response for playing music/video
    Search: (url: string) => {
        return ":mag_right: Searching for `" + url + "`";
    },

    // Response after successful search
    // DEPRECIATED
    Found: (name: string) => {
        return "Found video `" + name + "`";
    } 
}

export default Messages;