import { TeamMemberMembershipState } from "discord-api-types";
import { CommandInteraction } from "discord.js";

// This is a helper file that determins if the user has permissions to do various tasks
const VoicePermissions = {
    UserInVoiceChat: (interaction: CommandInteraction) => {
        // Checks that the user is in a voice chat, and if they are, responds with the channel id
        let guild = interaction.guild;
        let member = guild?.members.cache.get(interaction.user.id);

        if(member?.voice.channel == null) {
            return null;
        } else {
            return member.voice.channelId;
        }
    },
}

export default VoicePermissions;