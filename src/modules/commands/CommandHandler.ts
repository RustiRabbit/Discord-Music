import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Client, CommandInteraction, Interaction } from "discord.js";
import { Routes } from "discord-api-types/v9";
import CONFIG from "../../config";

import Command from "./Command";

/*
Command handler class
Takes commands and processes globally, returns at input location
Also responsible for registering commands on start-up
*/
class CommandHandler {
    commands: Array<Command> = [];

    // Register commands with handler
    registerCommands(command: Command) {
        this.commands.push(command);
    }

    // Handle incoming commands
    async handle(interaction: CommandInteraction) {
        this.commands.forEach(command => {
            if(command.commandString == interaction.commandName) {
                command.interactionCreate(interaction);
            }
        })
    }
    
    // Generate JSON data for commands and register with API
    async registerSlashCommands(client: Client) {
        // Generate JSON data for the slash commands
        const data =  this.commands.map(command => {
            if(command.generateSlashCommand() != null) {
                let SlashCommand:SlashCommandBuilder = command.generateSlashCommand() as SlashCommandBuilder;
                return SlashCommand.toJSON();
            }
        })

        // Create the client to register the slash commands
        const rest = new REST({version: '9'}).setToken(CONFIG.TOKEN);
        
        // Loop through each server and register the slash commands
        client.guilds.cache.forEach(guild => {
            if(client.user?.id != undefined) {
                try {
                    rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: data });
                    console.log("[Slash Commands] [Registered] " + guild.name);
                } catch (error) {
                    console.error(error);
                }
                
            }
        })
    }
}

export default CommandHandler;