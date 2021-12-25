import DiscordJS, { Intents } from 'discord.js';
import WOKCommands from 'wokcommands';
import path from 'path';
import 'dotenv/config';


const prefix = process.env.BOT_PREFIX || "!";
const mongoURI = process.env.DB_URI as string;
const guilds: any[] = [];

if (!process.env.BOT_TOKEN) {
    console.error('Error > No bot token found');
    process.exit(1);
}
if (!process.env.DB_URI) {
    console.error('Error > No MongoDB URI found');
    process.exit(1);
}
if (!process.env.BOT_OWNER_ID) {
    console.error('Error > No Bot Owner ID found');
    process.exit(1);
}

if (!process.env.BOT_PREFIX) {
    console.log('Error > No bot prefix found');
}


const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

client.on('ready', async () => {
    client.user?.setActivity('/help', { type: 'LISTENING' });
    client.guilds.cache.forEach(guild => guilds.push(guild));
    console.log(`Info > Joined ${guilds.length} servers`)
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'features'),
        botOwners: [process.env.BOT_OWNER_ID || "!"],
        mongoUri: mongoURI,
        dbOptions: {
            keepAlive: true,
        },
        typeScript: true,
        disabledDefaultCommands: ["help"],
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
            },
            {
                name: "Music",
                emoji: "🎶"
            },
            {
                name: "Ticketing",
                emoji: "🎟️",
            }
        ])
        .setDefaultPrefix(prefix);
    
});

export default client;

client.login(process.env.BOT_TOKEN);