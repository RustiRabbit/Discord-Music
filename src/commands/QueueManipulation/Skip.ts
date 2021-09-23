import { CommandInteraction } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";
import Messages from "../../modules/Messages";
import PLAYING_STATUS from "../../modules/types/PlayingStatus";

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

        let nextSong = await state.nextSong(); // Gets the next song state

        if(nextSong == PLAYING_STATUS.Playing) { // Playing next song
            interaction.editReply(Messages.Queue.Skipped());
        } else if(nextSong == PLAYING_STATUS.Empty) { // No next song, queue empty
            interaction.editReply(Messages.Queue.Finished());
        } else if(nextSong == PLAYING_STATUS.Error) { // Error
            interaction.editReply(Messages.Error.GenericError());
        }
    }
}

export default Skip;