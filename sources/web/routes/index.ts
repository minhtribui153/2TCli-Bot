import express from "express";
import { guilds } from "../../index";
import api from './api';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Bot is running!');
});

export default router;