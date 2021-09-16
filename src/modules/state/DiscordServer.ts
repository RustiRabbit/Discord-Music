import State from "./State";

/*
Server class
For holding information about servers bot is in
*/
class DiscordServer {
    private id_: string;
    private name_: string;
    state: State;

    constructor(id: string, name: string) {
        this.id_ = id;
        this.name_ = name;
        this.state = new State();
    } 

    get id() {
        return this.id_;
    }

    get name() {
        return this.name_;
    }
}

export default DiscordServer;