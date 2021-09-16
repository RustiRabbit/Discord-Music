import {  SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";
import VoicePermissions from "../modules/Voice/VoicePermissions";

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
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        // Check if the user is in a voice chat
        if (VoicePermissions.UserInVoiceChat(interaction) == null) {
            interaction.reply(Messages.NotInVC());
            return;
        } 
    
        interaction.reply(Messages.Search(interaction.options.getString("url") as string));
    
        state.addVideo(interaction.options.getString("url") as string, interaction);
    }
}

export default Play;