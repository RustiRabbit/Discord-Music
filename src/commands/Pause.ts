import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";

class Pause extends Command {
    constructor() {
        super();
        this.setCommandString("pause");
        this.setDescription("Pause the current song");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        if(state.connectionStatus == false) {
            interaction.reply(Messages.Error.NotInVC());
        } else {
            state.pause();
            interaction.reply(Messages.VC.Paused());
        }


    }
}

export default Pause;