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

        let engine = QueryType.AUTO;
        if (query.includes('open.spotify.com/playlist')) {
            engine = QueryType.SPOTIFY_PLAYLIST;
        } else if (query.includes('open.spotify.com/album')) {
            engine = QueryType.SPOTIFY_ALBUM;
        } else if (query.includes('soundcloud.com')) {
            engine = QueryType.SOUNDCLOUD;
        }

        interaction.deferReply();

        const searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: engine,
        });
        const queue = await player.createQueue(guild as Guild, {
            metadata: channel,
        });

        if (!searchResult.tracks[0]) {
            return interaction.editReply({ content: "❌ No results found" });
        }

        if (!queue.connection)
            await queue.connect(member?.voice.channel as GuildChannelResolvable);

        if (query.includes('open.spotify.com/playlist')) {
            const msg = (queue.tracks.length > 0 || queue.current)
                ? `✅ | **Added ${searchResult.tracks.length} songs from Spotify to Queue**`
                : `✅ | **Added ${searchResult.tracks.length} songs from Spotify to Queue**\n🎶 | **Now Playing**: \`${searchResult.tracks[0].title}\``
            
            interaction.editReply({ content: msg });

            searchResult.playlist
            ? queue.addTracks(searchResult.tracks)
            : queue.addTrack(searchResult.tracks[0]);

            if (!queue.playing) await queue.play();
        } else if (query.includes('youtube.com/playlist')) {
            const msg = (queue.tracks.length > 0 || queue.current)
                ? `✅ | **Added ${searchResult.tracks.length} tracks from YouTube to Queue**`
                : `✅ | **Added ${searchResult.tracks.length} tracks from YouTube to Queue**\n🎶 | **Now Playing**: \`${searchResult.tracks[0].title}\``
            
            interaction.editReply({ content: msg });

            searchResult.playlist
            ? queue.addTracks(searchResult.tracks)
            : queue.addTrack(searchResult.tracks[0]);
            
            if (!queue.playing) await queue.play();
        } else {
            const msg = (queue.tracks.length > 0 || queue.current)
                ? `✅ | **Added to Queue**: \`${searchResult.tracks[0].title}\``
                : `🎶 | **Now Playing**: \`${searchResult.tracks[0].title}\``;
            
            interaction.editReply({ content: msg });

            searchResult.playlist
            ? queue.addTracks(searchResult.tracks)
            : queue.addTrack(searchResult.tracks[0]);

            if (!queue.playing) await queue.play();
        }
        return;
    }
} as ICommand; 