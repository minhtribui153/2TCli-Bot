import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import { ICommand } from "wokcommands";
import backup, { setStorageFolder } from 'discord-backup';

const actions: string[] = ["create", "info", "load", "delete"];

export default {
    category: "Backup",
    description: "Manage your Discord Server Backups",
    expectedArgs: `<${actions.join('", "')}> [backup-id]`,
    permissions: ["ADMINISTRATOR"],
    options: [
        {
            name: "create",
            description: "Creates a backup of your server",
            type: "SUB_COMMAND",
            options: [],
        },
        {
            name: "info",
            description: "Shows information about a server backup",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "backup-id",
                    description: "The backup ID to use to check information of the server",
                    type: "STRING",
                    required: true,
                }
            ],
        },
        {
            name: "load",
            description: "Restores a backup of a server",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "backup-id",
                    description: "The backup ID to use to restore the server",
                    type: "STRING",
                    required: true,
                }
            ],
        },
        {
            name: "delete",
            description: "Deletes a backup of a server",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "backup-id",
                    description: "The backup ID to use to delete the server",
                    type: "STRING",
                    required: false,
                }
            ]
        },
    ],
    slash: true,
    callback: async ({ interaction, guild, channel, args, user }) => {
        const SubCommand = interaction.options.getSubcommand();

        if (!guild) {
            return {
                custom: true,
                content: "❌ You must run this command in a server!",
                ephemeral: true
            };
        }

        setStorageFolder(__dirname + "/../../backups");

        if (SubCommand === "create") {
            const ConfirmEmbed = new MessageEmbed()
                .setDescription('⚠️ Are you sure you want to create a backup!?')
                .setColor('YELLOW')


            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Yes')
                    .setStyle('SUCCESS')
                    .setCustomId('backup-yes-create')
                )
                .addComponents(
                    new MessageButton()
                    .setLabel('No')
                    .setStyle('DANGER')
                    .setCustomId('backup-no-create')
                );

            interaction.followUp({
                embeds: [ConfirmEmbed],
                components: [row]
            })

            const collector = await channel.createMessageComponentCollector({
                time: 15000,
                componentType: "BUTTON",
            })

            collector.on("collect", async (i) => {

                if (i.customId === "backup-yes-create") {

                    if (i.user.id !== interaction.user.id) return i.reply({
                        content: "❌ Please stop touching the button! It is not yours!!!",
                        ephemeral: true
                    })

                    i.deferUpdate()
                    const ConfirmEmbed1 = new MessageEmbed()
                        .setDescription('⏰ Creating a backup for your server... I will send you a message when it is done!')
                        .setColor('BLUE')


                    const row1 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setLabel('Yes')
                            .setStyle('SUCCESS')
                            .setCustomId('backup-yes-create')
                            .setDisabled(true)
                        )
                        .addComponents(
                            new MessageButton()
                            .setLabel('No')
                            .setStyle('DANGER')
                            .setCustomId('backup-no-create')
                            .setDisabled(true)
                        );
                    interaction.editReply({
                        embeds: [ConfirmEmbed1],
                        components: [row1]
                    })

                    backup.create(guild, {
                        jsonBeautify: true,
                        saveImages: "base64",
                        maxMessagesPerChannel: 5,
                    }).then((backupData) => {
                        let guildicon = guild.iconURL({
                            dynamic: true
                        });
                        let datacreated = new MessageEmbed()
                            .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({
                                dynamic: true
                            }))
                            .setDescription(`New Backup Created\n> **Backup ID**: \`${backupData.id}\`\n> **Guild Name**: ${guild.name}`)

                            .setColor('RED')
                        interaction.user.send({
                            embeds: [datacreated]
                        });
                        let created = new MessageEmbed()
                            .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({
                                dynamic: true
                            }))
                            .setDescription(`✅ Backup has been created! The backup ID has been sent to you in DM!`)
                            .setColor('GREEN')


                        channel.send({
                            embeds: [created]
                        });
                    });

                } else if (i.customId === "backup-no-create") {

                    if (i.user.id !== interaction.user.id) return i.reply({
                        content: "❌ Please stop touching the button! It is not yours!!!",
                        ephemeral: true
                    })
                    i.deferUpdate()
                    const ConfirmEmbed2 = new MessageEmbed()
                        .setDescription('')
                        .setColor('RED')


                    const row2 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setLabel('Yes')
                            .setStyle('SUCCESS')
                            .setCustomId('backup-yes-create')
                            .setDisabled(true)
                        )
                        .addComponents(
                            new MessageButton()
                            .setLabel('No')
                            .setStyle('DANGER')
                            .setCustomId('backup-no-create')
                            .setDisabled(true)
                        );
                    interaction.editReply({
                        embeds: [ConfirmEmbed2],
                        components: [row2]
                    })
                    const NoEmbed = new MessageEmbed()
                        .setDescription(`Cancelled The Backup!`)
                        .setColor('RED')

                    channel.send({
                        embeds: [NoEmbed]
                    })
                }
            })


        } else if (SubCommand === "info") {
            let backupID = interaction.options.getString("backup-id");
            if (!backupID) {
                let notvaild = new MessageEmbed()
                    .setAuthor(interaction.user.username, user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`> You must specify a valid backup ID `)

                    .setColor('RED')

                return interaction.followUp({
                    embeds: [notvaild]
                });
            }
            backup.fetch(backupID).then((backupInfos) => {
                const date = new Date(backupInfos.data.createdTimestamp);
                const yyyy = date.getFullYear().toString(),
                    mm = (date.getMonth() + 1).toString(),
                    dd = date.getDate().toString();
                const formatedDate = `${yyyy}/${(mm[1] ? mm : "0" + mm[0])}/${(dd[1] ? dd : "0" + dd[0])}`;
                let backups = new MessageEmbed()
                    .setAuthor(interaction.user.username, user.displayAvatarURL({ dynamic: true }))
                    .setColor('RED')

                    .setDescription(`**Back Up Info**\n> Backup ID: ${backupInfos.id} \n> Server ID: ${backupInfos.data.guildID} \n> Backup Size: ${backupInfos.size} mb \n> Backup Created At: ${formatedDate}`)

                interaction.followUp({
                    embeds: [backups]
                })
            }).catch((err) => {
                let nobackupfound = new MessageEmbed()
                    .setAuthor(interaction.user.username, user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`> No Backup Found For: \`${backupID}\`!`)

                    .setColor('RED')
                interaction.followUp({
                    embeds: [nobackupfound]
                })
            });

        } else if (SubCommand === "load") {
            // =====================================================================================
            const backupID = interaction.options.getString('backup-id') as string;
            backup.fetch(backupID).then(async () => {

                const eConfirmEmbed = new MessageEmbed()
                    .setDescription(' Are you sure you want to load the back!?\nThis will delete all channels, roles, messages, emojis, bans etc.\nNONE OF THE MEMBERS WILL BE KICKED!')
                    .setColor('RED')


                const erow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Yes')
                        .setStyle('SUCCESS')
                        .setCustomId('backup-yes-load')
                    )
                    .addComponents(
                        new MessageButton()
                        .setLabel('No')
                        .setStyle('DANGER')
                        .setCustomId('backup-no-load')
                    );

                interaction.followUp({
                    embeds: [eConfirmEmbed],
                    components: [erow]
                })

                const collector = await channel.createMessageComponentCollector({
                    time: 15000,
                    componentType: "BUTTON",
                })

                collector.on("collect", async (i) => {

                    if (i.customId === "backup-yes-load") {

                        if (i.user.id !== interaction.user.id) return i.reply({
                            content: "Don't touch other people's button",
                            ephemeral: true
                        })

                        i.deferUpdate()
                        backup.load(backupID, guild, {
                            clearGuildBeforeRestore: true
                        }).then(() => {}).catch((err) => {
                            let permissionserorr = new MessageEmbed()
                                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({
                                    dynamic: true
                                }))
                                .setDescription(`There are 2 possible reasons for this message:\n> 1. I dont have ADMINISTRATOR Permissions\n> 2. I have completed the backup successfully!\n\nIf it is none of them please report this!`)

                                .setColor('RED')

                            interaction.user.send({
                                embeds: [permissionserorr]
                            })
                        });

                    } else if (i.customId === "backup-no-load") {

                        if (i.user.id !== interaction.user.id) return i.reply({
                            content: "❌ Please stop touching the button! It is not yours!!!",
                            ephemeral: true
                        })
                        i.deferUpdate()
                        const ConfirmEmbed2 = new MessageEmbed()
                            .setDescription(' Are you sure you want to create a backup!?')
                            .setColor('RED')


                        const row2 = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel('Yes')
                                .setStyle('SUCCESS')
                                .setCustomId('backup-no-load')
                                .setDisabled(true)
                            )
                            .addComponents(
                                new MessageButton()
                                .setLabel('No')
                                .setStyle('DANGER')
                                .setCustomId('backup-yes-load')
                                .setDisabled(true)
                            );
                        interaction.editReply({
                            embeds: [ConfirmEmbed2],
                            components: [row2]
                        })
                        const NoEmbed = new MessageEmbed()
                            .setDescription(`❌ Backup Cancelled!`)
                            .setColor('RED')

                        channel.send({
                            embeds: [NoEmbed]
                        })
                    }
                })
            }).catch((err) => {
                let nobackupfound = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setDescription(`No backup found for ${backupID}`)

                    .setColor('RED')

                interaction.followUp({
                    embeds: [nobackupfound]
                })
            });



        } else if (SubCommand === "delete") {
            let backupID = interaction.options.getString("backup-id") as string;
            if (!backupID) {
                let notvaild = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setDescription(`You must specify a valid backup ID To Remove`)

                    .setColor('RED')

                interaction.followUp({
                    embeds: [notvaild]
                })
            }
            backup.fetch(backupID).then((backupInfos) => {
                backup.remove(backupID)
                let backups = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setDescription(`Backup Deleted!`)

                    .setColor('RED')

                interaction.followUp({
                    embeds: [backups]
                })
            }).catch((err) => {
                let nobackupfound = new MessageEmbed()
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setDescription(`No backup found!`)

                    .setColor('RED')
                interaction.followUp({
                    embeds: [nobackupfound]
                })
            });

        }
    }
} as ICommand;