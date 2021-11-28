import { ICommand } from "wokcommands";

const actions = ['give', 'remove', 'has'];

export default {
    category: 'Moderation',
    description: 'Manages the role of a user',
    permissions: ['MANAGE_ROLES'],
    minArgs: 3,
    expectedArgs: `<${actions.join('", "')}> <user @> <role @>`,
    slash: 'both',
    options: [
        {
            name: "action",
            description: `The action to perform. One of: ${actions.join(', ')}`,
            type: "STRING",
            required: true,
            choices: actions.map((action) => ({
                name: action,
                value: action,
            })),
        },
        {
            name: 'user',
            description: 'The user to perform the action on',
            type: 'USER',
            required: true,
        },
        {
            name: 'role',
            description: 'The role to perform the action on',
            type: 'ROLE',
            required: true,
        },
    ],

    callback: ({ guild, args }) => {
        const action = args.shift();
        if (!action || !actions.includes(action)) return {
            custom: true,
            content: `❌ Unknown action! Please choose one of the following: ${actions.join(', ')}`,
            ephemeral: true,
        }

        const memberId = args.shift()!.replace(/[<@!&>]/g, '');
        const roleId = args.shift()!.replace(/[<@!&>]/g, '');

        const member = guild!.members.cache.get(memberId);
        const role = guild!.roles.cache.get(roleId);

        if (!member) {
            return `❌ Unable to find member with ID ${memberId}`;
        }

        if (!role) {
            return `❌ Unable to find role with ID ${roleId}`;
        }

        switch(action) {
            case 'has':
                return member.roles.cache.has(roleId)
                    ? `ℹ️ Member <@${memberId}> has role <@&${roleId}>`
                    : `ℹ️ Member <@${memberId}> does not have role <@&${roleId}>`;
            case 'give':
                member.roles.add(role);
                return `✅ Role <@&${roleId}> given to <@${memberId}>`;
            
            case 'remove':
                member.roles.remove(role);
                return `✅ Role <@&${roleId}> removed from <@${memberId}>`;
        }

        return '❌ Unknown action!'
    }
} as ICommand;