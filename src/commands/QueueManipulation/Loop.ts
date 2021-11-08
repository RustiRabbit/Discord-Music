import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import { SlashCommandStringOption } from "@discordjs/builders";
import Command from "../../modules/commands/Command";

class Loop extends Command {
    constructor() {
        super();
        this.setCommandString("loop");
        this.setDescription("Toggles loop for the current song");
    }

    async interactionCreate(interaction: CommandInteraction) {
        await interaction.deferReply();

        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        // Little goblin function that toggles the loop and returns the value for the message
        let loopState:boolean = state.queue.toggleLoop();
        if (loopState == true) {
            interaction.editReply(":repeat_one: :white_check_mark: Loop Turned On");
        } else {
            interaction.editReply(":repeat_one: :x: Loop Turned Off");
        }
    }
}

export default Loop;