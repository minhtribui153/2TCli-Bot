import { Client, GuildMember, MessageSelectMenu } from "discord.js";
import WOKCommands from "wokcommands";

export default (client: Client, instance: WOKCommands) => {
    client.on("interactionCreate", async interaction => {
        if (!interaction.isSelectMenu()) return;

        const { customId, values, member } = interaction;

        if (customId === "auto_roles" && member instanceof GuildMember) {
            const component = interaction.component as MessageSelectMenu;
            const removed = component.options.filter((option) => {
                return !values.includes(option.value);
            });

            try {
                for (const id of removed) {
                    await member.roles.remove(id.value);
                }
    
                for (const id of values) {
                    await member.roles.add(id);
                }
                await interaction.reply({
                    content: 'Roles updated!',
                    ephemeral: true,
                });
                
            } catch (error) {
                interaction.reply({
                    content: `❌ \`${error}\``,
                    ephemeral: true,
                });
            }

        }
    })
}

export const config = {
    displayName: "Auto Role System",
    dbName: "2TCli"
}