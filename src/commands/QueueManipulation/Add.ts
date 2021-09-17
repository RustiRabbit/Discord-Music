import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";

class Add extends Command {
    constructor() {
        super();
        this.setCommandString("add");
        this.setDescription("Add a song to the queue");

        let nameOption: SlashCommandStringOption = new SlashCommandStringOption();
        nameOption.setName("query");
        nameOption.setDescription("Either a Youtube URL or a search query");
        nameOption.required = true;
        this.addStringOption(nameOption);
    }

    async interactionCreate(interaction: CommandInteraction) {
        if(interaction.options.getString("query") != null) {
            let server = await applicationState.getServer(interaction.guildId as string);
            let state = server.state;

            await interaction.deferReply();

            state.addVideo(interaction.options.getString("query") as string, interaction);
        }
    }
}

export default Add;