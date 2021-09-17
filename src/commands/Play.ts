import { CommandInteraction, TextBasedChannels } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import Messages from "../modules/Messages";
import VoiceHelper from "../modules/Voice/VoiceHelper";

// This command joins the vc
class Play extends Command {

    // Constructor (Sets up command logic to run)
    constructor() {
        super();
        this.setCommandString("play");
        this.setDescription("Start the player");
    }

    // Command logic
    async interactionCreate(interaction: CommandInteraction) {
        // Join Voice Channel
        // Get Current Voice Channel
        let channel = VoiceHelper.GetVoiceChat(interaction);

        // User not in a voice channel
        if(channel == null) {
            interaction.reply(Messages.NotInVC());
            return;
        }

        // Otherwise continue and join
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        state.setMessageChannel(interaction.channel as TextBasedChannels);

        if(await state.connectAudio(channel) == true) {
            interaction.reply(":thumbsup:");
        } else {
            interaction.reply(":x: Failed to join vc");
        }
    }
}

export default Play;