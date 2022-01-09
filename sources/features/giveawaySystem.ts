import { Client, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, TextChannel } from "discord.js";
import WOKCommands from "wokcommands";
import GiveawaySchema from "../models/GiveawaySchema";

const buttonComponent = (disabled: boolean) => new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel("Enter Giveaway")
            .setCustomId("enter_giveaway")
            .setStyle("PRIMARY")
            .setDisabled(disabled)
            .setEmoji("🎉")
    )

export default (client: Client, instance: WOKCommands) => {
    client.on("interactionCreate", async interaction => {
        if (interaction.isButton()) {
            if (interaction.customId.includes("enter_giveaway")) {
                const { guild, channel } = interaction;
                const giveawayId = interaction.customId.replace("enter_giveaway_", "");
                const giveaway = await GiveawaySchema.findOne({ giveawayId }) as any;
                if (!giveaway) return;
                const appliedMembers = giveaway.appliedMembers as any[];
                const member = guild?.members.cache.get(interaction.user.id) as GuildMember;
                if (!member) return;
                if (appliedMembers.includes(member.id)) return interaction.reply({ content: "❌ You have already entered this giveaway!", ephemeral: true });
                await GiveawaySchema.findOneAndUpdate({ guildId: guild?.id, channelId: channel?.id, giveawayId }, { $push: { appliedMembers: member.id } });
                return interaction.reply({ content: "✅ You have entered the giveaway!", ephemeral: true });
            }
        }
    });

    const checkForExpiredGiveaways = async () => {
        const giveaways = await GiveawaySchema.find({}) as any;
        for (const giveaway of giveaways) {
            const { guildId, channelId, messageId, expiryTime } = giveaway;
            const guild = client.guilds.cache.get(guildId);
            const channel = guild?.channels.cache.get(channelId) as TextChannel;
            const message = channel?.messages.cache.get(messageId) as Message;
            if (!guild || !channel || !message) {
                await GiveawaySchema.findOneAndDelete({ guildId, channelId, messageId });
                return;
            }
            const amount = giveaway.amount as number;
            const members = giveaway.appliedMembers.length;
            let appliedMembers: any[] = giveaway.appliedMembers;
            let selectedWinners = [];
            for (let i = 0; i < amount; i++) {
                const member = giveaway.appliedMembers[Math.floor(Math.random() * members)];
                if (!member) continue;
                appliedMembers = giveaway.appliedMembers.filter((m: any) => m !== member);
                selectedWinners.push(member);
            }
            if (selectedWinners.length !== amount) return;
            if (expiryTime < Date.now()) {
                const giveawayEmbed = new MessageEmbed()
                    .setTitle("🎉 Giveaway Ended! 🎉")
                    .addField('Prize', giveaway.prize)
                    .setDescription(`The giveaway has ended! The winner${giveaway.amount === 1 ? "" : "s"} ${giveaway.amount === 1 ? "is" : "are"}: <@${selectedWinners.join(">, <@")}>`)
                    .setColor("RED");
                await message.edit({ embeds: [giveawayEmbed], components: [buttonComponent(true)] });
                await GiveawaySchema.findOneAndDelete({ guildId, channelId, messageId });
                return;
            }
        }
        setTimeout(checkForExpiredGiveaways, 1000 * 10);
    }
    checkForExpiredGiveaways();
}

export const config = {
    dbName: 'GIVEAWAY_SYSTEM',
    displayName: 'Giveaway System',
}