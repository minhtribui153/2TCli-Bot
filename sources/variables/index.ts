import { Item } from "../types";

export const items: Item[] = [
    {
        name: 'cellphone',
        description: 'This cell phone might come in handy!',
        price: 4500,
        icon: '📱',
    },
    {
        name: 'laptop',
        description: 'Use this laptop for entertainment!',
        price: 10000,
        icon: '💻',
    },
    {
        name: 'fishingpole',
        description: 'Use this for fishing!',
        price: 25000,
        icon: '🎣',
    },
    {
        name: 'padlock',
        description: 'Prevents people from robbing you!',
        price: 5000,
        icon: '🔒',
    },
    {
        name: 'bomb',
        description: 'Explodes and kills someone that triggers it while trying to rob you!',
        price: 100000,
        icon: '💣',
    },
    {
        name: 'banknote',
        description: 'Use this to increase your bank storage!',
        price: 200000,
        icon: '💸'
    }
];

export const itemChoices = [
    {
        name: '📱 Cellphone',
        value: 'cellphone',
    },
    {
        name: '💻 Laptop',
        value: 'laptop',
    },
    {
        name: '🎣 Fishing Pole',
        value: 'fishingpole',
    },
    {
        name: '🔒 Padlock',
        value: 'padlock',
    },
    {
        name: '💣 Bomb',
        value: 'bomb',
    },
    {
        name: 'banknote',
    }
]