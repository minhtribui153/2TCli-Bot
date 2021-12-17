import player from '../music/player';
import axios from 'axios';
import { MessageEmbed } from "discord.js";

export const getLyrics = (title: string) =>
    new Promise(async (ful, rej) => {
        const url = new URL("https://some-random-api.ml/lyrics");
        url.searchParams.append("title", title);

        try {
            const { data } = await axios.get(url.href);
            ful(data);
        } catch (error) {
            rej(error);
        }
    });

export const substring = (length: any, value: any) => {
    const replaced = value.replace(/\n/g, "--");
    const regex = `.{1,${length}}`;
    const lines = replaced
        .match(new RegExp(regex, "g"))
        .map((line: any) => line.replace(/--/g, "\n"));

    return lines;
};

export const createResponse = async (title: string) => {
    try {
        const data = await getLyrics(title) as any;

        const embeds = substring(4096, data.lyrics).map((value: any, index: any) => {
            const isFirst = index === 0;

            return new MessageEmbed({
                title: isFirst ? `${data.title} - ${data.author}` : undefined,
                thumbnail: isFirst ? { url: data.thumbnail.genius } : undefined,
                description: value
            });
        });

        return { embeds };
    } catch (error) {
        return "❌ Unable to find lyrics for this song";
}};