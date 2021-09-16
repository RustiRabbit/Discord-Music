import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";

class Leave extends Command {
    constructor() {
        super();
        this.setCommandString("leave");
        this.setDescription("Leave the server");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        await interaction.deferReply(); // Delay message response

        await state.disconnect();

        await interaction.editReply(Messages.Left.Manually());
    }
}

export default Leave;