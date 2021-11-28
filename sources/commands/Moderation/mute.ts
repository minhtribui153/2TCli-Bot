import { User } from "discord.js";
import { ICommand } from "wokcommands";
import PunishmentSchema from "../../models/PunishmentSchema";

export default {
    category: "Moderation",
    description: "Temporarily mutes a user",
    permissions: ["ADMINISTRATOR"],
    requireRoles: true,
    minArgs: 3,
    expectedArgs: "<user> <duration> <reason>",
    slash: "both",
    options: [
        {
            name: "user",
            description: "The user to mute",
            type: "USER",
            required: true,
        },
        {
            name: "duration",
            description: "The duration of the mute",
            type: "STRING",
            required: true,
        },
        {
            name: "reason",
            description: "The reason for the mute",
            type: "STRING",
            required: true,
        }
    ],
    callback: async ({ client, message, interaction, args, member: staff, guild  }) => {
        if (!guild) return {
            custom: true,
            content: "❌ This command can only be used in a server",
            ephemeral: true,
        }

        let userId = args.shift()!;
        const duration = args.shift()!;
        const reason = args.join(" ");
        let user: User | undefined;

        if (message) {
            // Text Command
            user = message.mentions.users?.first();
        } else {
            // Slash Command
            user = interaction.options.getUser("user") as User;
        }

        if (!user) {
            userId = userId.replace(/[<@!>]/g, "");
            user = await client.users.fetch(userId);

            if (!user) return {
                custom: true,
                content: `❌ Could not find user with ID ${userId}`,
                ephemeral: true,
            }
        }

        userId = user.id;

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
                content: "❌ Invalid time format! Example format: `10d` where `d = days`, `h = hours` and `m = minutes`",
                ephemeral: true,
            }
        }

        if (type === "h") {
            time *= 60;
        } else if (type === "h") {
            time *= 60 * 24;
        } else if (type !== "m") {
            return {
                custom: true,
                content: "❌ Please use `m`, `h`, or `d` for minutes, hours and days respectively",
                ephemeral: true,
            }
        }

        const expires: Date = new Date();
        expires.setMinutes(expires.getMinutes() + time);

        const result = await PunishmentSchema.findOne(
            {
                guildId: guild.id,
                userId: userId,
                type: "mute",
            }
        );

        if (result) {
            return {
                custom: true,
                content: "❌ That user is already muted in this server",
                ephemeral: true,
            }
        }

        try {
            const member = await guild.members.fetch(userId);
            if (member) {
                const muteRole = guild.roles.cache.find(r => r.name === "Muted");
                if (!muteRole) {
                    return {
                        custom: true,
                        content: "❌ No role called \"Muted\" in this server, please create one!",
                        ephemeral: true,
                    }
                }

                member.roles.add(muteRole);
            }

            await new PunishmentSchema({
                userId,
                guildId: guild.id,
                staffId: staff.id,
                reason,
                expires,
                type: "mute",
            }).save();
        } catch (ignored) {
            return {
                custom: true,
                content: "❌ Cannot mute that user",
                ephemeral: true,
            }       
        }

        return {
            custom: true,
            content: `✅ <@${userId}> has been muted for \`${duration}\``,
            ephemeral: true,
        }
    }
} as ICommand;