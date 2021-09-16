import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Client, CommandInteraction, Interaction } from "discord.js";
import { Routes } from "discord-api-types/v9";
import CONFIG from "../../config";

import Command from "./Command";

class CommandHandler {
    commands: Array<Command> = [];

    registerCommands(command: Command) {
        this.commands.push(command);
    }

    async handle(interaction: CommandInteraction) {
        this.commands.forEach(command => {
            if(command.commandString == interaction.commandName) {
                command.interactionCreate(interaction);
            }
        })
    }

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