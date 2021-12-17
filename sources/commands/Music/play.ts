import { QueryType } from "discord-player";
import { Guild, GuildChannelResolvable } from "discord.js";
import { ICommand } from "wokcommands";
import player from "../../music/player";

const wait = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    category: "Music",
    description: "Plays music",
    guildOnly: true,
    slash: true,
    options: [
        {
            name: 'query',
            description: "The song to play",
            type: "STRING",
            required: true,
        }
    ],
    callback: async ({ interaction, member, channel, guild }) => {
        const query = interaction.options.getString("query") as string;

        if (!member.voice.channelId) {
            return {
                custom: true,
                content: "❌ You need to be in a voice channel first",
                ephemeral: true,
            }
        }

        if (query.includes('open.spotify.com/artist')) {
            return {
                custom: true,
                content: "❌ Cannot search for Spotify artists!",
                ephemeral: true,
            }
        }

        interaction.deferReply();

        wait(2000);
        

        const searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });
        const queue = await player.createQueue(guild as Guild, {
            metadata: channel,
        });

        if (!queue.connection)
            await queue.connect(member?.voice.channel as GuildChannelResolvable);
        
        const msg = (queue.tracks.length > 0 || queue.current)
            ? `✅ | **Added to Queue**: \`${searchResult.tracks[0].title}\``
            : `🎶 | **Now Playing**: \`${searchResult.tracks[0].title}\``;
            
        interaction.editReply({ content: msg })

        
        searchResult.playlist
            ? queue.addTracks(searchResult.tracks)
            : queue.addTrack(searchResult.tracks[0]);

        if (!queue.playing) await queue.play();

    }
} as ICommand; 