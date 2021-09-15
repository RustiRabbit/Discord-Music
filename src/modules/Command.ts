import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

class Command {
    commandString: string | null;
    description: string | null;

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

    interactionCreate(interaction: CommandInteraction) {
        throw new Error("Interaction create handler not implemented for: " + interaction.commandName);
    }

    generateSlashCommand(): SlashCommandBuilder | null {
        if(this.commandString != null && this.description != null) {
            return new SlashCommandBuilder().setName(this.commandString).setDescription(this.description);
        }
        return null;
    }
}

class HelloWorld extends Command {
    constructor() {
        super();
        this.setCommandString("hello");
        this.setDescription("The First Test Command");
    }

    interactionCreate(interaction: CommandInteraction) {
        interaction.reply("Hello World");
    }


}

export default Command;
export { HelloWorld };