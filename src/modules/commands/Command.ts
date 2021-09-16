import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, Options } from "discord.js";

/*
Base command class to extend for writing commands
Acts as a default to build off in other files
*/
class Command {
    commandString: string | null;
    description: string | null;
    stringOption: Array<SlashCommandStringOption> = [];

    constructor() {
        this.commandString = null;
        this.description = null;
    }

    // Set name of command on user end
    protected setCommandString(name: string) {
        this.commandString = name;
    }

    // Set description of command on user end
    protected setDescription(description: string) {
        this.description = description;
    }

    // Add parameter to command
    protected addStringOption(option: SlashCommandStringOption) {
        this.stringOption.push(option);
    }

    // Default interaction for command
    // In extended commands, logic is places here. This is default for no logic in command
    interactionCreate(interaction: CommandInteraction) {
        throw new Error("Interaction create handler not implemented for: " + interaction.commandName);
    }

    // Generate slash command
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
