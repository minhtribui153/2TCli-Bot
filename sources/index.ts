import DiscordJS, { Intents } from 'discord.js';
import RPC from 'discord-rpc';
import WOKCommands from 'wokcommands';
import path from 'path';
import 'dotenv/config';


const prefix = process.env.BOT_PREFIX || "!";
const mongoURI = process.env.DB_URI as string;
const guilds: any[] = [];
let ready: boolean = false;

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

if (!process.env.BOT_ID) {
    console.log('Error > No bot ID found');
    process.exit(1);
}

export const rpc = new RPC.Client({
    transport: 'ipc',
});


const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

rpc.on("ready", () => {
    console.log("Info > Rich Presence Ready");
    rpc.setActivity({
        details: `Starting Discord Bot`,
        largeImageKey: 'power',
        smallImageKey: 'bot',
        instance: true,
    })
})
client.on('ready', async () => {
    client.user?.setActivity('Bot is Starting', { type: "LISTENING" })
    setTimeout(() => {
        ready = true;
        rpc.setActivity({
            details: `Developing Discord Bot`,
            largeImageKey: 'power',
            smallImageKey: 'bot',
            instance: true,
        });
        client.user?.setActivity('/help', { type: 'LISTENING' });
    }, 62000)
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
client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) {
        if (!ready) return interaction.reply({ content: `🤖 Bot is starting, please wait...`, ephemeral: true });
    }
});

export default client;

rpc.login({ clientId: `${process.env.BOT_ID}`});
client.login(process.env.BOT_TOKEN);