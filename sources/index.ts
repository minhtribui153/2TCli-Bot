import DiscordJS, { Intents } from 'discord.js';
import WOKCommands from 'wokcommands';
import path from 'path';
import { start } from './web/app';
import 'dotenv/config';

/** Config */
const prefix = process.env.BOT_PREFIX || "!";

/** MongoDB */
// const mongoURI = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const mongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

/** Client */
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

export const guilds: any[] = [];

client.on('ready', async () => {
    client.user?.setActivity('Servers', { type: 'LISTENING' });
    client.guilds.cache.forEach(guild => guilds.push(guild));
    console.log(`Info > Joined ${guilds.length} servers`)
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'features'),
        botOwners: [process.env.BOT_OWNER_ID || ""],
        mongoUri: mongoURI,
        dbOptions: {
            keepAlive: true,
        },
        typeScript: true
    })
        .setCategorySettings([
            {
                name: 'Server',
                emoji: '🗺️',
            },
            {
                name: 'Moderation',
                emoji: '🛠️',
            },
            {
                name: 'Welcome',
                emoji: '👋',
            },
            {
                name: 'Entertainment',
                emoji: '🎲',
            },
            {
                name: 'Utility',
                emoji: '🔧',
            },
            {
                name: 'Documentation',
                emoji: '🧪',
            },
            {
                name: 'Backup',
                emoji: '💾',
            }
        ])
        .setDefaultPrefix(prefix);
    // Website
    // start(process.env.PORT || 3000);

    // Delete 'add' slash command using the command handler wokcommands
    
});

export default client;

client.login(process.env.BOT_TOKEN);