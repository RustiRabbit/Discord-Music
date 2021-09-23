import { bold } from "@discordjs/builders";
import { format } from "date-fns";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { applicationState } from "..";
import Command from "../modules/commands/Command";
import { QUEUE_STATE } from "../modules/PlayingQueue";
import SearchHelper from "../modules/Search";

class NowPlaying extends Command {
    constructor() {
        super();
        this.setCommandString("np");
        this.setDescription("Shows the currently playing song");
    }

    async interactionCreate(interaction: CommandInteraction) {
        let server = await applicationState.getServer(interaction.guildId as string);
        let state = server.state;

        // If the queue is stopped, show empty
        if(state.queue.state == QUEUE_STATE.STOP) {
            const embed = new MessageEmbed();
            embed.setTitle("Now Playing");
            embed.setDescription("Nothing is playing");
            interaction.reply({embeds: [embed]});
        } else { // Otherwise show the infomation
            if(state.queue.currentlyPlaying != null) {
                const embed = new MessageEmbed();
                embed.setTitle("Now Playing");

                const song = state.queue.currentlyPlaying.name;
                const link = state.queue.currentlyPlaying.url;
                const thumbnail = state.queue.currentlyPlaying.thumbnail;

                const duration = SearchHelper.formatVideoTime(state.queue.timeElasped) + "/" + SearchHelper.formatVideoTime(state.queue.currentlyPlaying.length);

                // Add Fields
                embed.addFields(
                    { name: "Currently Playing", value: "[" + song + "]" + "(" + link + ")"},
                    { name: "Position",  value: duration}
                );
                    
                // Add thumbnail
                embed.setThumbnail(thumbnail);
                

                interaction.reply({embeds: [embed]});
            }
        }
    }
}

export default NowPlaying;