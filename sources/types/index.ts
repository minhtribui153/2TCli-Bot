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