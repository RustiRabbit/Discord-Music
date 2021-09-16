import {  SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";

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
            // TODO - Validate URL
            let server = await applicationState.getServer(interaction.guildId as string);
            let state = server.state;

            interaction.reply(":mag_right: Searching for `" + interaction.options.getString("url") + "`");

            state.addVideo(interaction.options.getString("url") as string, interaction);

        }
        
    }
}

export default Play;