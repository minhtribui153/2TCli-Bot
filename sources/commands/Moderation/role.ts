import { Role, User } from "discord.js";
import { ICommand } from "wokcommands";

export default {
    category: 'Moderation',
    description: 'Manages the role of a user',
    permissions: ['MANAGE_ROLES'],
    slash: true,
    options: [
        {
            name: 'give',
            description: 'Gives a role to a user',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'user',
                    description: 'The user to give the role to',
                    type: 'USER',
                    required: true,
                },
                {
                    name: 'role',
                    description: 'The role to give the user',
                    type: 'ROLE',
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description: 'Removes a role from a user',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'user',
                    description: 'The user to remove the role from',
                    type: 'USER',
                    required: true,
                },
                {
                    name: 'role',
                    description: 'The role to remove from the user',
                    type: 'ROLE',
                    required: true,
                },
            ],
        },
        {
            name: 'has',
            description: 'Checks if a user has a role',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'user',
                    description: 'The user to check what role that user has',
                    type: 'USER',
                    required: true,
                },
                {
                    name: 'role',
                    description: 'The role to check if the user has that role',
                    type: 'ROLE',
                    required: true,
                }
            ],
        }
    ],

    callback: ({ interaction, guild, args }) => {
        const subCommand = interaction.options.getSubcommand();

        const member1 = interaction.options.getUser('user') as User;
        const role = interaction.options.getRole('role') as Role;

        const member = guild?.members.cache.get(member1.id);

        if (!member) {
            return {
                custom: true,
                content: `❌ Unable to find user`,
                ephemeral: true,
            };
        }

        if (!role) {
            return {
                custom: true,
                content: `❌ Unable to find role`,
                ephemeral: true,
            };
        }

        switch(subCommand) {
            case 'has':
                return member.roles.cache.has(role.id)
                    ? `ℹ️ Member <@${member.id}> has role <@&${role.id}>`
                    : `ℹ️ Member <@${member.id}> does not have role <@&${role.id}>`;
            case 'give':
                member.roles.add(role);
                return `✅ Role <@&${role.id}> given to <@${member.id}>`;
            
            case 'remove':
                member.roles.remove(role);
                return `✅ Role <@&${role.id}> removed from <@${member.id}>`;
        }
    }
} as ICommand;