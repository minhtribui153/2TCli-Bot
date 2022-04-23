import { getLyrics, substring, createResponse } from "../../functions/music";
import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Displays lyrics for the currently playing/specific song",
    guildOnly: true,
    slash: true,
    options: [
        {
            name: "query",
            description: "The specific song to check for the lyrics",
            type: "STRING",
            required: false
        }
    ],
    callback: async ({ interaction, member, channel, guild }) => {
        interaction.deferReply();

        const title = interaction.options.getString("query");
        const sendLyrics = (songTitle: string) => {
            return createResponse(songTitle)
                .then((res) => {
                    interaction.followUp(res);
                })
                .catch((err) => {
                    
                });
        };
    
        if (title) return sendLyrics(title);

        const queue = player.getQueue(interaction.guildId!);
        if (!queue?.playing) return {
            custom: true,
            content: "❌ No music is currently being played",
            ephemeral: true,
        }

        return sendLyrics(queue.current.title);
    }
} as ICommand;