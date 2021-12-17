import { User } from "discord.js";
import { ICommand } from "wokcommands";
import PunishmentSchema from "../../models/PunishmentSchema";

export default {
    category: "Moderation",
    description: "Mutes/unmutes a user.",
    permissions: ["ADMINISTRATOR"],
    requireRoles: true,
    guildOnly: true,
    slash: true,
    options: [
        {
            name: "add",
            description: "Temporarily mutes a user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "user",
                    description: "The user to mute",
                    type: "USER",
                    required: true,
                },
                {
                    name: "duration",
                    description: "The duration of the mute",
                    type: "STRING",
                    required: true,
                },
                {
                    name: "reason",
                    description: "The reason for the mute",
                    type: "STRING",
                    required: true,
                },
            ],
        },
        {
            name: "remove",
            description: "Unmutes a user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "user",
                    description: "The user to unmute",
                    type: "USER",
                    required: true,
                },
            ],
        },
    ],
    callback: async ({ client, message, interaction, args, member: staff, guild  }) => {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user") as User;

        if (!user) return {
            custom: true,
            content: `❌ Could not find user`,
            ephemeral: true,
        }

        if (subCommand === "add") {
            const duration = interaction.options.getString('duration') as string;
            const reason = interaction.options.getString('reason') as string;

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

            const result = await PunishmentSchema.findOne(
                {
                    guildId: guild?.id,
                    userId: user.id,
                    type: "mute",
                }
            );

            if (result) {
                return {
                    custom: true,
                    content: "❌ That user is already muted in this server",
                    ephemeral: true,
                }
            }

            try {
                const member = await guild?.members.fetch(user.id);
                if (member) {
                    const muteRole = guild?.roles.cache.find(r => r.name === "Muted");
                    if (!muteRole) {
                        return {
                            custom: true,
                            content: "❌ No role called \"Muted\" in this server, please create one!",
                            ephemeral: true,
                        }
                    }

                    member.roles.add(muteRole);
                }

                await new PunishmentSchema({
                    userId: user.id,
                    guildId: guild?.id,
                    staffId: staff.id,
                    reason,
                    expires,
                    type: "mute",
                }).save();
            } catch (ignored) {
                return {
                    custom: true,
                    content: "❌ Cannot mute that user",
                    ephemeral: true,
                }       
            }

            return {
                custom: true,
                content: `✅ <@${user.id}> has been muted for \`${duration}\``,
                ephemeral: true,
            }
        } else if (subCommand === "remove") {
            const mutedRole = guild?.roles.cache.find(r => r.name === "Muted");

            if (!mutedRole) return {
                custom: true,
                content: "❌ Could not find role \"Muted\"",
                ephemeral: true,
            }

            const data = await PunishmentSchema.find(
                {
                    guildId: guild?.id,
                    userId: user.id,
                    type: "mute",
                }
            );
    
            
    
            // If no data return
            if (!data.length) return {
                custom: true,
                content: `❌ <@${user.id}> is not muted`,
                ephemeral: true,
            }
            const target = guild?.members.cache.get(user.id);
            target?.roles.remove(mutedRole);
    
            // Unmute user
            await PunishmentSchema.deleteMany(
                {
                    guildId: guild?.id,
                    userId: user.id,
                    type: "mute",
                }
            );
    
            return {
                custom: true,
                content: `✅ <@${user.id}> has been unmuted`,
                ephemeral: true,
            }
        }
    }
} as ICommand;