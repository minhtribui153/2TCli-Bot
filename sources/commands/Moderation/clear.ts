import { ICommand } from "wokcommands";
const wait = require('util').promisify(setTimeout);

export default {
    category: 'Moderation',
    description: 'Clears multiple messages at once in a text channel',
    permissions: ['ADMINISTRATOR'],
    requireRoles: true,
    aliases: ['cc', 'del', 'rm'],
    maxArgs: 1,
    expectedArgs: '[amount]',
    slash: 'both',

    callback: async ({ message, interaction, channel, args }) => {
        const amount = args.length ? parseInt(args.shift()!) : 10;

        const maxAmount = 100;

        if (amount > maxAmount) return {
            custom: true,
            content: `❌ Enter the clear amount that does not exceed \`${maxAmount}\` messages!`,
            ephemeral: true,
        }
        
        if ( message ) await message.delete();

        const messages = await channel.messages.fetch({ limit: amount });
        const { size } = messages;
        let msgSize = size;
        messages.forEach(async message => {
            message.delete();
            msgSize -= 1;
        });



        const text = `⏰ Clearing \`${size}\` messages, please wait...`

        if (interaction) {
            const checkForMessageSize = async () => {
                if (msgSize !== 0) {
                    setTimeout(checkForMessageSize, 100);
                } else {
                    interaction.editReply(`✅ Successfully cleared \`${size}\`!`);
                }
            }
            interaction.deferReply();
            await wait(1000);
            interaction.editReply(text);
            checkForMessageSize();
        } else {
            const msg = await channel.send(text);
            const checkForMessageSize = async () => {
                if (msgSize !== 0) {
                    setTimeout(checkForMessageSize, 100);
                } else {
                    msg.edit(`✅ Successfully cleared \`${size}\`!`);
                }
            }
            checkForMessageSize();
        }
    }
} as ICommand;