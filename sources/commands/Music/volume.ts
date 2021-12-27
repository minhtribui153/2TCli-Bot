import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Sets/Check the volume of the music player",
    guildOnly: true,
    slash: true,
    options: [
        {
            name: 'level',
            description: 'The volume level (0-100)%',
            type: 'INTEGER',
            required: false,
        }
    ],
    callback: async ({ interaction }) => {

        const volumePercentage = interaction.options.getInteger("level") as number;
        const queue = player.getQueue(interaction.guildId);
        if (!queue?.playing) return {
            custom: true,
            content: "❌ No music is currently being played",
            ephemeral: true,
        }
        
        if (!volumePercentage) { return {
            custom: true,
            content: `ℹ️ The current volume is \`${queue.volume}%\``
        }
        } else if (volumePercentage <= 0 || volumePercentage >= 100) {
            return {
                custom: true,
                content: "❌ Set the volume from (0-100) instead!",
                ephemeral: true,
            }
        }
        
        await queue.setVolume(volumePercentage);

        return {
            custom: true,
            content: `✅ Volume has been set to \`${volumePercentage}%\``,
            ephemeral: true,
        }
    }
} as ICommand;