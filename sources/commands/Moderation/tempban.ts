import { User } from "discord.js";
import { ICommand } from "wokcommands";
import PunishmentSchema from "../../models/PunishmentSchema";

export default {
    category: "Moderation",
    description: "Temporarily bans a user",
    permissions: ["ADMINISTRATOR"],
    requireRoles: true,
    minArgs: 3,
    expectedArgs: "<user> <duration> <reason>",
    slash: "both",
    options: [
        {
            name: "user",
            description: "The user to ban",
            type: "USER",
            required: true,
        },
        {
            name: "duration",
            description: "The duration of the ban",
            type: "STRING",
            required: true,
        },
        {
            name: "reason",
            description: "The reason for the ban",
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
                type: "ban",
            }
        );

        if (result) {
            return {
                custom: true,
                content: "❌ That user is already banned in this server",
                ephemeral: true,
            }
        }

        try {
            await guild.members.ban(userId, { reason: reason });

            await new PunishmentSchema({
                userId,
                guildId: guild.id,
                staffId: staff.id,
                reason,
                expires,
                type: "ban",
            }).save();
        } catch (ignored) {
            return {
                custom: true,
                content: "❌ Cannot ban that user",
                ephemeral: true,
            }       
        }

        return {
            custom: true,
            content: `✅ <@${userId}} has been banned for \`${duration}\``,
            ephemeral: true,
        }
    }
} as ICommand;