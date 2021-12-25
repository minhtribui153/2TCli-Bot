import mongoose, { Schema } from 'mongoose';

const TicketSchema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    memberId: {
        type: String,
        required: true
    },
    ticketId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true,
    },
    closed: {
        type: Boolean,
        required: true,
    },
    locked: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        required: true,
    }
});
const name = 'ticket';

export default mongoose.model(name, TicketSchema, name);