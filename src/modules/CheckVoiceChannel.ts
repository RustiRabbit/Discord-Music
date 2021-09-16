import { CommandInteraction } from "discord.js";

// This file checks that the user is in a voice channel
function GetVoiceChannel(interaction: CommandInteraction) {
    let guild = interaction.guild;
    let memeber = guild?.members.cache.get(interaction.user.id);

    // Check if the user is in a voice channel
    if(memeber?.voice.channel == null) {
        return null;
    } else {
        return memeber.voice.channel;
    }
}

export default GetVoiceChannel;