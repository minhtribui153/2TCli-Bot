import { GuildMember, MessageEmbed, Role } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: "Server",
    description: "Get information about a user",
    slash: true,
    guildOnly: true,
    options: [
        {
            name: 'user',
            description: "The user to get information about",
            type: "USER",
            required: false,
        },
    ],
    callback: async ({ interaction, member, channel, guild }) => {
        let target = guild?.members.cache.get((interaction.options.getMember('user') as GuildMember) ? (interaction.options.getMember('user') as GuildMember).id : member.id) as GuildMember;

        const everyoneRole = guild?.roles.cache.find(r => r.name === "@everyone") as Role;
        let joined = Math.floor(target?.joinedTimestamp as number / 1000);
        let created = Math.floor(target?.user.createdTimestamp as number / 1000);

        const roles = target?.roles.cache.map(r => `<@&${r.id}>`).join('\n').replace(`<@&${everyoneRole.id}>`, "") || "None"
        const roles2 = target?.roles.cache.map(r => r);

        const embed = new MessageEmbed()
            .setAuthor(target?.user?.tag, target?.user?.displayAvatarURL({ dynamic: true }))
            .setThumbnail(`${target?.user?.avatarURL({ dynamic: true, size: 512 })}`)
            .setColor(target?.displayHexColor as `#${string}`)
            .addField("ID", target?.id as string, true)
            .addField("Nickname", target?.nickname as string || "None", true)
            .addField("Type", target?.user?.bot ? "🤖 Discord Bot" : "🙎 Discord User", true)
            .addField("Roles", `${roles}\n(${roles2.length - 1} role${roles2.length === 1 ? "s" : ""})`, false)
            .addField("Member Since", `<t:${joined}:R>`, true)
            .addField("Joined Discord Since", `<t:${created}:R>`, true);
        // remove everyone role


        return {
            custom: true,
            embeds: [embed],
            ephemeral: true
        };
    }

} as ICommand;