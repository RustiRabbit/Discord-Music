import { AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, PlayerSubscription, VoiceConnectionStatus } from "@discordjs/voice";
import { CommandInteraction, VoiceChannel } from "discord.js";
import Command from "../modules/commands/Command";
import VoiceHelper from "../modules/Voice/VoiceHelper";

import ytdl from 'ytdl-core';

class TestPlay extends Command {
    constructor() {
        super();
        this.setCommandString("test");
        this.setDescription("gotta have a test cadet");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let channel = VoiceHelper.GetVoiceChat(interaction);
        if(channel != null) {
            let connection = joinVoiceChannel({
                channelId: channel?.id,
                guildId: channel?.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

            interaction.reply(":thumbsup:");

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log("[Connection State] Connected");

                const input = ytdl("https://www.youtube.com/watch?v=n29jr63R71U&ab_channel=Earyzz", {filter: 'audioonly'}); // Download

                let player = createAudioPlayer(); // Create player system
                const resource = createAudioResource(input); // Create resource
                player.play(resource); // Play resource
                player.on('error', () => {
                    console.log("Found error lol");
                })
                player.on(AudioPlayerStatus.Idle, () => {
                    connection.disconnect();
                })

                connection.subscribe(player); // connect the player to the voice connection
            });

            // Yoinked from the discordjs voice guide
            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    console.log("[Connection State] Ignoring Disconnect")
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    console.log("[Connection State] Destroyed")
                    connection.destroy();
                }
            });

        }
       
    }
}

export default TestPlay;