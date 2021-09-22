import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";
import Messages from "../../modules/Messages";

class Clear extends Command {
    constructor() {
        super();
        this.setCommandString('clear');
        this.setDescription("Clears the entire queue");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        // Request clear
        state.clearQueue();

        // Reply
        interaction.reply(Messages.Queue.Cleared());

    }
}

export default Clear;