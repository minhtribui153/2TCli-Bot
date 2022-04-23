import { ICommand } from "wokcommands";
import { ZoomMeetingType } from "../../utils/constants";
import { zoom } from "../../utils/api";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import ZoomMeetingSchema from "../../models/ZoomMeetingSchema";

export default {
    category: 'Utility',
    description: 'Manage Zoom Accounts',
    guildOnly: true,
    slash: true,
    options: [
        {
            name: 'create',
            description: 'Create a Zoom Meeting',
            type: "SUB_COMMAND",
            options: [
                {
                    name: 'type',
                    description: 'Type of the Zoom meeting',
                    type: 'STRING',
                    choices: [
                        {
                            name: 'Instant Meeting',
                            value: 'instant',
                        },
                        {
                            name: 'Scheduled Meeting',
                            value: 'scheduled',
                        },
                        {
                            name: 'Recurring Meeting (No fixed time)',
                            value: 'recurring_no_fixed_time',
                        },
                        {
                            name: 'Recurring Meeting (Fixed time)',
                            value: 'recurring_fixed_time',
                        }
                    ],
                    required: true,
                },
                {
                    name: 'topic',
                    description: 'The topic of the Zoom meeting',
                    type: "STRING",
                    required: true,
                },
                {
                    name: 'duration',
                    description: 'Duration of the Zoom meeting (in minutes)',
                    type: "INTEGER",
                    required: false,
                },
                {
                    name: 'password',
                    description: "Password of the Zoom meeting",
                    type: "STRING",
                    required: false,
                }
            ]
        },
        {
            name: 'link',
            description: 'Link your Zoom Account with this bot',
            type: "SUB_COMMAND",
            options: [
                {
                    name: 'token',
                    description: 'Zoom JWT Token',
                    type: 'STRING',
                    required: true,
                }
            ]
        },
        {
            name: 'unlink',
            description: 'Unlink your Zoom Account with this bot',
            type: "SUB_COMMAND",
            options: []
        },
        {
            name: 'list',
            description: 'List all your Zoom Meetings',
            type: "SUB_COMMAND",
            options: [],
        },
    ],
    callback: async ({ interaction, args }) => {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'create') {
            const topic = interaction.options.getString('topic') as string;
            const duration = interaction.options.getInteger('duration');
            const password = interaction.options.getString('password') as string;
            const type = interaction.options.getString('type');

            const zoomUser = await ZoomMeetingSchema.findById(interaction.member?.user.id) as any;

            if (!zoomUser) {
                return {
                    custom: true,
                    content: "❌ You don't have a Zoom account linked to your Discord account. Please use `/zoom link` to link your Zoom account to your Discord account.",
                    ephemeral: true,
                }
            }

            interaction.deferReply();

            if (type === 'instant') {
                if (duration) return interaction.editReply({
                    content: '❌ You cannot set a duration for an instant Zoom meeting',
                })
                const { data: meeting } = await zoom.meeting.create({
                    topic,
                    type: ZoomMeetingType.INSTANT,
                    password,
                    duration,
                    zoom_token: zoomUser.token,
                });

                let info = "";
                info = `__**Meeting Information**__\n`
                info += `**Topic**: ${meeting.topic}\n`;
                info += `**Start Time**: <t:${Math.floor(Date.now() / 1000)}:R>\n`;
                info += `**Timezone**: ${meeting.timezone}\n`;
                info += `**Duration**: ${meeting.duration} minutes\n\n`;
                info += `__**Meeting Credentials**__\n`
                info += `**Meeting ID**: ${meeting.id}\n`;
                info += `**Password**: ${meeting.password}`;

                const embed = new MessageEmbed()
                    .setTitle(`📞 Instant Zoom Meeting`)
                    .setColor("RANDOM")
                    .setDescription(info);
                
                const Button = new MessageButton()
                    .setStyle("LINK")
                    .setLabel("Join Zoom Meeting")
                    .setEmoji("<:Zoom:935417060245258321>")
                    .setURL(meeting.join_url);

                interaction.channel?.send({
                    embeds: [embed],
                    components: [
                        new MessageActionRow()
                            .addComponents(Button)
                    ]
                })

                return interaction.editReply({
                    content: `✅ Created Zoom meeting: ${meeting.topic}`,
                })
            } else if (type === 'scheduled') {
                if (!duration) return interaction.editReply({
                    content: '❌ You must set a duration for a scheduled Zoom meeting',
                })
                const { data: meeting } = await zoom.meeting.create({
                    topic,
                    type: ZoomMeetingType.SCHEDULED,
                    password,
                    duration,
                    zoom_token: zoomUser.token,
                });

                let info = "";
                info = `__**Meeting Information**__`
                info += `**Topic**: ${meeting.topic}\n`;
                info += `**Start Time**: <t:${Math.floor(Date.now() / 1000)}:R>\n`;
                info += `**Timezone**: ${meeting.timezone}\n`;
                info += `**Duration**: ${meeting.duration} minutes\n\n`;
                info += `__**Meeting Credentials**__`
                info += `**Meeting ID**: ${meeting.id}\n`;
                info += `**Password**: ${meeting.password}`;

                const embed = new MessageEmbed()
                    .setTitle(`📆 Scheduled Zoom Meeting`)
                    .setColor("RANDOM")
                    .setDescription(info);
                
                const Button = new MessageButton()
                    .setStyle("LINK")
                    .setLabel("Join Zoom Meeting")
                    .setEmoji("<:Zoom:935417060245258321>")
                    .setURL(meeting.join_url);

                interaction.channel?.send({
                    embeds: [embed],
                    components: [
                        new MessageActionRow()
                            .addComponents(Button)
                    ]
                })

                return interaction.editReply({
                    content: `✅ Created Zoom meeting: ${meeting.topic}`,
                })
            } else if (type === 'recurring_no_fixed_time') {
                if (duration) return interaction.editReply({
                    content: '❌ You cannot set a duration for a recurring Zoom meeting',
                })

                const { data: meeting } = await zoom.meeting.create({
                    topic,
                    type: ZoomMeetingType.RECURRING_NO_FIXED_TIME,
                    password,
                    duration,
                    zoom_token: zoomUser.token,
                });

                let info = "";
                info = `__**Meeting Information**__\n`
                info += `**Topic**: ${meeting.topic}\n`;
                info += `**Start Time**: <t:${Math.floor(Date.now() / 1000)}:R>\n`;
                info += `**Timezone**: ${meeting.timezone}\n`;
                info += `**Duration**: ${meeting.duration} minutes\n\n`;
                info += `__**Meeting Credentials**__\n`
                info += `**Meeting ID**: ${meeting.id}\n`;
                info += `**Password**: ${meeting.password}`;

                const embed = new MessageEmbed()
                    .setTitle(`📆 Recurring Zoom Meeting (No fixed time)`)
                    .setColor("RANDOM")
                    .setDescription(info);
                
                const Button = new MessageButton()
                    .setStyle("LINK")
                    .setLabel("Join Zoom Meeting")
                    .setEmoji("<:Zoom:935417060245258321>")
                    .setURL(meeting.join_url);

                interaction.channel?.send({
                    embeds: [embed],
                    components: [
                        new MessageActionRow()
                            .addComponents(Button)
                    ]
                })

                return interaction.editReply({
                    content: `✅ Created Zoom meeting: ${meeting.topic}`,
                })
            } else if (type === 'recurring_with_fixed_time') {
                if (!duration) return interaction.editReply({
                    content: '❌ You must set a duration for this recurring Zoom meeting',
                });
                const { data: meeting } = await zoom.meeting.create({
                    topic,
                    type: ZoomMeetingType.RECURRING_FIXED_TIME,
                    password,
                    duration,
                    zoom_token: zoomUser.token,
                });

                let info = "";
                info = `__**Meeting Information**__`
                info += `**Topic**: ${meeting.topic}\n`;
                info += `**Start Time**: <t:${Math.floor(Date.now() / 1000)}:R>\n`;
                info += `**Timezone**: ${meeting.timezone}\n`;
                info += `**Duration**: ${meeting.duration} minutes\n\n`;
                info += `__**Meeting Credentials**__`
                info += `**Meeting ID**: ${meeting.id}\n`;
                info += `**Password**: ${meeting.password}`;

                const embed = new MessageEmbed()
                    .setTitle(`📆 Recurring Zoom Meeting (With fixed time)`)
                    .setColor("RANDOM")
                    .setDescription(info);
                
                const Button = new MessageButton()
                    .setStyle("LINK")
                    .setLabel("Join Zoom Meeting")
                    .setEmoji("<:Zoom:935417060245258321>")
                    .setURL(meeting.join_url);

                interaction.channel?.send({
                    embeds: [embed],
                    components: [
                        new MessageActionRow()
                            .addComponents(Button)
                    ]
                })

                return interaction.editReply({
                    content: `✅ Created Zoom meeting: ${meeting.topic}`,
                })
            }
        } else if (subCommand === 'link') {
            const token = interaction.options.getString('token') as string;
            try {
                const { data: user } = await zoom.user.getInfo(token);
                if (user) {
                    let status = "none";

                    if (user.status === "active") {
                        status = "🟢 Online";
                    } else if (user.status === "pending") {
                        status = "🟡 Idle";
                    } else if (user.status === "inactive") {
                        status = "🔴 Offline";
                    }

                    const confirmEmbed = new MessageEmbed()
                        .setTitle(`🔑 Link Zoom Account`)
                        .setColor("YELLOW")
                        .setDescription(`❓ Are you sure you want to link your Zoom account to this bot?`)
                        .addField("Name", `**${user.first_name} ${user.last_name}**`)
                        .addField("Email", `**${user.email}**`)
                        .addField("Status", `${status}`)
                    
                    const components = (disabled: boolean) => new MessageActionRow()
                        .addComponents([
                            new MessageButton()
                                .setStyle("SUCCESS")
                                .setLabel("Yes")
                                .setEmoji("✅")
                                .setCustomId("zoom_auth_yes")
                                .setDisabled(disabled),
                            new MessageButton()
                                .setStyle("DANGER")
                                .setLabel("No")
                                .setEmoji("<:red_cross_mark:921691762433613824>")
                                .setCustomId("zoom_auth_no")
                                .setDisabled(disabled),
                        ])
                    
                    interaction.reply({
                        embeds: [confirmEmbed],
                        components: [components(false)],
                    });

                    const collector = interaction.channel?.createMessageComponentCollector({
                        filter: m => m.member.id === interaction.member?.user.id,
                        time: 30000,
                        componentType: "BUTTON",
                    });

                    collector?.on('collect', async (i) => {
                        if (i.customId === "zoom_auth_yes") {
                            const zoomUser = await ZoomMeetingSchema.findByIdAndUpdate(i.user.id, {
                                zoom_token: token,
                            }, {
                                upsert: true,
                            });

                            const successEmbed = new MessageEmbed()
                                .setTitle(`✅ Zoom account linked`)
                                .setColor("GREEN")
                                .setDescription(`Your Zoom account has been linked to this bot!\nIf you want to unlink your Zoom account, use \`/zoom unlink\``)

                            i.update({
                                embeds: [successEmbed],
                                components: [components(true)],
                            })
                        } else if (i.customId === "zoom_auth_no") {
                            i.update({
                                components: [components(true)],
                            });
                            collector.stop();
                        }
                    });

                    collector?.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            interaction.editReply({
                                content: '❌ You took too long to respond, please try again',
                                components: [components(true)],
                            });
                        }
                    });
                }
            } catch (error) {
                return {
                    custom: true,
                    content: '❌ Invalid Zoom token, please generate a new one',
                    ephemeral: true,
                };
            }
        } else if (subCommand === 'unlink') {
            const zoomUser = await ZoomMeetingSchema.findOne({
                zoom_token: interaction.options.getString('token') as string,
            });

            if (zoomUser) {
                const confirmEmbed = new MessageEmbed()
                    .setTitle(`🔑 Unlink Zoom Account`)
                    .setColor("YELLOW")
                    .setDescription(`❓ Are you sure you want to unlink your Zoom account from this bot?`)
                
                const components = (disabled: boolean) => new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                            .setStyle("SUCCESS")
                            .setLabel("Yes")
                            .setEmoji("✅")
                            .setCustomId("zoom_auth_unlink_yes")
                            .setDisabled(disabled),
                        new MessageButton()
                            .setStyle("DANGER")
                            .setLabel("No")
                            .setEmoji("<:red_cross_mark:921691762433613824>")
                            .setCustomId("zoom_auth_unlink_no")
                            .setDisabled(disabled),
                    ])
                
                interaction.reply({
                    embeds: [confirmEmbed],
                    components: [components(false)],
                });

                const collector = interaction.channel?.createMessageComponentCollector({
                    filter: m => m.member.id === interaction.member?.user.id,
                    time: 30000,
                    componentType: "BUTTON",
                });

                collector?.on('collect', async (i) => {
                    if (i.customId === "zoom_auth_unlink_yes") {
                        const zoomUser = await ZoomMeetingSchema.findByIdAndDelete(i.user.id);
                        const successEmbed = new MessageEmbed()
                            .setTitle(`✅ Zoom account unlinked`)
                            .setColor("GREEN")
                            .setDescription(`Your Zoom account has been unlinked from this bot!`)
                        
                        i.update({
                            embeds: [successEmbed],
                            components: [components(true)],
                        });
                    } else if (i.customId === "zoom_auth_unlink_no") {
                        i.update({
                            components: [components(true)],
                        });
                        collector.stop()
                    }
                });
                collector?.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        interaction.editReply({
                            content: '❌ You took too long to respond, please try again',
                            components: [components(true)],
                        });
                    }
                })
            } else return {
                custom: true,
                content: '❌ You do not have a Zoom account linked to this bot',
                ephemeral: true,
            }
        } else if (subCommand === 'list') {
            const zoomUser = await ZoomMeetingSchema.findById(interaction.user.id) as any;

            if (zoomUser) {
                const { data: user } = await zoom.user.getInfo(zoomUser.token);
                if (user) {
                    try {
                        const { data } = await zoom.meeting.list(zoomUser.token);

                        if (data.meetings.length > 0) {
                            const embed = new MessageEmbed()
                                .setTitle(`📋 Zoom Meetings`)
                                .setColor("BLUE")
                                .setDescription(`Here are the Zoom meetings you have created`)
                            for (const meeting of data.meetings) {
                                let meetingData = ``;
                                meetingData += `**Meeting Topic**: ${meeting.topic}\n`;
                                meetingData += `**Meeting URL**: [Join Meeting](${meeting.join_url})`;
                                embed.addField(`${meeting.id}`, `${meetingData}`, true);
                            }

                            interaction.reply({
                                embeds: [embed],
                            });
                        } else {
                            interaction.reply({
                                content: '❌ You have not created any Zoom meetings yet!',
                            });
                        }
                    } catch (error) {
                        interaction.reply({
                            content: '❌ You have not created any Zoom meetings yet!',
                        });
                    }
                } else return {
                    custom: true,
                    content: '❌ Unable to find user',
                }
            } else return {
                custom: true,
                content: '❌ You do not have a Zoom account linked to this bot',
                ephemeral: true,
            }
        }
    }
} as ICommand;