import { channelMention, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, Message, TextBasedChannels } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";
import Messages from "../../modules/Messages";
import VoiceHelper from "../../modules/Voice/VoiceHelper";

class Add extends Command {
    constructor() {
        super();
        this.setCommandString("add");
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
                await state.addVideo(interaction.options.getString("query") as string, interaction);
        
                state.connectAudio(channel);
                state.start();
            } else {
                interaction.editReply(Messages.NotInVC());
            }

            
        }
    }
}

export default Add;