import { ICommand } from "wokcommands";

export default {
    category: 'Server',
    description: 'Checks latency',
    slash: "both",

    callback: ({ client }) => {
        return `🏓 Pong! \`${client.ws.ping}ms\``;
    }
} as ICommand;