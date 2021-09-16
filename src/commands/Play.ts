import {  SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import CheckVoiceChannel from "../modules/CheckVoiceChannel";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";

class Play extends Command {
    constructor() {
        super();
        this.setCommandString("play");
        this.setDescription("Play a song");

        let urlOption:SlashCommandStringOption = new SlashCommandStringOption();
        urlOption.setName("url");
        urlOption.setDescription("Enter a youtube URL");
        urlOption.required = true;
        this.addStringOption(urlOption);
    }

    async interactionCreate(interaction: CommandInteraction) {
        if(interaction.options.getString("url") != null) {
            // Check that the user is in a voice channel
            if(CheckVoiceChannel(interaction) == null) {
                interaction.reply(Messages.NotInVC());
            } else {
                let server = await applicationState.getServer(interaction.guildId as string);
                let state = server.state;
    
                interaction.reply(Messages.Search(interaction.options.getString("url") as string));
    
                state.addVideo(interaction.options.getString("url") as string, interaction);
            }

           
        }
    }
}

export default Play;