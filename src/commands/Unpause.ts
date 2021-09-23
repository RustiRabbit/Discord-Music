import { CommandInteraction, TextBasedChannels } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";
import PLAYING_STATUS from "../modules/types/PlayingStatus";
import VoiceHelper from "../modules/Voice/VoiceHelper";

// This command joins the vc
class Unpause extends Command {

    // Constructor (Sets up command logic to run)
    constructor() {
        super();
        this.setCommandString("unpause");
        this.setDescription("Unpause the player");
    }

    // Command logic
    async interactionCreate(interaction: CommandInteraction) {
        // Join Voice Channel
        // Get Current Voice Channel
        let channel = VoiceHelper.GetVoiceChat(interaction);

        // Get state
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        // User not in a voice channel
        if(state.connectionStatus == false) {
            interaction.reply(Messages.Error.NotInVC());
        }  else {
            let connection = await state.start();

            if(connection == PLAYING_STATUS.Playing) {
                interaction.reply(Messages.VC.Unpaused());
            } else {
                interaction.reply(Messages.Error.GenericError());
            }
        }
        
    }
}

export default Unpause;