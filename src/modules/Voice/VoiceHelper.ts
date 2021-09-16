import { CommandInteraction } from "discord.js";

const VoiceHelper = {
    GetVoiceChat: (interaction: CommandInteraction) => {
        let guild = interaction.guild;
        let member = guild?.members.cache.get(interaction.user.id);

        if(member?.voice.channel == null) {
            return null;
        } else {
            return member.voice.channel;
        }
    }
}

export default VoiceHelper;