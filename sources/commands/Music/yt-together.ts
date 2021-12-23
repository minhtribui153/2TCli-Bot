import { ICommand } from "wokcommands";
import { joinVoiceChannel } from "@discordjs/voice";
import fetch from "node-fetch";
import { MessageEmbed } from "discord.js";
import discordTogether from '../../music/discordTogether';

export default {
    category: "Music",
    description: "Create a Youtube Together session",
    slash: true,
    guildOnly: true,
    callback: async ({ interaction, member }) => {

        if (!member.voice.channelId) {
            return {
                custom: true,
                content: "<:red_cross_mark:921691762433613824> You need to be in a voice channel first",
                ephemeral: true,
            }
        }

        const channel = member?.voice.channel;

        discordTogether.createTogetherCode(channel?.id as string, "youtube")
            .then(x => {
                const embed = new MessageEmbed()
                    .setTitle('<:YouTube:921283491344314368> YouTube Together Session')
                    .setDescription(`[Click here](${x.code}) to join YouTube Together`)
                    .setColor("RED");
                
                interaction.reply({ embeds: [embed] });
            })
    }
} as ICommand;