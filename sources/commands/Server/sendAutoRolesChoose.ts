import { TextChannel } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Server',
    description: 'Initialize Role Choose for members to get their roles!',
    permissions: ["ADMINISTRATOR"],
    minArgs: 2,
    expectedArgs: '<channel> <text>',
    expectedArgsTypes: ["CHANNEL", "STRING"],
    slash: 'both',
    guildOnly: true,
    
    callback: ({ message, interaction, args }) => {
        const channel = (message ? message.mentions.channels.first(): interaction.options.getChannel('channel')) as TextChannel;
        if (!channel || channel.type !== "GUILD_TEXT") {
            return '❌ Please tag a text channel';
        }

        args.shift(); // Remove text channel from arguments array
        const text = args.join(' ');

        channel.send(text);

        if (interaction) {
            interaction.reply({
                content: '✅ Sent roles choose system!',
                ephemeral: true,
            });
        }
    }
} as ICommand;