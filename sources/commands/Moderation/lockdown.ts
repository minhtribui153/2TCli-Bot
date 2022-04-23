import { GuildChannel, GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { ICommand } from "wokcommands";
import LockdownSchema from "../../models/LockdownSchema";

export default {
    category: "Moderation",
    description: "A lockdown slash command",
    slash: true,
    guildOnly: true,
    requireRoles: true,
    options: [
        {
            name: "ignored",
            description: "Ignore the lockdown for a text channel",
            type: "SUB_COMMAND_GROUP",
            options: [
                {
                    name: "add",
                    description: "Adds the channel to be ignored for lockdown command",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "channel",
                            description: "The channel to ignore",
                            type: "CHANNEL",
                            required: false,
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Removes the channel from being ignored for lockdown command",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "channel",
                            description: "The channel to remove from being ignored",
                            type: "CHANNEL",
                            required: false,
                        }
                    ]
                },
                {
                    name: "list",
                    description: "Lists all the channels that are ignored for lockdown command",
                    type: "SUB_COMMAND",
                    options: [],
                }
            ]
        },
        {
            name: "set",
            description: "Locks down the server for a specific role",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "type",
                    description: "The type of lockdown to perform",
                    type: "BOOLEAN",
                    required: true,
                },
                {
                    name: "role",
                    description: "The role to lock down the channel with",
                    type: "ROLE",
                    required: true,
                },
            ]
        }
    ],
    callback: async ({ client, interaction, guild, channel }) => {
        const subCommand = interaction.options.getSubcommand();
        const memberClient = guild?.members.cache.get(client.user?.id as string) as GuildMember;
        if (!memberClient.permissions.has("ADMINISTRATOR")) {
            return {
                custom: true,
                content: "❌ I don't have ADMINISTRATOR permission",
                ephemeral: true,
            }
        }
        
        if (subCommand === "set") {
            const lock = interaction.options.getBoolean("type") as boolean;
            const role = interaction.options.getRole("role") as Role;

            const schema = await LockdownSchema.findById(guild?.id) as any;
            if (!schema) return {
                custom: true,
                content: "❌ Please set a Text Channel to ignore for the lockdown command",
                ephemeral: true,
            }

            const ignoredChannels = schema.channels as string[];
            const channels = guild?.channels.cache.filter(ch => ch.type === "GUILD_TEXT");
    
            channels?.forEach(async (channel: any) => {
                if (!ignoredChannels.includes(channel.id)) {
                    const textChannel = channel as TextChannel;
                    await textChannel.permissionOverwrites.edit(role.id, {
                        SEND_MESSAGES: !lock,
                    }).then(ch => {
                        if (lock) {
                            if (!ch.name.endsWith("｜🔒")) {
                                ch.edit({ name: ch.name + "｜🔒" });
                            }
                        } else if (!lock) {
                            ch.edit({ name: ch.name.replace("｜🔒", "") });
                        }
                    })
                }
            });
            const lockdownMsg = lock
                ?  `🔒 Locked down the server for Role <@&${role.id}>`
                : `🔓 Unlocked the server for Role <@&${role.id}>`;
            return {
                custom: true,
                content: lockdownMsg,
                ephemeral: true,
            }
        }

        const subCommandGroup = interaction.options.getSubcommandGroup();

        if (subCommandGroup === "ignored") {
            if (subCommand === "add") {
                const targetChannel = interaction.options.getChannel("channel") as GuildChannel;
                if (targetChannel) {
                    const alreadyHave = await LockdownSchema.findById(guild?.id) as any;
                    if (alreadyHave) {
                        if (alreadyHave.channels.includes(targetChannel.id)) {
                            return {
                                custom: true,
                                content: `❌ Text Channel <#${targetChannel.id}> is already ignored for lockdown`,
                                ephemeral: true
                            };
                        } else {
                            await LockdownSchema.findByIdAndUpdate(guild?.id, {
                                $addToSet: {
                                    channels: targetChannel.id,
                                }
                            })
                            return {
                                custom: true,
                                content: `✅ Added channel <#${targetChannel?.id}> to the ignored list`,
                                ephemeral: true,
                            }
    
                        }
                        
                    } else {
                        await LockdownSchema.findByIdAndUpdate(guild?.id, {
                            $addToSet: {
                                channels: channel.id,
                            }
                        }, {
                            upsert: true,
                        })
                        return {
                            custom: true,
                            content: `✅ Added channel <#${channel?.id}> to the ignored list`,
                            ephemeral: true,
                        }

                    }
                } else {
                    const alreadyHave = await LockdownSchema.findById(guild?.id) as any;
                    if (alreadyHave) {
                        if (alreadyHave.channels.includes(channel?.id)) {
                            return {
                                custom: true,
                                content: `❌ Text Channel <#${channel?.id}> is already ignored for lockdown`,
                                ephemeral: true
                            };
                        } else {
                            await LockdownSchema.findByIdAndUpdate(guild?.id, {
                                $addToSet: {
                                    channels: channel.id,
                                }
                            }, {
                                upsert: true,
                            })
                            return {
                                custom: true,
                                content: `✅ Added channel <#${channel?.id}> to the ignored list`,
                                ephemeral: true,
                            }
    
                        }
                    } else {
                        await LockdownSchema.findByIdAndUpdate(guild?.id, {
                            $addToSet: {
                                channels: channel.id,
                            }
                        }, {
                            upsert: true,
                        })
                        return {
                            custom: true,
                            content: `✅ Added channel <#${channel?.id}> to the ignored list`,
                            ephemeral: true,
                        }

                    }
                }
            } else if (subCommand === "remove") {
                const targetChannel = interaction.options.getChannel("channel") as GuildChannel;
                if (targetChannel) {
                    const alreadyHave = await LockdownSchema.findById(guild?.id) as any;
                    if (alreadyHave) {
                        if (!alreadyHave.channels.includes(targetChannel.id)) {
                            return {
                                custom: true,
                                content: `❌ Text Channel <#${targetChannel.id}> is not ignored for lockdown`,
                                ephemeral: true
                            };
                        } else {
                            await LockdownSchema.findByIdAndUpdate(guild?.id, {
                                $pull: {
                                    channels: targetChannel.id,
                                }
                            }, {
                                upsert: true,
                            })
                            return {
                                custom: true,
                                content: `✅ Removed channel <#${targetChannel?.id}> from the ignored list`,
                                ephemeral: true,
                            }
    
                        }
                    } else {
                        await LockdownSchema.findByIdAndUpdate(guild?.id, {
                            $pull: {
                                channels: channel.id,
                            }
                        }, {
                            upsert: true,
                        })
                        return {
                            custom: true,
                            content: `✅ Removed channel <#${channel?.id}> from the ignored list`,
                            ephemeral: true,
                        }

                    }
                } else {
                    const alreadyHave = await LockdownSchema.findById(guild?.id) as any;
                    if (!alreadyHave.channels.includes(channel?.id)) {
                        return {
                            custom: true,
                            content: `❌ Text Channel <#${channel?.id}> is not ignored for lockdown`,
                            ephemeral: true
                        };
                    } else {
                        await LockdownSchema.findByIdAndUpdate(guild?.id, {
                            $pull: {
                                channels: channel.id,
                            }
                        }, {
                            upsert: true,
                        })
                        return {
                            custom: true,
                            content: `✅ Removed channel <#${channel?.id}> from the ignored list`,
                            ephemeral: true,
                        }

                    }
                }
            } else if (subCommand === "list") {
                const alreadyHave = await LockdownSchema.findById(guild?.id) as any;
                if (!alreadyHave || alreadyHave.channels.length === 0) {
                    return {
                        custom: true,
                        content: `❌ There are no channels ignored for lockdown`,
                        ephemeral: true
                    };
                } else {
                    const embed = new MessageEmbed()
                        .setColor("#0099ff")
                        .setTitle("Ignored Channels")
                        .setDescription(alreadyHave.channels.map((channelId: string) => `<#${channelId}>`).join("\n"));
                    return {
                        custom: true,
                        embeds: [embed],
                        ephemeral: true,
                    }
                }
            }
        }
    }
} as ICommand;