import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import { SlashCommandStringOption } from "@discordjs/builders";
import Command from "../../modules/commands/Command";

class LoopQueue extends Command {
    constructor() {
        super();
        this.setCommandString("loopqueue");
        this.setDescription("Toggles loop for the queue");
    }

    async interactionCreate(interaction: CommandInteraction) {
        await interaction.deferReply();

        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        // Little goblin function that toggles the loop and returns the value for the message
        let loopState:boolean = state.queue.toggleQueueLoop();
        if (loopState == true) {
            interaction.editReply(":repeat: :white_check_mark: Queue Loop Turned On");
        } else {
            interaction.editReply(":repeat: :x: Queue Loop Turned Off");
        }
    }
}

export default LoopQueue;