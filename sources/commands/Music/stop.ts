import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Stops the music, clears the queue, and leaves the voice channel",
    slash: true,
    guildOnly: true,
    callback: async ({ interaction, member }) => {
        const queue = player.getQueue(interaction.guildId);
        if (!queue) {
            return {
                custom: true,
                content: "<:red_cross_mark:921691762433613824> Already stopped the music and left the voice channel",
                ephemeral: true,
            }
        }
        queue.clear();
        queue.skip();

        return {
            custom: true,
            content: '✅ Stopped the music and left the voice channel',
            ephemeral: true,
        }
    }
} as ICommand;