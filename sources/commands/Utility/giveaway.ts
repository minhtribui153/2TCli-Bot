import { MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import GiveawaySchema from "../../models/GiveawaySchema";


const buttonComponent = (disabled: boolean, giveawayId: string) => new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setLabel("Enter Giveaway")
            .setCustomId(`enter_giveaway_${giveawayId}`)
            .setStyle("PRIMARY")
            .setDisabled(disabled)
            .setEmoji("🎉")
    )

export default {
    category: "Utility",
    description: "Creates a giveaway",
    slash: true,
    guildOnly: true,
    options: [
        {
            name: "channel",
            description: "The channel to create the giveaway in",
            type: "CHANNEL",
            required: true,
        },
        {
            name: "duration",
            description: "The time to run the giveaway for (d, h, m)",
            type: "STRING",
            required: true,
        },
        {
            name: "prize",
            description: "The prize to giveaway",
            type: "STRING",
            required: true,
        },
        {
            name: "amount",
            description: "The amount of winners for the giveaway",
            type: "INTEGER",
            required: true,
        }
    ],
    callback: async ({ interaction, channel, user, guild }) => {
        const targetChannel = interaction.options.getChannel("channel") as TextChannel;
        const duration = interaction.options.getString("duration") as string;
        const prize = interaction.options.getString("prize") as string;
        const amount = interaction.options.getInteger("amount") as number;

        let time;
        let type;
        let time2;

        // If amount is 0, then return to user with ephemeral, and custom message
        if (amount < 1) {
            return {
                custom: true,
                content: `❌ You cannot have \`${amount}\` winners for a giveaway`,
                ephemeral: true,
            }
        }

        // Do a trycatch statement in case the user inputs an invalid duration
        try {
            const split = duration.match(/\d+|\D+/g);
            time2 = parseInt(split![0]);
            time = parseInt(split![0]);
            type = split![1];
        } catch (e) {
            return {
                custom: true,
                content: "❌ Invalid time format! Example format: `10d` where `d = days`, `h = hours` and `m = minutes`",
                ephemeral: true,
            }
        }

        if (type === "h") {
            time *= 60;
        } else if (type === "d") {
            time *= 60 * 24;
        } else if (type !== "m") {
            return {
                custom: true,
                content: "❌ Please use `m`, `h`, or `d` for minutes, hours and days respectively",
                ephemeral: true,
            }
        }

        const expires: Date = new Date();
        expires.setMinutes(expires.getMinutes() + time);

        const s = time2 === 1 ? "" : "s";

        // convert Date to timestamp
        const timestamp = Math.floor((Date.now() + time) / 1000);

        // Random Giveaway ID
        const giveawayId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const giveawayEmbed = new MessageEmbed()
            .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
            .setTitle("🎉 Giveaway! 🎉")
            .setColor("RANDOM")
            .addField("Prize", prize)
            .addField("Ends In", `<t:${timestamp}>`)
            .setFooter(`${amount} winner${amount === 1 ? "" : "s"} will be randomly selected`);
        
        const giveawayMessage = await targetChannel.send({ embeds: [giveawayEmbed], components: [buttonComponent(false, giveawayId)] });

        GiveawaySchema.create({
            guildId: guild?.id,
            channelId: targetChannel.id,
            messageId: giveawayMessage.id,
            expiryTime: expires,
            giveawayId,
            amount,
            appliedMembers: [],
        });

        return {
            custom: true,
            content: `✅ Giveaway created in ${targetChannel?.name} with a duration of ${time} and a prize of ${prize}`,
            ephemeral: true,
        };
    }
} as ICommand;