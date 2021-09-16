import { Client } from "discord.js";
import DiscordServer from "./DiscordServer";
import State from "./State";

class StateManager {
    private servers:Array<DiscordServer>;
    
    constructor() {
        this.servers = [];
    }

    // Scan server list and add to the array
    addServers(client: Client) {
        return new Promise<void>((resolve, reject) => {
            // Clear server List
            this.servers = [];

            // Loop through each server and add to the list
            client.guilds.cache.forEach(guild => {
                let discordServer = new DiscordServer(guild.id, guild.name);
                this.addServer(discordServer);
            });

            resolve();
        })
        
    }

    // Add one specific server
    private addServer(server: DiscordServer) {
        this.servers.push(server);
    }

    getServer(id: string) {
        // Require promise as this could take some time
        return new Promise<DiscordServer>((resolve, reject) => {
            // Loop through the servers, looking for the correct server
            this.servers.forEach(server => {
                if(id == server.id) {
                    resolve(server);
                }
            });
        })
        
    }
}

export default StateManager;