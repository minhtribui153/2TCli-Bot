import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import WarnSchema from "../../models/WarnSchema";

export default {
    category: "Moderation",
    description: "Warns a user",
    permissions: ["ADMINISTRATOR"],
    requireRoles: true,
    slash: true,
    guildOnly: true,
    options: [
        {
            name: "add",
            description: "Adds a warning to the user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "user",
                    description: "The user to warn",
                    type: "USER",
                    required: true,
                },
                {
                    name: "reason",
                    description: "The reason for the warning",
                    type: "STRING",
                    required: true,
                }
            ],
        },
        {
            name: "remove",
            description: "Removes a warning from the user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "user",
                    description: "The user to remove the warning from",
                    type: "USER",
                    required: true,
                },
                {
                    name: "id",
                    description: "The warning ID to remove",
                    type: "STRING",
                    required: true,
                }
            ],
        },
        {
            name: "list",
            description: "Lists all warnings for a user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "user",
                    description: "The user to list the warnings for",
                    type: "USER",
                    required: true,
                },
            ],
        },
    ],
    callback: async ({ guild, member: staff, interaction }) => {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const id = interaction.options.getString("id");

        if (subCommand === "add") {
            const warning = await WarnSchema.create({
                userId: user?.id,
                staffId: staff?.id,
                guildId: guild?.id,
                reason,
            });

            const warns = await WarnSchema.find({ userId: user?.id, guildId: guild?.id }) as any;

            user?.send(`⚠️ You have been warned in ${guild?.name} by ${staff?.user.tag}\nReason: \`${reason}\`\nYou now have ${warns.length} warning${warns.length === 1 ? "" : "s"}.`);

            return {
                custom: true,
                content: `✅ Added warning ${warning.id} to <@${user?.id}>`,
                ephemeral: true,
                allowedMentions: {
                    users: [],
                }
            }
        } else if (subCommand === "remove") {
            const warning = await WarnSchema.findByIdAndDelete(id) as any;
            if (!warning) return {
                custom: true,
                content: `❌ Warning ${id} not found in <@${user?.id}>`,
            }
            const warning2 = await WarnSchema.find({ userId: user?.id, guildId: guild?.id });

            user?.send(`✅ A warning has been removed from you in ${guild?.name} by ${staff?.user.tag}\nWarning Reason: \`${warning.reason}\`\nYou now have ${warning2.length} warning${warning2.length === 1 ? "" : "s"}.`);

            return {
                custom: true,
                content: `✅ Removed warning ${warning.id} from <@${user?.id}>`,
                ephemeral: true,
                allowedMentions: {
                    users: [],
                }
            }
        } else if (subCommand === "list") {
            const warnings = await WarnSchema.find({
                userId: user?.id,
                guildId: guild?.id,
            }) as any;

            const embed = new MessageEmbed()
                .setTitle(`⚠️ ${user?.tag} warnings`)
                .setDescription(`User ${user?.username} currently has ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`)
                .setColor("YELLOW")
                .setFooter(`Requested by ${staff?.user.tag}`, staff?.user.displayAvatarURL({ dynamic: true }));
            
            for (const warning of warnings) {
                embed.addField(`**ID** ${warning._id}`, `**Date:** ${warning.createdAt.toLocaleString()}\n**Reason:** ${warning.reason}\n**Staff:** ${staff?.user.tag}`);
            }

            return {
                custom: true,
                embeds: [embed],
                ephemeral: true,
            }
        }
    },
} as ICommand;