import { User } from "discord.js";
import { ICommand } from "wokcommands";
import PunishmentSchema from "../../models/PunishmentSchema";

export default {
    category: "Moderation",
    description: "Temporarily unmutes a user",
    permissions: ["ADMINISTRATOR"],
    requireRoles: true,
    minArgs: 1,
    expectedArgs: "<user>",
    slash: "both",
    options: [
        {
            name: "user",
            description: "The user to unmute",
            type: "USER",
            required: true,
        },
    ],
    callback: async ({ client, message, interaction, args, member: staff, guild}) => {
        if (!guild) return {
            custom: true,
            content: "❌ This command can only be used in a server",
            ephemeral: true,
        }

        let userId = args.shift()!;
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

        const mutedRole = guild.roles.cache.find(r => r.name === "Muted");

        if (!mutedRole) return {
            custom: true,
            content: "❌ Could not find role \"Muted\"",
        }

        const data = await PunishmentSchema.find(
            {
                guildId: guild.id,
                userId: userId,
                type: "mute",
            }
        );

        

        // If no data return
        if (!data.length) return {
            custom: true,
            content: `❌ <@${userId}> is not muted`,
            ephemeral: true,
        }
        const target = guild.members.cache.get(userId);
        target?.roles.remove(mutedRole);

        // Unmute user
        await PunishmentSchema.deleteMany(
            {
                guildId: guild.id,
                userId: userId,
                type: "mute",
            }
        );

        return {
            custom: true,
            content: `✅ <@${userId}> has been unmuted`,
            ephemeral: true,
        }
    }
} as ICommand;