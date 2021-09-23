import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";

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

        let disconnect = await state.disconnectAudio(); // If true - disconnected, if false - not in a vc

        if(disconnect == true) {
            interaction.editReply(Messages.VC.Leave());
        } else {
            interaction.editReply(Messages.Error.NotInVC());
        }

    }
}

export default Disconnect;