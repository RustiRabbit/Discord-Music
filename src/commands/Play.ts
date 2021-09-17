import {  SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";

// This command joins the vc
class Play extends Command {
    constructor() {
        super();
        this.setCommandString("play");
        this.setDescription("Start the player");


    }

    async interactionCreate(interaction: CommandInteraction) {
    }
}

export default Play;