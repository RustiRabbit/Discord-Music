import { channelMention, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, Message, TextBasedChannels } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";
import Messages from "../../modules/Messages";
import VoiceHelper from "../../modules/Voice/VoiceHelper";

class Play extends Command {
    constructor() {
        super();
        this.setCommandString("play");
        this.setDescription("Add a song to the queue");

        let nameOption: SlashCommandStringOption = new SlashCommandStringOption();
        nameOption.setName("query");
        nameOption.setDescription("Either a Youtube URL or a search query");
        nameOption.required = true;
        this.addStringOption(nameOption);
    }

    async interactionCreate(interaction: CommandInteraction) {
        if(interaction.options.getString("query") != null) {
            let server = await applicationState.getServer(interaction.guildId as string);
            let state = server.state;

            state.setMessageChannel(interaction.channel as TextBasedChannels);

            await interaction.deferReply();

            let channel = VoiceHelper.GetVoiceChat(interaction);
            if(channel != null) {
                if(await state.addVideo(interaction.options.getString("query") as string, interaction) == true) { // Only join if the video adding was sucessful
                    state.connectAudio(channel);
                    state.start();
                }

            } else {
                interaction.editReply(Messages.Error.NotInVC());
            }

            
        }
    }
}

export default Play;