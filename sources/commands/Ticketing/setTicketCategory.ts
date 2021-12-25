import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import TicketChannelSchema from "../../models/TicketChannelSchema";

export default {
    category: "Ticketing",
    description: "Sets a Ticket Category",
    slash: true,
    options: [
        {
            name: 'categoryid',
            description: "The category ID of a category to set",
            type: "STRING",
            required: true,
        }
    ],
    requireRoles: true,
    guildOnly: true,
    callback: async ({ interaction, guild }) => {
        const categoryId = interaction.options.getString('categoryid') as string;

        const check = await TicketChannelSchema.findByIdAndUpdate(guild?.id, {
            categoryId,
        }, {
            upsert: true,
        })

        return {
            custom: true,
            content: `✅ Ticket category set to category with ID ${interaction.options.getString("categoryid") as string}`,
            ephemeral: true,
        }
    }
} as ICommand;