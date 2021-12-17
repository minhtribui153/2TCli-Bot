import Client from "../index";
import { Player } from "discord-player";

const player: Player = new Player(Client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25,
    },
});

export default player;