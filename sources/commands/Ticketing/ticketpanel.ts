import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import TicketSchema from "../../models/TicketSchema";

export default {
    category: "Ticketing",
    description: "Creates a support ticketing panel",
    slash: "both",
    requireRoles: true,
    guildOnly: true,
    callback: async ({ interaction, guild }) => {
        const embed = new MessageEmbed()
            .setAuthor(`${guild?.name} | Server Ticketing`, `${guild?.iconURL({ dynamic: true })}`)
            .setColor("BLUE")
            .setDescription('Open a ticket with issues listed here:');
        return {
            custom: true,
            embeds: [embed],
        }
    }
} as ICommand;