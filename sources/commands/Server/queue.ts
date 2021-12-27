import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Displays the song queue",
    guildOnly: true,
    slash: true,
    callback: async ({ interaction, member, channel, guild }) => {

        const queue = player.getQueue(interaction.guildId);
        if (!queue?.playing) return {
            custom: true,
            content: "<:red_cross_mark:921691762433613824> No music is currently being played",
            ephemeral: true,
        }

        const currentTrack = queue.current;
        const tracks = queue.tracks.slice(0, 10).map((m, i) => {
            return `${i + 1}. [**${m.title}**](${m.url}) - ${
                m.requestedBy.tag
            }`;
        });

        return {
            custom: true,
            embeds: [
                {
                    title: "Song Queue",
                    description: `${tracks.join("\n")}${
                        queue.tracks.length > tracks.length
                            ? `\n...${
                                queue.tracks.length - tracks.length === 1
                                    ? `${
                                        queue.tracks.length - tracks.length
                                    } more track`
                                    : `${
                                        queue.tracks.length - tracks.length
                                    } more tracks`
                                }`
                            : ""
                    }`,
                    color: "RANDOM",
                    fields: [
                        {
                            name: "Now Playing",
                            value: `🎶 | [**${currentTrack.title}**](${currentTrack.url}) - ${currentTrack.requestedBy.tag}`,
                        },
                    ],
                },
            ],
        }
    }
} as ICommand;