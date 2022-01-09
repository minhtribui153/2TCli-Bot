import { Client, GuildMember, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, Role, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Auto Role',
    description: 'Adds a role to the Auto Role Message',
    permissions: ["ADMINISTRATOR"],
    minArgs: 3,
    maxArgs: 3,
    expectedArgs: "<channel> <messageId> <role>",
    expectedArgsTypes: ["CHANNEL", "STRING", "ROLE"],
    slash: 'both',

    callback: async ({ client, message, interaction, args }) => {
        const channel = (
            message
                ? message.mentions.channels.first()
                : interaction.options.getChannel('channel')
        ) as TextChannel;
                
        if (!channel || channel.type !== "GUILD_TEXT") {
            return '❌ Please tag a text channel';
        }

        const messageId = args[1];

        const role = (
            message
                ? message.mentions.roles.first()
                : interaction.options.getRole('role')
        ) as Role;
        if (!role) {
            return "❌ Unknown Role!";
        }

        const targetMessage = await channel.messages.fetch(messageId, {
            cache: true,
            force: true,
        });
        if (!targetMessage) return "❌ Unknown Message ID!";
        if (targetMessage.author.id !== client.user?.id) {
            return `❌ Please provide a message ID sent by <@${client.user?.id}>`;
        }

        let row = targetMessage.components[0] as MessageActionRow;
        if (!row) {
            row = new MessageActionRow();
        }

        const option: MessageSelectOptionData[] = [{
            label: role.name,
            value: role.id,
        }];

        let menu = row.components[0] as MessageSelectMenu;
        if (menu) {
            for (const o of menu.options) {
                if (o.value === option[0].value) {
                    return {
                        custom: true,
                        content: `❌ <@&${o.value}> role is already part of the Auto Roles Choose!`,
                        allowedMentions: {
                            roles: [],
                        },
                        ephemeral: true,
                    }
                }
            }

            menu.addOptions(option);
            menu.setMaxValues(menu.options.length);
        } else {
            row.addComponents(
                new MessageSelectMenu()
                    .setCustomId('auto_roles')
                    .setMinValues(0)
                    .setMaxValues(1)
                    .setPlaceholder('Select roles you want to add to yourself')
                    .addOptions(option),
            )
        }

        targetMessage.edit({
            components: [row],
        });

        return {
            custom: true,
            content: `✅ Added <@&${role.id}> to the Auto Roles Choose system`,
            allowedMentions: {
                roles: [],
            },
            ephemeral: true,
        }
    }
} as ICommand;