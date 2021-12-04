import DiscordJS, { Intents } from 'discord.js';
import WOKCommands from 'wokcommands';
import path from 'path';
import 'dotenv/config';


const prefix = process.env.BOT_PREFIX || "!";
const mongoURI = process.env.DB_URI as string;
const guilds: any[] = [];


const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

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
    
});

export default client;

client.login(process.env.BOT_TOKEN);