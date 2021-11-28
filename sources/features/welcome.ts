import { Client, TextChannel } from "discord.js";
import WOKCommands from "wokcommands";
import WelcomeSchema from "../models/WelcomeSchema";

const welcomeData = {} as {
    // guildID: [channel, message]
    [key: string]: [TextChannel, string]
}

export default (client: Client, instance: WOKCommands) => {
    client.on('guildMemberAdd', async (member) => {
        console.log('[INFO] New member joined');
        const { guild, id } = member;

        let data = welcomeData[guild.id];

        if (!data) {
            const results = await WelcomeSchema.findById(guild.id);
            if (!results) return;

            const { channelId, text } = results;
            const channel = guild.channels.cache.get(channelId) as TextChannel;
            data = welcomeData[guild.id] = [channel, text];
        }

        data[0].send({
            content: data[1].replace(/@/g, `<@${id}>`),
        })
    })
}

export const config = {
    displayName: 'Welcome Channel',
    dbName: 'WELCOME_CHANNEL',
}
