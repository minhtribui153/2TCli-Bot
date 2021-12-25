import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import client from "../..";

export default {
    category: 'Ticketing',
    description: 'Adds an ticket issue to the Ticket Panel',
    permissions: ["ADMINISTRATOR"],
    expectedArgs: "<channel> <messageId> <issue> <emoji>",
    requireRoles: true,
    options: [
        {
            name: 'channel',
            description: "The channel where the ticket panel has been sent",
            type: "CHANNEL",
            required: true,
        },
        {
            name: 'messageid',
            description: "Copy the message ID of the ticket panel and paste it here",
            type: "STRING",
            required: true,
        },
        {
            name: 'issue',
            description: "The name of the issue",
            type: "STRING",
            required: true,
        },
        {
            name: 'emoji',
            description: "The emoji icon of the issue",
            type: "STRING",
            required: true,
        },
    ],
    slash: true,
    guildOnly: true,
    callback: async ({ client, message, interaction, args, guild }) => {
        const channel = (
            message
                ? message.mentions.channels.first()
                : interaction.options.getChannel('channel')
        ) as TextChannel;

        if (!channel || channel.type !== "GUILD_TEXT") {
            return '❌ Please tag a text channel';
        }

        const messageId = interaction.options.getString('messageid') as string;
        const issue = interaction.options.getString('issue') as string;
        const emojiName = interaction.options.getString('emoji') as string;


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
            label: issue,
            value: issue.toLowerCase(),
            description: `Things related to "${issue}" issue`,
            emoji: emojiName,
        }];
        
        let menu = row.components[0] as MessageSelectMenu;

        if (menu) {
            for (const o of menu.options) {
                if (o.value === option[0].value) {
                    return {
                        custom: true,
                        content: `❌ Issue \`${o.label}\` is already part of the Ticket Panel!`,
                        ephemeral: true,
                    }
                }
            }

            menu.addOptions(option);
        } else {
            row.addComponents(
                new MessageSelectMenu()
                    .setCustomId('ticket_issue')
                    .setPlaceholder('Select an issue')
                    .addOptions(option),
            )
        }

        targetMessage.edit({
            components: [row],
        });

        return {
            custom: true,
            content: `✅ Added issue ${issue} to the Ticket Panel!`,
            ephemeral: true,
        }
    }
} as ICommand;