import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import player from "../../music/player";

export default {
    category: "Music",
    description: "Shows information about the current song",
    guildOnly: true,
    slash: "both",
    callback: async ({ interaction, member, channel, guild }) => {

        const queue = player.getQueue(guild?.id as string);
        if (!queue?.playing) return {
            custom: true,
            content: "❌ No music is currently being played",
            ephemeral: true,
        }

        const progress = queue.createProgressBar();
        const perc = queue.getPlayerTimestamp();

        
        const buttonComponent = (state: boolean) => new MessageActionRow()
            .addComponents([
                new MessageButton()
                .setCustomId('end_nowplaying')
                .setLabel('End Interaction')
                .setDisabled(state)
                .setStyle("DANGER")
                .setEmoji('<:red_cross_mark:921691762433613824>'),
                new MessageButton()
                .setCustomId('music_controls_muted')
                .setLabel('Mute/Unmute')
                .setDisabled(state)
                .setStyle("SECONDARY")
                .setEmoji('🔇'),
                new MessageButton()
                .setCustomId('music_controls_stop')
                .setLabel('Stop')
                .setDisabled(state)
                .setStyle("DANGER")
                .setEmoji('🚪'),
            ]);
        
        const linkButton = (link: string, state: boolean) => new MessageActionRow()
        .addComponents([
            new MessageButton()
            .setURL(link)
            .setLabel('Song Link')
            .setDisabled(state)
            .setStyle("LINK")
            .setEmoji('🎵'),
        ]);
        
        const playComponent = (state: boolean) => new MessageActionRow()
            .addComponents([
                new MessageButton()
                .setCustomId('music_controls_playing')
                .setLabel('Pause/Resume')
                .setDisabled(state)
                .setStyle("PRIMARY")
                .setEmoji('⏯️'),
                new MessageButton()
                .setCustomId('music_controls_skip')
                .setLabel('Skip')
                .setDisabled(state)
                .setStyle("SUCCESS")
                .setEmoji('⏭️'),
                new MessageButton()
                .setCustomId('music_controls_volume_up')
                .setLabel('Volume Up')
                .setDisabled(state)
                .setStyle("SECONDARY")
                .setEmoji('🔊'),
                new MessageButton()
                .setCustomId('music_controls_volume_down')
                .setLabel('Volume Down')
                .setDisabled(state)
                .setStyle("SECONDARY")
                .setEmoji('🔉'),
            ])
            
        const reactEmoji = '⏹️';
        let source: string = "";
        if (queue.current.source === "youtube") {
            source = "<:YouTube:921283491344314368> YouTube";
        } else if (queue.current.source === "spotify") {
            source = "<:Spotify:921285166402527254> Spotify";
        } else if (queue.current.source === "soundcloud") {
            source = "<:SoundCloud:921319045628854293> SoundCloud";
        }
        const embed = new MessageEmbed()
            .setTitle("Now Playing")
            .setDescription(`🎶 | [**${queue.current.title}**](${queue.current.url}) (\`${perc.progress}%\`)`)
            .addField("💁 Author", `${queue.current.author}`, true)
            .addField("ℹ️ Source", source, true)
            .addField("⏭️ Next Track", queue.tracks[0] ? queue.tracks[0].title : "None", true)
            .addField('🔊 Volume', `${(queue.volume === 0) ? "Muted" : queue.volume + "%"}`, true)
            .addField("\u200b", progress)
            .setColor("YELLOW")
            .setFooter(`Queued by ${queue.current.requestedBy.tag}`, queue.current.requestedBy.displayAvatarURL({ dynamic: true }))
            .setThumbnail(queue.current.thumbnail);
        
        const message = await interaction.reply({ embeds: [embed], components: [buttonComponent(false), playComponent(false), linkButton(queue.current.url, false)] }) as any;
        
        let stop = false;
        
        const endEmbed = new MessageEmbed()
            .setTitle("🎶 Queue Ended 🎶")
            .setDescription(`The queue has ended and the bot has left the channel`)
            .setColor("RED");
        
        
        const repeat = () => {
            const queue2 = player.getQueue(guild?.id as string);
            
            if (!queue2) {
                collector.stop();
                interaction.editReply({ embeds: [endEmbed], components: [buttonComponent(true), playComponent(true), linkButton("https://google.com", true)] });
                stop = true;
            }
            
            if (stop === true) return;
            
            if (!queue2.playing) {
                setTimeout(repeat, 2000);
                return;
            }
            
            if (queue2.current.source === "youtube") {
                source = "<:YouTube:921283491344314368> YouTube";
            } else if (queue2.current.source === "spotify") {
                source = "<:Spotify:921285166402527254> Spotify";
            } else if (queue2.current.source === "soundcloud") {
                source = "<:SoundCloud:921319045628854293> SoundCloud";
            }
            
            const progress2 = queue2.createProgressBar();
            const perc2 = queue2.getPlayerTimestamp();
            
            const embed2 = new MessageEmbed()
            .setTitle("Now Playing")
            .setDescription(`🎶 | [**${queue2.current.title}**](${queue2.current.url}) (\`${perc2.progress}%\`)`)
            
            .addField("💁 Author", `${queue.current.author}`, true)
            .addField("ℹ️ Source", source, true)
            .addField("⏭️ Next Track", queue.tracks[0] ? queue.tracks[0].title : "None", true)
            .addField('🔊 Volume', `${(queue.volume === 0) ? "Muted" : queue.volume + "%"}`, true)
            .addField("\u200b", progress2)
            .setColor("YELLOW")
            .setFooter(`Queued by ${queue2.current.requestedBy.tag}`, queue2.current.requestedBy.displayAvatarURL({ dynamic: true }))
            .setThumbnail(queue2.current.thumbnail);
            interaction.editReply({ embeds: [embed2], components: [buttonComponent(false), playComponent(false), linkButton(queue2.current.url, false)] });
            
            setTimeout(repeat, 5000);
        }
            
        setTimeout(repeat, 5000);
            
        const filter = (i: any) => {
            return i.user.id === member.id;
        };

        const collector = channel?.createMessageComponentCollector({ filter, componentType: "BUTTON" });

        let paused = false;
        let muted = false

        let currentMutedVolume: number = queue.volume;

        collector.on('collect', async (i) => {
            if (i.customId === "end_nowplaying") {
                i.update({ components: [buttonComponent(true), playComponent(true)] });
                stop = true;
                collector.stop();
                return;
            } else if (i.customId === "music_controls_playing") {
                paused = !paused;
                queue.setPaused(paused);
                const msg2 = paused ? "⏸️ Paused" : "▶️ Resumed"
                i.reply({ content: msg2, ephemeral: true });
                return;
            } else if (i.customId === "music_controls_skip") {
                queue.skip();
                i.reply({ content: '⏭️ Skipped', ephemeral: true });
                return;
            } else if (i.customId === "music_controls_volume_up") {
                if ((queue.volume + 10) >= 100) {
                    queue.setVolume(100);
                } else {
                    queue.setVolume(queue.volume + 10);
                }
                i.reply({ content: `🔈 Volume is now at ${queue.volume}%`, ephemeral: true });
                return;
            } else if (i.customId === "music_controls_volume_down") {
                if ((queue.volume - 10) <= 0) {
                    queue.setVolume(0);
                } else {
                    queue.setVolume(queue.volume - 10);
                }
                i.reply({ content: `🔉 Volume is now at ${queue.volume}%`, ephemeral: true });
                return;
            } else if (i.customId === "music_controls_muted") {
                muted = !muted;
                if (muted) {
                    currentMutedVolume = queue.volume;
                    queue.setVolume(0);
                    i.reply({ content: `🔇 Track is now muted`, ephemeral: true });
                    return;
                } else {
                    queue.setVolume(currentMutedVolume);
                    i.reply({ content: `🔈 Track is now unmuted`, ephemeral: true });
                    return;
                }
            } else if (i.customId === "music_controls_stop") {
                queue.clear();
                queue.skip();
                collector.stop();
                i.reply({ content: '✅ Stopped the music and left the voice channel', ephemeral: true });
                return;
            }
        });
    }
} as ICommand;