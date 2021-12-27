import { Client,  GuildMember, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import TicketSchema from "../models/TicketSchema";
import { createTranscript } from "discord-html-transcripts";
import TicketTranscriptSchema from "../models/TicketTranscriptSchema";

export default (client: Client) => {
    client.on("interactionCreate", (interaction) => {
        if (!interaction.isButton()) return;
        const { guild, customId, channel } = interaction;
        const member = interaction.member as GuildMember;

        const row = (closeButtonDisabled: boolean, lockButtonDisabled: boolean, unlockButtonDisabled: boolean) => new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('close_ticket')
                    .setLabel('Save and Close Ticket')
                    .setStyle('PRIMARY')
                    .setDisabled(closeButtonDisabled)
                    .setEmoji('💾')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('lock_ticket')
                    .setLabel('Lock')
                    .setStyle('SECONDARY')
                    .setDisabled(lockButtonDisabled)
                    .setEmoji('🔒')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('unlock_ticket')
                        .setLabel('Unlock')
                        .setStyle('SUCCESS')
                        .setDisabled(unlockButtonDisabled)
                        .setEmoji('🔓')
                )
        
        if (!member.permissions.has("ADMINISTRATOR") && ['close_ticket', 'lock_ticket', 'unlock_ticket'].includes(customId)) return interaction.reply({
            content: "❌ Only Staff members can use these buttons!",
            ephemeral: true,
        });

        if(!['close_ticket', 'lock_ticket', 'unlock_ticket'].includes(customId)) return;

        const embed = new MessageEmbed()
            .setColor('BLUE');
        
        TicketSchema.findOne({ channelId: channel?.id }, async (err: any, data: any) => {
            if (err) return;
            if (!data) return interaction.reply({
                content: "❌ No data found for this ticket, please delete manually!",
                ephemeral: true,
            });
            switch(customId) {
                case 'lock_ticket':
                    if (data.locked === true) {
                        return interaction.reply({
                            content: "❌ Ticket is already locked!",
                            ephemeral: true,
                        });
                    }
                    await TicketSchema.updateOne({ channelId: channel?.id }, { locked: true });
                    const embed = new MessageEmbed()
                        .setTitle('🔒 | Ticket Locked')
                        .setColor('RED')
                        .setDescription('This ticket is locked for reviewing');
                    interaction.reply({ embeds: [embed] });
                    // interaction.update({ components: [row(false, true, false)] })
                    break;
                case 'unlock_ticket':
                    if (data.locked === false) {
                        return interaction.reply({
                            content: "❌ Ticket is already unlocked!",
                            ephemeral: true,
                        });
                    }
                    await TicketSchema.updateOne({ channelId: channel?.id }, { locked: false });
                    const embed2 = new MessageEmbed()
                        .setTitle('🔓 | Ticket Unlocked')
                        .setColor('GREEN')
                        .setDescription('This ticket is now unlocked');
                    interaction.reply({ embeds: [embed2] });
                    // interaction.update({ components: [row(false, false, true)] })
                    break;
                case 'close_ticket':
                    if (data.closed === true) {
                        return interaction.reply({
                            content: "❌ Ticket is already closed! Please wait for this ticket to be deleted",
                            ephemeral: true,
                        });
                    }

                    const hasTranscript = await TicketTranscriptSchema.findById(guild?.id) as any;
                    if (!hasTranscript) return;

                    const attachment = await createTranscript(channel as TextChannel, {
                        limit: -1,
                        returnBuffer: false,
                        fileName: `${data.type}-${data.ticketId}.html`,
                    });

                    const target = guild?.members.cache.get(data?.memberId);

                    const ch = guild?.channels.cache.get(hasTranscript.channelId) as TextChannel;
                    const msg = await ch?.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(`${target?.user.username}`, target?.user.displayAvatarURL({ dynamic: true }))
                                .setColor('RANDOM')
                                .addField('Transcript Type', `${data.type}`)
                                .addField(`ID`, `${data.ticketId}`)
                        ],
                        files: [attachment]
                    });

                    const row2 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setLabel('See Transcript')
                                .setStyle('LINK')
                                .setEmoji('🔈')
                                .setURL(msg.url)

                        )

                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle(`💾 | Ticket Saved`)
                            .setColor('YELLOW')
                            .setDescription(`The ticket is saved successfully! This ticket will close in 10 seconds.`)
                        ],
                        components: [row2]
                    });
                    let counter = 10;
                    setTimeout(() => {
                        channel?.delete();
                    }, 1000 * counter);
                    
            }
        })
    })
}

export const config = {
    dbName: "TICKET_OPTIONS",
    displayName: "Ticket Options",
}