import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";

class Pause extends Command {
    constructor() {
        super();
        this.setCommandString("pause");
        this.setDescription("Pause the current song");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        state.pause();

        interaction.reply("Paused");

    }
}

export default Pause;