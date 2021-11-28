import { GuildChannel } from "discord.js";
import { ICommand } from "wokcommands";
import WelcomeSchema from "../../models/WelcomeSchema";

export default {
    category: 'Welcome',
    description: 'Sets a channel to welcome new users',
    permissions: ['ADMINISTRATOR'],
    minArgs: 2,
    expectedArgs: '<channel> <text>',
    expectedArgsTypes: ['CHANNEL', 'STRING'],
    options: [
        {
            name: 'channel',
            description: 'The text channel you want to send the Welcome Message',
            type: "STRING",
            required: true,
        },
        {
            name: 'text',
            description: 'The text you want to send (use @ to indicate the joining member)',
            type: "STRING",
            required: true,
        }
    ],
    slash: 'both',

    callback: async ({ guild, message, interaction, args }) => {
        if (!guild) return {
            custom: true,
            content: '❌ Use this command within a server instead!',
            ephemeral: true,
        }

        const target = message
            ? message.mentions.channels?.first()
            : interaction.options.getChannel('channel') as GuildChannel;
        if (!target || target.type !== 'GUILD_TEXT') {
            return {
                custom: true,
                content: '❌ Tag a channel!',
                ephemeral: true,
            }
        }

        let text = interaction?.options.getString('text');
        if (message) {
            args.shift();
            text = args.join(' ');
        }

        await WelcomeSchema.findOneAndUpdate({
            _id: guild.id
        }, {
            _id: guild.id,
            text,
            channelId: target.id,
        }, {
            upsert: true,
        });

        return {
            custom: true,
            content: `✅ Welcome channel set to <#${target.id}>!`,
            ephemeral: true,
        }
        
    }
} as ICommand;