import { Interaction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from "discord.js";
import { ICommand } from "wokcommands";
import { Category } from "../../types";

export default {
    category: "Utility",
    description: "Opens help panel",
    guildOnly: true,
    slash: true,
    expectedArgs: "[command]",
    expectedArgsTypes: ["STRING"],
    options: [
        {
            name: "command",
            description: "The command to check information for",
            type: "STRING",
            required: false,
        },
    ],
    callback: async ({ instance, guild, interaction, message, channel, member, args }) => {

        const commandName = args.shift();
        const {
            commandHandler: { commands, getICommand },
            messageHandler,
        } = instance

        
        
        const categories: {
            [key: string]: {
                amount: number
                emoji: string
            }
        } = {};
        
        const isAdmin = member && member.permissions.has('ADMINISTRATOR')
        
        for (const { category, testOnly } of commands) {
            if (
                !category ||
                (testOnly && guild && !instance.testServers.includes(guild.id)) ||
                (!isAdmin && instance.hiddenCategories.includes(category))
            ) {
                continue
            }
                
            if (categories[category]) {
                ++categories[category].amount
            } else {
                categories[category] = {
                    amount: 1,
                    emoji: instance.getEmoji(category),
                }
            }
        }
            
        const categories2: Category[] = [];
            
        const keys = Object.keys(categories);
            
        for (const key of keys) {
            categories2.push({
                label: key,
                amount: categories[key].amount,
                emoji: categories[key].emoji,
            });
        }

        if (commandName) {
            let foundCommand: ICommand = {} as ICommand;
            const commands: ICommand[] = instance.commandHandler.commands as ICommand[];
            commands.forEach((cmd: ICommand) => {
                if (cmd.names![0].includes(commandName)) {
                    foundCommand = cmd;
                }
            });
            if (!foundCommand.names) {
                return {
                    custom: true,
                    content: `❌ No such command named \`${commandName}\``,
                    ephemeral: true,
                }
            }

            if (foundCommand.testOnly) {
                return {
                    custom: true,
                    content: `❌ This command is for testing servers only!`,
                    ephemeral: true,
                }
            }

            if (foundCommand.names) {
                const embed = new MessageEmbed()
                    .setTitle(`Help Panel - ${foundCommand.names[0]} Command`)
                    .setDescription(foundCommand.description)
                    .addField('Syntax', `${foundCommand.syntax === "" ? "No Syntax" : `\`${foundCommand.syntax}\``}`)
                    .addField('Category', `${categories[foundCommand.category].emoji} ${foundCommand.category}`)
                    .setColor('RANDOM')
                    .setFooter(`${categories[foundCommand.category].amount - 1} command${( (categories[foundCommand.category].amount - 1) === 1) ? "" : "s"} ${((categories[foundCommand.category].amount - 1) === 1) ? "is" : "are"} in the same category as this command`);
        
                
                return {
                    custom: true,
                    embeds: [embed],
                }
            }
        }
            
        // console.log(categories2);

        const embed = new MessageEmbed()
            .setTitle('Help Panel')
            .setDescription('Please select a category in the Dropdown menu')
            .setColor('DARK_RED');
        
        const components = (state: boolean, buttonState: boolean) => new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('help_menu')
                .setPlaceholder('Please select a command category')
                .setDisabled(state)
                .addOptions(
                    categories2.map((category) => {
                        return {
                            label: `${category.label} - ${category.amount} command${category.amount === 1 ? "" : "s"}`,
                            value: category.label,
                            description: `Commands from ${category.label} category`,
                            emoji: category.emoji,
                        }
                    })
                ),
            );
        const buttonComponent = (state: boolean) => new MessageActionRow()
            .addComponents(
                    new MessageButton()
                    .setCustomId('help_exit')
                    .setLabel('End Interaction')
                    .setDisabled(state)
                    .setStyle("DANGER")
                    .setEmoji('❌')
            )

        const filter = (interaction: any) => interaction.user.id === member?.id;

        const msg = interaction || message;
        
        let hasActivity = false;

        const initialMsg = msg.reply({
            embeds: [embed],
            components: [components(false, true), buttonComponent(true)],
        }) as any;
        const collector = channel?.createMessageComponentCollector({ filter });

        let counter = 0;
        const maxLimitInactivity = 10;
        const checkForInactivity = () => {
            if (hasActivity === true) return;
            if (counter === maxLimitInactivity) {
                hasActivity = false;
                collector.emit('end');
                return
            }
            counter += 1;
            setTimeout(checkForInactivity, 1000);
        }

        await checkForInactivity();

        collector.on("collect", (interaction) => {
            counter = 0;
            if (interaction.isButton()) {
                if (interaction.customId === "help_exit") {
                    hasActivity = true;
                    collector.emit('end');
                    const EndEmbed = new MessageEmbed()
                        .setTitle(`Help Panel - Session Expired`)
                        .setDescription(`❌ The session for this command has expired because you ended the interaction!`)
                        .setColor('RED');
                    
                    interaction.update({ embeds: [EndEmbed], components: [components(true, true), buttonComponent(true)] });
                    
                    return;
                }
            }
            if (!interaction.isSelectMenu()) return;
            if (interaction.customId !== "help_menu") return;
            const values = interaction.values;
            const commands = instance.commandHandler.getCommandsByCategory(
                values[0],
                true
            ) as ICommand[];
            const categoryEmbed = new MessageEmbed()
                .setTitle(`Help Panel - ${values[0]} Category`)
                .setDescription(`Here are the commands from ${values[0].toLowerCase()} category`)
                .setColor('RANDOM');
            
            for (const command of commands) {
                let name = command.names? command.names[0] : "Command Not Found";
                let description = command.description? command.description : "Description Not Found";

                categoryEmbed.addField(name, `└─ ${description}`);
            }
            
            interaction.update({ embeds: [categoryEmbed], components: [components(false, false),  buttonComponent(false)] });
            return;
        });
        collector.on("end", () => {
            if (hasActivity) return;
            const EndEmbed = new MessageEmbed()
            .setTitle(`Help Panel - Session Expired`)
            .setDescription(`❌ The session for this command has expired due to timeout!`)
            .setColor('RED');
            if (interaction) {
                interaction.editReply({ embeds: [EndEmbed], components: [components(true, true), buttonComponent(true)] });
                return
            } else {
                initialMsg.edit({ components: [components(true, true)] });
            }
        })

    }
} as ICommand;