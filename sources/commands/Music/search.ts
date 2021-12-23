import { QueryType, Track } from "discord-player";
import { Guild, GuildChannelResolvable, MessageEmbed, MessageReaction, ReactionCollector } from "discord.js";
import { Collection } from "mongoose";
import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Searches for music",
    guildOnly: true,
    slash: true,
    options: [
        {
            name: "query",
            description: "The song name to search",
            type: "STRING",
            required: true,
        }
    ],
    callback: async ({ interaction, member, guild, channel }) => {

        const query = interaction.options.getString("query") as string;

        if (!member.voice.channelId) {
            return {
                content: "<:red_cross_mark:921691762433613824> You need to be in a voice channel first",
                ephemeral: true,
            }
        }

        const searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });
        const queue = await player.createQueue(guild as Guild, {
            metadata: channel,
        });

        const embed = new MessageEmbed()
            .setAuthor(member?.user.username, member?.user.displayAvatarURL({ dynamic: true }))
            .setTitle("🎶 Music Search 🎶")
            .setDescription(`Here are the top 10 results for \`${query}\``);
        
        const emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

        for (let i = 0; i < 10; i++) {
            embed.addField(`${emojis[i]} ${searchResult.tracks[i].title}`, `**Author:** ${searchResult.tracks[i].author}\n**URL:** ${searchResult.tracks[i].url}`);
        }

        const message = await interaction.reply({
            embeds: [embed],
            fetchReply: true,
        }) as any;
        for (const emoji of emojis) {
            message.react(emoji);
        }

        const filter = (reaction: any, user: any) => {
            return user.id === member.id;
        };

        const collector = message.createReactionCollector({ filter, time: 30000 }) as ReactionCollector;

        collector.on('collect', async (reaction, user) => {
            const track = searchResult.tracks[emojis.indexOf(reaction.emoji.name as string)] as Track;

            await message.reactions.removeAll()

            if (!queue.connection)
                await queue.connect(member?.voice.channel as GuildChannelResolvable);
            
            const msg = (queue.tracks.length > 0 || queue.current)
                ? `✅ **Added to Queue**: \`${track.title}\``
                : `🎶 **Now Playing**: \`${track.title}\``;
            
            interaction.followUp({ content: msg });
                
            searchResult.playlist
                ? queue.addTracks(searchResult.tracks)
                : queue.addTrack(track);
                
            if (!queue.playing) await queue.play();
        });
        collector.on('end', async (collected, reason) => {
            if (reason === "time") {
                await message.reactions.removeAll();
            }
        })
    }
} as ICommand;