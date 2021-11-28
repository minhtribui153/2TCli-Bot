import { GuildMember, MessageEmbed } from "discord.js";
import { Aggregate } from "mongoose";
import { ICommand } from "wokcommands";

export default {
    category: 'Moderation',
    description: 'Bans a user from the server',
    permissions: ['ADMINISTRATOR'],
    requireRoles: true,
    slash: 'both',
    guildOnly: true,
    minArgs: 2,
    expectedArgs: '<user> <reason>',
    expectedArgsTypes: ['USER', 'STRING'],

    callback: ({ message, member, interaction, args }) => {
        const target = message
            ? message.mentions.members?.first()
            : interaction.options.getMember('user') as GuildMember;
        if (!target) return {
            custom: true,
            content: '❌ Tag someone to ban!',
            ephemeral: true,
        }

        if (!target.bannable) return {
            custom: true,
            content: `❌ Unable to ban <@${target.user.id}>, sorry about that!`,
            ephemeral: true,
        }

        args.shift();

        const reason = args.join(' ');
        
        const mainEmbed = new MessageEmbed()
            .setAuthor('User banned', target.user.displayAvatarURL({ dynamic: true }))
            .setTitle(`${target.user.tag} has been banned`)
            .setColor('DARK_RED')
            .setDescription(`**Reason:** ${reason}`)
            .setFooter(`Requested by ${member.user.tag}`, member.displayAvatarURL({ dynamic: true }));
        
        target.ban({
            reason,
            days: 7,
        });
        
        return {
            custom: true,
            embeds: [mainEmbed],
        }
    }
} as ICommand;