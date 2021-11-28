import { ICommand } from "wokcommands";

export default {
    category: 'Welcome',
    description: 'Simulates a member join event',
    permissions: ['ADMINISTRATOR'],
    slash: 'both',

    callback: ({ client, member }) => {
        client.emit('guildMemberAdd', member);
        return {
            custom: true,
            content: "✅ Member join event simulated!",
            ephemeral: true,
        }
    }
} as ICommand;