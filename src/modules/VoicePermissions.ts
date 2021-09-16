import { CommandInteraction } from "discord.js";

// This is a helper file that determins if the user has permissions to do various tasks
const VoicePermissions = {
    UserInVoiceChat: (interaction: CommandInteraction) => {
        let guild = interaction.guild;
        let member = guild?.members.cache.get(interaction.user.id);

        if(member?.voice.channel == null) {
            return false;
        } else {
            return true;
        }
    }
}

export default VoicePermissions;