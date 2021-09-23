import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, TextBasedChannels } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";

class Help extends Command {
    constructor() {
        super();
        this.setCommandString("help");
        this.setDescription("Introduction and documentation");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        state.setMessageChannel(interaction.channel as TextBasedChannels);

        interaction.reply({embeds: [Messages.Help.Main()]});
    }
}

export default Help;