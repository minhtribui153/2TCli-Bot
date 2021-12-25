import { TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import TicketTranscriptSchema from "../../models/TicketTranscriptSchema";

export default {
    category: "Ticketing",
    description: "Sets a Ticket Transcript channel",
    slash: true,
    options: [
        {
            name: 'channel',
            description: "The channel to set",
            type: "CHANNEL",
            required: true,
        }
    ],
    requireRoles: true,
    guildOnly: true,
    callback: async ({ interaction, guild }) => {
        const channel = interaction.options.getChannel('channel') as TextChannel;


        await TicketTranscriptSchema.findByIdAndUpdate(guild?.id, {
            channelId: channel.id,
        }, {
            upsert: true,
        })

        return {
            custom: true,
            content: `✅ Transcript channel set to channel <#${channel.id}>`,
            ephemeral: true,
        }
    }
} as ICommand;