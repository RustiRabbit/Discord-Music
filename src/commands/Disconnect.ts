import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";

class Disconnect extends Command {
    constructor() {
        super();
        this.setCommandString("disconnect");
        this.setDescription("Leave the vc");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;
        
        await interaction.deferReply();

        await state.disconnectAudio();

        interaction.editReply(":wave:");
    }
}

export default Disconnect;