import { Client, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import WOKCommands from "wokcommands";
import TicketChannelSchema from "../models/TicketChannelSchema";
import TicketSchema from "../models/TicketSchema";
import TicketTranscriptSchema from "../models/TicketTranscriptSchema";

export default (client: Client, instance: WOKCommands) => {
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isSelectMenu()) {
            const { guild, member, customId } = interaction;
            if (interaction.customId !== "ticket_issue") return;
            const values = interaction.values;
            const check = await TicketChannelSchema.findById(guild?.id) as any;
            const hasTranscript = await TicketTranscriptSchema.findById(guild?.id) as any;
            if (!check) return interaction.reply({ content: '❌ No Ticket Category set! Please contact your Administrator', ephemeral: true });
            if (!hasTranscript) return interaction.reply({ content: '❌ No Ticket Transcript set! Please contact your Administrator', ephemeral: true });
            
            const ID = Math.floor(Math.random() * 90000) + 10000;
                        
            await interaction.guild?.channels.create(`${values[0]}-${ID}`, {
                type: "GUILD_TEXT",
                parent: check.categoryId as string,
                permissionOverwrites: [
                    {
                        id: member?.user.id,
                        allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                    },
                    {
                        id: guild?.roles.everyone.id as string,
                        deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                    }
                ]
            }).then(async channel => {
                await TicketSchema.create({
                    guildId: guild?.id,
                    memberId: member?.user.id,
                    ticketId: ID,
                    channelId: channel?.id,
                    closed: false,
                    locked: false,
                    type: customId,
                })
                
                const embed = new MessageEmbed()
                    .setAuthor(`${guild?.name}`, `${guild?.iconURL({ dynamic: true })}`)
                    .setTitle(`Ticket: ${ID}`)
                    .setColor('RANDOM')
                    .setDescription(`Hi ${member?.user.username},\nPlease wait patiently for a response from the Staff Team.\nMeanwhile, please describe your issue here.\n\nRegards\n${guild?.me?.user.username}`);
                
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('close_ticket')
                            .setLabel('Save and Close Ticket')
                            .setStyle('PRIMARY')
                            .setEmoji('💾')
                    )
                    .addComponents(
                        new MessageButton()
                            .setCustomId('lock_ticket')
                            .setLabel('Lock')
                            .setStyle('SECONDARY')
                            .setEmoji('🔒')
                    )
                    .addComponents(
                        new MessageButton()
                            .setCustomId('unlock_ticket')
                            .setLabel('Unlock')
                            .setStyle('SUCCESS')
                            .setEmoji('🔓')
                    )
                            
                    channel?.send({ content: `<@${member?.user.id}>`, embeds: [embed], components: [row] });
                    interaction.reply({ content: 'ℹ️ Your ticket has been created!', ephemeral: true });
            });                
        }
    });

    client.on("messageCreate", async (message) => {
        const { guildId, channel: { id: channelId }, member } = message;
        const target = await TicketSchema.findOne({ guildId, channelId, memberId: member?.user?.id });
        if (target && target.locked === true) {
            message.delete();
            const msg = await message.channel.send('❌ Cannot send messages while the ticket is locked!');
            setTimeout(() => {
                msg.delete()
            }, 5000);
        }
    })
}

export const config = {
    dbName: 'INITIAL_TICKET',
    displayName: 'Initial Ticket',
}