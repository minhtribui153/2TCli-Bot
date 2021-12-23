import { MessageEmbed, ReactionCollector } from "discord.js";
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
            content: "<:red_cross_mark:921691762433613824> No music is currently being played",
            ephemeral: true,
        }

        const progress = queue.createProgressBar();
        const perc = queue.getPlayerTimestamp();

        const filter = (reaction: any, user: any) => {
            return user.id === member.id;
        };

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
            .addField("Author", `${queue.current.author}`)
            .addField("Source", source)
            .addField("\u200b", progress)
            .setColor("YELLOW")
            .setFooter(`Queued by ${queue.current.requestedBy.tag}`, queue.current.requestedBy.displayAvatarURL({ dynamic: true }))
            .setThumbnail(queue.current.thumbnail);
        
        const message = await interaction.reply({ embeds: [embed], fetchReply: true }) as any;

        message.react(reactEmoji);

        let stop = false;

        const endEmbed = new MessageEmbed()
            .setTitle("🎶 Queue Ended 🎶")
            .setDescription(`The queue has ended and the bot has left the channel`)
            .setColor("RED");

        
        const repeat = () => {
            const queue2 = player.getQueue(guild?.id as string);

            if (!queue2) {
                collector.emit('end');
                message.reactions.removeAll();
                interaction.editReply({ embeds: [endEmbed] });
                stop = true;
            }

            if (stop === true) return;

            if (queue2.current.source === "youtube") {
                source = "<:YouTube:921283491344314368> YouTube";
            } else if (queue2.current.source === "spotify") {
                source = "<:Spotify:921285166402527254> Spotify";
            } else if (queue2.current.source === "soundcloud") {
                source = "<:SoundCloud:921319045628854293> SoundCloud";
            }

            if (!queue2.playing) {
                setTimeout(repeat, 2000);
                return;
            }

            const progress2 = queue2.createProgressBar();
            const perc2 = queue2.getPlayerTimestamp();

            const embed2 = new MessageEmbed()
                .setTitle("Now Playing")
                .setDescription(`🎶 | [**${queue2.current.title}**](${queue2.current.url}) (\`${perc2.progress}%\`)`)

            .addField("Author", `${queue.current.author}`)
                .addField("Source", source)
                .addField("\u200b", progress2)
                .setColor("YELLOW")
                .setFooter(`Queued by ${queue2.current.requestedBy.tag}`, queue2.current.requestedBy.displayAvatarURL({ dynamic: true }))
                .setThumbnail(queue2.current.thumbnail);
            interaction.editReply({ embeds: [embed2] });

            setTimeout(repeat, 2000);
        }
        
        setTimeout(repeat, 2000);

        const collector = message.createReactionCollector({ filter }) as ReactionCollector

        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === reactEmoji) {
                await message.reactions.removeAll();
                stop = true;
            }
        });
    }
} as ICommand;