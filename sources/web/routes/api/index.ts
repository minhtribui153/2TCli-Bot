import { guilds } from "../../../index";
import express from "express";

const router = express.Router();

router.get('/guilds', (req, res) => {
    res.send({ guilds });
});

router.get('/guilds/count', (req, res) => {
    res.send({
        guildCount: guilds.length,
    });
});

export default router;