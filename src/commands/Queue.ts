import { CommandInteraction, MessageEmbed } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";

/*
Checks current queue and returns
*/
class Queue extends Command {
    constructor() {
        super();
        this.setCommandString("queue");
        this.setDescription("Gets the current queue");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        const embed = new MessageEmbed();
        embed.setTitle("Song Queue");

        let content = "";
        for(var i = 0; i < state.queue.length; i++) {
            content += "`" + (i + 1) + ".` " + state.queue[i].infomation?.name + "| `" + state.queue[i].infomation?.length + "`" + "\n\n";
        }

        embed.setDescription(content);

        interaction.reply({embeds: [embed]});
    }
}

export default Queue;