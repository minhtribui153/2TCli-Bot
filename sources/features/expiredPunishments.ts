import { Client } from 'discord.js';
import PunishmentSchema from '../models/PunishmentSchema';

export default async (client: Client) => {
    client.on('guildMemberAdd', async member => {
        const result = await PunishmentSchema.findOne({
            guildID: member.guild.id,
            userID: member.id,
            type: 'mute',
        });

        if (result) {
            const mutedRole = member.guild.roles.cache.find(
                role => role.name === 'Muted',
            );

            if (mutedRole) {
                member.roles.add(mutedRole);
            }
        }
    });

    const check = async () => {
        const query = {
            expires: { $lt: new Date() },
        }

        const results = await PunishmentSchema.find(query);

        for (const result of results) {
            const { guildId, userId, type } = result;
            const guild = await client.guilds.fetch(guildId);
            if (!guild) {
                console.log(`Info > Guild with ID ${guildId} no longer uses this bot`);
                continue;
            }

            if (type === 'ban') {
                guild.members.unban(userId, 'Ban expired for this user');
            } else if (type === 'mute') {
                const muteRole = guild.roles.cache.find((role) => role.name === 'Muted');
                if (!muteRole) {
                    console.log(`Info > Mute role not found in Guild with ID ${guildId}`);
                    continue;
                }

                const member = guild.members.cache.get(userId);
                if (!member) continue;

                member.roles.remove(muteRole);
            }
        }

        await PunishmentSchema.deleteMany(query);
        
        setTimeout(check, 1000 * 30);
    }
    check();
}

export const config = {
    dbName: 'EXPIRED_PUNISHMENTS',
    displayName: 'Expired Punishments',
}