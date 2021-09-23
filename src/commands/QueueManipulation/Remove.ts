import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, TextBasedChannels } from "discord.js";
import { applicationState } from "../..";
import Command from "../../modules/commands/Command";
import Messages from "../../modules/Messages";
import { VideoInformation } from "../../modules/Search";

class Remove extends Command {
    constructor() {
        super();
        this.setCommandString("remove");
        this.setDescription("Remove a song from the queue at a certain point");

        let indexOption: SlashCommandStringOption = new SlashCommandStringOption();
        indexOption.setName("index");
        indexOption.setDescription("The index of the song within the queue to remove");
        indexOption.required = true;
        this.addStringOption(indexOption);
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        state.setMessageChannel(interaction.channel as TextBasedChannels);

        await interaction.deferReply();

        if (interaction.options.getString("index") != null) {
            //This has to be as any cos otherwise its not happy because it can be null
            if (isNaN(interaction.options.getString("index") as any) != true) {
                let actualIndex:number = Number(interaction.options.getString("index")) - 1; //minus one so in normie number terms
                let successful:false | VideoInformation = state.remove(actualIndex);
                if (successful !== false) {
                    interaction.editReply("**Removed Song:** `" + successful.name + "`");
                } else {
                    interaction.editReply("Queue Position Invalid");
                }
            } else {
                interaction.editReply("Queue Position Must be a Number");
            }

        } else {
            interaction.editReply(Messages.Error.GenericError());
        }
    }
}

export default Remove;