import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";

class Skip extends Command {
    constructor() {
        super();
        this.setCommandString("skip");
        this.setDescription("Skip the current song");
    }

    async interactionCreate(interaction: CommandInteraction) {
        await interaction.deferReply();

        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        if(await state.nextSong() == true) {
            interaction.editReply("Skipped");
        } else {
            interaction.editReply("[Todo - Either could mean error or end of queue /shrug]");
        }
    }
}

export default Skip;