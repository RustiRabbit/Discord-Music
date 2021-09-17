import { CommandInteraction, MessageEmbed } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";

/*
Checks current queue and returns
*/
class Queue extends Command {
    constructor() {
        super();
        this.setCommandString("queue");
        this.setDescription("Gets the current queue");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        let embed = state.queue.generateQueueMessage();

        interaction.reply({embeds: [embed]});
    }
}

export default Queue;