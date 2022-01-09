import { PlayOptions } from "discord-player";
import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Seeks to a specific time in the current track",
    slash: true,
    guildOnly: true,
    options: [
        {
            name: 'duration',
            description: 'The time to seek to (seconds)',
            type: 'INTEGER',
            required: true,
        }
    ],
    callback: async ({ interaction, member }) => {
        const duration = interaction.options.getInteger('duration') as number;

        // Check if user is in a voice channel, if not, return with custom as true, content as "❌ You need to be in a voice channel first", and ephemeral as true
        if (!member?.voice.channelId) {
            return {
                custom: true,
                content: "❌ You need to be in a voice channel first",
                ephemeral: true,
            }
        }

        if (duration < 0) return {
            custom: true,
            content: '❌ You cannot seek to a negative time!',
            ephemeral: true,
        }
        
        const queue = player.getQueue(interaction.guildId);

        if (!queue?.playing) return {
            custom: true,
            content: "❌ No music is currently being played",
            ephemeral: true,
        }

        const ok = await queue.seek(duration);

        console.log(ok);
        
        // Get minutes and seconds from duration
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        return {
            custom: true,
            content: `🔘 Seeked player to ${minutes}:${seconds}`,
            ephemeral: true,
        }
    }
} as ICommand;