import { SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/Command";

class GetName extends Command {
    constructor() {
        super();
        this.setCommandString("getname");
        this.setDescription("Gets the bots current name!");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        interaction.reply("My name is " + state.name + " :wave:");
    }

}

class SetName extends Command {
    constructor() {
        super();
        this.setCommandString("setname");
        this.setDescription("My name can change!");

        // Inputs
        let nameOption: SlashCommandStringOption = new SlashCommandStringOption();
        nameOption.setName("name");
        nameOption.setDescription("What do you want my new name to be");
        nameOption.required = true;
        this.addStringOption(nameOption);
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        state.setName(interaction.options.getString("name") as string); // The casting can be done because the command is required
        interaction.reply("Name changed");        
    }
}

export { GetName, SetName };