import { Channel, ContextMenuInteraction, Guild, TextBasedChannels, User } from "discord.js";

// Types
export type Item = {
    name: string;
    description: string;
    price: number;
    icon: string;
}

export type Category = {
    label: string
    amount: number
    emoji: string
};

export type Source = "spotify" | "youtube" | "soundcloud";

export type ContextMenuCallback = {
    interaction: ContextMenuInteraction;
    channel: TextBasedChannels | null;
    user: User;
    guild: Guild | null;
}

// Interfaces
export interface IContextMenu {
    description: string;
    callback: (options: ContextMenuCallback) => void;
}
