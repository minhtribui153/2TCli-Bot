import { ICommand } from "wokcommands";
import axios, { Method } from "axios";
import { MessageEmbed } from "discord.js";

const actions = ['get', 'post', 'patch', 'delete', 'put'];

export default {
    category: "Utility",
    description: "Creates/Tests a API request to a API Server",
    minArgs: 2,
    expectedArgs: `<${actions.join('", "')}> <url> [json]`,
    slash: 'both',
    options: [
        {
            name: "action",
            description: `The action to perform an API Request. One of: ${actions.join(', ')}`,
            type: "STRING",
            required: true,
            choices: actions.map((action) => ({
                name: action.toUpperCase(),
                value: action,
            })),
        },
        {
            name: 'url',
            description: 'The URL to send an API request',
            type: 'STRING',
            required: true,
        },
        {
            name: 'json',
            description: 'The JSON to send the API request',
            type: 'STRING',
            required: false,
        },
    ],
    callback: async ({ client, channel, args, member }) => {

        // Check if the user is in a DM
        if (channel.type !== "GUILD_TEXT") {
            // If the user is in a DM, send a DM message to the user
            return {
                custom: true,
                content: "❌ This command can only be used in a server",
                ephemeral: true,
            }
        }

        // Get the action
        const action: Method = args.shift()?.toLowerCase() as Method;

        if (!action || !actions.includes(action)) return { 
            custom: true,
            content: `❌ Unknown action! Please choose one of the following: ${actions.join(', ')}`,
            ephemeral: true,
        }

        // Get the URL
        const url = args.shift() as string;

        // Get the JSON
        const json = args.join(' ') || '{}';
        
        // Convert JSON into an object
        const data = JSON.parse(json);

        const response = await axios({
            method: action,
            url,
            data,
        });

        // Create a MessageEmbed
        const embed = new MessageEmbed()
            .setColor(response.status === 200 ? 0x00FF00 : 0xFF0000)
            .setTitle(`API Request`)
            .setDescription(`${action.toUpperCase()} ${url}`)
            .addField('Response', `\`\`\`\n${(response.data.toString().length < 1024) ? response.data.toString() : 'Response exceeded 1024 characters, couldn\'t display on Discord Message'}\n\`\`\``)
            .addField('Status', response.status.toString())
            .setFooter(`API Request by ${member.user.tag}`, member.user.displayAvatarURL({ dynamic: true }));

        // Send a Message
        return {
            custom: true,
            embeds: [embed],
        }
    }
} as ICommand;