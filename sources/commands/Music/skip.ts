import { QueryType } from "discord-player";
import { Guild, GuildChannelResolvable } from "discord.js";
import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Skips the currently playing song",
    guildOnly: true,
    slash: true,
    callback: async ({ interaction, member, channel, guild }) => {

        if (!member.voice.channelId) {
            return {
                custom: true,
                content: "<:red_cross_mark:921691762433613824> You need to be in a voice channel first",
                ephemeral: true,
            }
        }

        const queue = player.getQueue(interaction.guildId);

        await queue.skip();

        return {
            custom: true,
            content: "⏩ Skipped",
            ephemeral: true,
        }
    }
} as ICommand;