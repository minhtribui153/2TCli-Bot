import mongoose, { Schema } from 'mongoose';

const GiveawaySchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    giveawayId: {
        type: String,
        required: true,
    },
    messageId: {
        type: String,
        required: true,
    },
    expiryTime: {
        type: Date,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    appliedMembers: {
        type: Array,
        default: [],
    }
});

export default mongoose.model('giveaways', GiveawaySchema, 'giveaways');