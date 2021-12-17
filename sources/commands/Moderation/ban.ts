import { GuildMember, Message, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import PunishmentSchema from "../../models/PunishmentSchema";

export default {
    category: 'Moderation',
    description: 'Bans a user from the server',
    permissions: ['ADMINISTRATOR'],
    requireRoles: true,
    slash: true,
    guildOnly: true,
    options: [
        {
            name: 'permanently',
            description: 'Permanently bans the user from the server',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'user',
                    description: 'The user to ban',
                    type: 'USER',
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for the ban',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
        {
            name: 'temporarily',
            description: 'Temporarily bans the user from the server',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'user',
                    description: 'The user to ban',
                    type: 'USER',
                    required: true,
                },
                {
                    name: 'reason',
                    description: 'The reason for the ban',
                    type: 'STRING',
                    required: true,
                },
                {
                    name: 'duration',
                    description: 'The duration of the ban',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description: 'Unbans a user from the server',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'user_id',
                    description: 'The user ID to unban',
                    type: 'STRING',
                    required: true,
                },
            ],
        }
    ],

    callback: async ({ interaction, member, guild }) => {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'permanently') {
            const target = interaction.options.getMember('user') as GuildMember;
            const reason = interaction.options.getString('reason') as string;

            if (!target.bannable) return {
                custom: true,
                content: `❌ Unable to ban <@${target.user.id}>, sorry about that!`,
                ephemeral: true,
            }

            target.send(`❌ You have been permanently banned from ${guild?.name} by ${member.user.tag}!\nReason: ${reason}`);
            target.ban({ reason });
            return {
                custom: true,
                content: `✅ Successfully banned <@${target.user.id}> permanently!\nReason: \`${reason}\`\nUser ID: ${target.user.id}`,
            }
        } else if (subCommand === 'temporarily') {
            const target = interaction.options.getMember('user') as GuildMember;
            const reason = interaction.options.getString('reason') as string;

            if (!target.bannable) return {
                custom: true,
                content: `❌ Unable to ban <@${target.user.id}>, sorry about that!`,
                ephemeral: true,
            }

            const duration = interaction.options.getString('duration') as string;
            
            // Define variables time and type
            let time;
            let type;

            // Do a trycatch statement in case the user inputs an invalid duration
            try {
                const split = duration.match(/\d+|\D+/g);
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
            } else if (type === "h") {
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

            const result = await PunishmentSchema.findOne(
                {
                    guildId: guild?.id,
                    userId: target.user.id,
                    type: "ban",
                }
            );
    
            if (result) {
                return {
                    custom: true,
                    content: "❌ That user is already banned in this server",
                    ephemeral: true,
                }
            }

            const timeLeft = expires.getTime() - new Date().getTime();
            const timeLeftString = `${Math.floor(timeLeft / (1000 * 60 * 60))}hour${(timeLeft / (1000 * 60 * 60)) ? "" : "s"} ${Math.floor(timeLeft / (1000 * 60))}minute${(timeLeft / (1000 * 60)) ? "" : "s"}`;

            try {
                target.send(`❌ You have been temporarily banned from ${guild?.name} by ${member.user.tag}!\nReason: \`${reason}\`\nYou will be able to join this server again in ${timeLeftString}`);
                await guild?.members.ban(target.id, { reason: reason });
    
                await new PunishmentSchema({
                    userId: target.id,
                    guildId: guild?.id,
                    staffId: member.id,
                    reason,
                    expires,
                    type: "ban",
                }).save();
            } catch (ignored) {
                return {
                    custom: true,
                    content: "❌ Cannot ban that user",
                    ephemeral: true,
                }       
            }
    
            return {
                custom: true,
                content: `✅ Successfully banned <@${target.id}> temporarily for \`${duration}\`!\nReason: ${reason}\nUser ID: ${target.id}`,
            }
        } else if (subCommand === 'remove') {
            const userId = interaction.options.getString('user_id') as string;

            const result = await PunishmentSchema.find({
                userId,
                guildId: guild?.id,
                type: "ban",
            });

            if (result) await PunishmentSchema.deleteMany({
                userId,
                guildId: guild?.id,
                type: "ban",
            });

            guild?.members.unban(userId);

            return {
                custom: true,
                content: `✅ Successfully unbanned <@${userId}>!`,
            }
        }
    }
} as ICommand;