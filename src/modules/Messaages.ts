const Messages = {
    Search: (url: string) => {
        return ":mag_right: Searching for `" + url + "`";
    },
    Found: (name: string) => {
        return "Found video `" + name + "`";
    } 
}

export default Messages;