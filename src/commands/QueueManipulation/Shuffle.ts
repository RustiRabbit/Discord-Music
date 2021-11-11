import { CommandInteraction, MessageEmbed } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";

/*
Checks current queue and returns
*/
class Shuffle extends Command {
    constructor() {
        super();
        this.setCommandString("shuffle");
        this.setDescription("Randomly shuffles the queue");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        let response = state.queue.shuffleQueue();

        interaction.reply("Queue has been shuffled");
    }
}

export default Shuffle;