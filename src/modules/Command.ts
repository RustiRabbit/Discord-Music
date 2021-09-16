import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, Options } from "discord.js";

class Command {
    commandString: string | null;
    description: string | null;
    stringOption: Array<SlashCommandStringOption> = [];

    constructor() {
        this.commandString = null;
        this.description = null;
    }

    protected setCommandString(name: string) {
        this.commandString = name;
    }

    protected setDescription(description: string) {
        this.description = description;
    }

    protected addStringOption(option: SlashCommandStringOption) {
        this.stringOption.push(option);
    }

    interactionCreate(interaction: CommandInteraction) {
        throw new Error("Interaction create handler not implemented for: " + interaction.commandName);
    }

    generateSlashCommand(): SlashCommandBuilder | null {
        if(this.commandString != null && this.description != null) {
            let SlashCommand = new SlashCommandBuilder().setName(this.commandString).setDescription(this.description);
            this.stringOption.forEach(option => {
                SlashCommand.addStringOption(option);
            })
            return SlashCommand;
        }
        return null;
    }
}

/*class HelloWorld extends Command {
    constructor() {
        super();
        this.setCommandString("hello");
        this.setDescription("The First Test Command");
        
        let option: SlashCommandStringOption = new SlashCommandStringOption();
        option.setName("name");
        option.required = true;
        option.setDescription("Enter ur name");
        this.addStringOption(option);

    }

    interactionCreate(interaction: CommandInteraction) {
        interaction.reply("Hello " + interaction.options.getString("name"));
    }
}*/

export default Command;
