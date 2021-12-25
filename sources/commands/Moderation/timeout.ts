import { GuildMember, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import fetch from "node-fetch";
import ms from 'ms';
import 'dotenv/config';

export default {
    category: 'Moderation',
    description: 'Timeouts a member',
    permissions: ['ADMINISTRATOR'],
    requireRoles: true,
    slash: true,
    guildOnly: true,
    options: [
        {
            name: "target",
            description: "The user to timeout",
            type: "USER",
            required: true,
        },
        {
            name: "duration",
            description: "The duration of the timeout (m,h,d)",
            type: "STRING",
            required: true,
        },
        {
            name: "reason",
            description: "The reason for the timeout",
            type: "STRING",
            required: true,
        }
    ],

    callback: async ({ member, interaction }) => {
        return {
            custom: true,
            content: "This slash command is not properly registered",
            ephemeral: true,
        }
        const target = interaction.options.getMember('target') as GuildMember;
        if (!target) return {
            custom: true,
            content: '❌ Tag someone to timeout!',
            ephemeral: true,
        }

        const duration = interaction.options.getString('duration') as string;
        const reason = interaction.options.getString('reason') as string;

        // Define variables time and type
        let time;
        let type;

        // Do a trycatch statement in case the user inputs an invalid duration
        try {
            const split = duration.match(/\d+|\D+/g);
            time = parseInt(split![0]);
            type = split![1];
        } catch (e) {
            return {
                custom: true,
                content: "❌ Invalid duration format! Example format: `10d` where `d = days`, `h = hours` and `m = minutes`",
                ephemeral: true,
            }
        }

        if (type === "h") {
            time *= 60;
        } else if (type === "d") {
            time *= 60 * 24;
        } else if (type !== "m") {
            return {
                custom: true,
                content: "❌ Please use `m`, `h`, or `d` for minutes, hours and days respectively",
                ephemeral: true,
            }
        }

        const msTime = ms(duration);

        const date = new Date(Date.now() + msTime).toISOString();

        fetch(`https://discord.com/api/guilds/${interaction.guildId}/members/${target.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ communication_disabled_until: date }),
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bot ${process.env.BOT_TOKEN}`,
            }
        })

        return {
            custom: true,
            content: `✅ <@${target.id}> has now received a timeout for \`${duration}\``,
            ephemeral: true,
        }
    }
} as ICommand;