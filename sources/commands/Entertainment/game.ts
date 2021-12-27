import { ButtonInteraction, InteractionCollector, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import simplyDjs from 'simply-djs';
import { ICommand } from 'wokcommands';

export default {
    category: "Entertainment",
    description: "Some games to play",
    options: [
        {
            name: "tictactoe",
            description: "A Tic Tac Toe Game",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "target",
                    description: "The target to play with",
                    type: "USER",
                    required: true,
                }
            ]
        },
        {
            name: "rps",
            description: "A Rock Paper Scissors Game",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "target",
                    description: "The target to play with",
                    type: "USER",
                    required: true,
                }
            ]
        },
    ],
    slash: true,
    callback: async ({ interaction }) => {
        interaction.deferReply();
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === "tictactoe") {
            simplyDjs.tictactoe(interaction, {
                credit: false,
                slash: true,
                embedFoot: "Try your best to win!",
                embedColor: "RED",
                userSlash: "target",
                xEmoji: '❌',
                oEmoji: '⭕',
                idleEmoji: "➖"
            });
        } else if (subCommand === "rps") {
            const rock = new MessageButton()
                .setLabel('Rock')
                .setCustomId('rock')
                .setStyle("DANGER")
                .setEmoji('🪨')

            const paper = new MessageButton()
                .setLabel('Paper')
                .setCustomId('paper')
                .setStyle("SECONDARY")
                .setEmoji('🗞️')

            const scissors = new MessageButton()
                .setLabel('Scissors')
                .setCustomId('scissors')
                .setStyle("SUCCESS")
                .setEmoji('✂️')
            
            const rpsComponents = new MessageActionRow().addComponents([
                rock,
                paper,
                scissors
            ])
            const timeoutEmbed = new MessageEmbed()
                .setTitle('❌ Game timed out')
                .setColor("RED")
                .setDescription('One or more players did not make a move in time')
            const opponent = interaction.options.getUser('target')
            
            await interaction.deferReply().catch(() => {})
            
            if (!opponent)
                return await interaction.followUp({
                    content: '❌ No opponent mentioned!',
                    ephemeral: true
                })
            if (opponent.bot)
                return await interaction.followUp({
                    content: "❌ You can't play against bots",
                    ephemeral: true
                })
            if (opponent.id === interaction.user.id)
                return await interaction.followUp({
                    content: '❌ You cannot play by yourself!',
                    ephemeral: true
                });
            
            const accept = new MessageButton()
                .setLabel('Accept')
                .setStyle('SUCCESS')
                .setCustomId('accept')
        
            const decline = new MessageButton()
                .setLabel('Decline')
                .setStyle('DANGER')
                .setCustomId('decline')
        
            const acceptComponents = new MessageActionRow().addComponents([
                accept,
                decline
            ])
            
            const acceptEmbed = new MessageEmbed()
                .setTitle(`🕙 Waiting for ${opponent.tag} to accept`)
                .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
                .setColor("YELLOW")

            interaction.followUp({
                content: `Hey <@${opponent.id}>. You got a RPS invite`,
                embeds: [acceptEmbed],
                components: [acceptComponents]
            })
            
            const acceptCollector = interaction.channel?.createMessageComponentCollector({
                componentType: 'BUTTON',
                time: 30000
            }) as InteractionCollector<ButtonInteraction>;
            
            acceptCollector.on('collect', async (button) => {
                if (button.user.id !== opponent.id)
                    return await button.reply({
                        content: '❌ You can\'t play the game as they didnt call you to play.',
                        ephemeral: true
                    })
            
                if (button.customId == 'decline') {
                    await button.deferUpdate()
                    return acceptCollector.stop('decline')
                }
            
                await button.deferUpdate()
                const selectEmbed = new MessageEmbed()
                    .setTitle(`${interaction.user.tag} VS. ${opponent.tag}`)
                    .setColor("BLUE")
                    .setDescription('Select 🪨, 📄, or ✂️')
            
                await interaction.editReply({
                    content: '**Lets play..**',
                    embeds: [selectEmbed],
                    components: [rpsComponents]
                })
            
                acceptCollector.stop()
                let ids = new Set()
                ids.add(interaction.user.id)
                ids.add(opponent.id)
                let op: any, auth: any;
            
                const btnCollector = interaction.channel?.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    time: 30000
                }) as InteractionCollector<ButtonInteraction>;
                btnCollector.on('collect', async (b) => {
                    if (!ids.has(b.user.id))
                        return await button.reply({
                            content: 'You cant play the game as they didnt call u to play.',
                            ephemeral: true
                        })
                    ids.delete(b.user.id)

                    await b.deferUpdate()

                    if (b.user.id === opponent.id) op = b.customId
                    if (b.user.id === interaction.user.id) auth = b.customId
                    setTimeout(() => {
                        if (ids.size == 0) btnCollector.stop()
                    }, 500)
                })
            
                btnCollector.on('end', async (collected, reason) => {
                    if (reason === 'time') {
                        await interaction.editReply({
                            content: '** **',
                            embeds: [timeoutEmbed],
                            components: []
                        })
                    } else {
                        const winnerMap: any = {
                            rock: 'scissors',
                            scissors: 'paper',
                            paper: 'rock'
                        }
                        if (op === auth) {
                            op = op
                                .replace('scissors', '✂️ Scissors')
                                .replace('paper', '📄 Paper')
                                .replace('rock', '🪨 Rock')
                            await interaction.editReply({
                                content: '** **',
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle('Draw!')
                                        .setColor("YELLOW")
                                        .setDescription(`Both players chose **${op}**`)
                                ],
                                components: []
                            })
                        } else if (winnerMap[op] === auth) {
                            op = op
                                .replace('scissors', '✂️ Scissors')
                                .replace('paper', '📄 Paper')
                                .replace('rock', '🪨 Rock')
                            auth = auth
                                .replace('scissors', '✂️ Scissors')
                                .replace('paper', '📄 Paper')
                                .replace('rock', '🪨 Rock')
                            //op - won
                            await interaction.editReply({
                                content: '** **',
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle(`${opponent.tag} Wins!`)
                                        .setColor("GREEN")
                                        .setDescription(`**${op}** defeats **${auth}**`)
                                ],
                                components: []
                            })
                        } else {
                            op = op
                                .replace('scissors', '✂️ Scissors')
                                .replace('paper', '📄 Paper')
                                .replace('rock', '🪨 Rock')
                            auth = auth
                                .replace('scissors', '✂️ Scissors')
                                .replace('paper', '📄 Paper')
                                .replace('rock', '🪨 Rock')
                            //auth - won
                            await interaction.editReply({
                                content: '** **',
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle(`${interaction.user.tag} Wins!`)
                                        .setColor("GREEN")
                                        .setDescription(`**${auth}** defeats **${op}**`)
                                ],
                                components: []
                            })
                        }
                    }
                })
            })
            
            acceptCollector.on('end', async (coll, reason) => {
                if (reason === 'time') {
                    await interaction.editReply({
                        content: '** **',
                        embeds: [
                            new MessageEmbed()
                                .setTitle('Challenge Not Accepted in Time')
                                .setAuthor(
                                    interaction.user.tag,
                                    interaction.user.displayAvatarURL()
                                )
                                .setColor("RED")
                                .setDescription('Ran out of time!\nTime limit: 30s')
                        ],
                        components: []
                    })
                } else if (reason === 'decline') {
                    await interaction.editReply({
                        content: '** **',
                        embeds: [
                            new MessageEmbed()
                                .setTitle('Game Declined!')
                                .setAuthor(
                                    interaction.user.tag,
                                    interaction.user.displayAvatarURL()
                                )
                                .setColor(0xc90000)
                                .setDescription(`${opponent.tag} has declined your game!`)
                        ],
                        components: []
                    })
                }
            })
        }
    }
} as ICommand;