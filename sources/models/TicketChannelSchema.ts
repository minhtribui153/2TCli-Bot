import mongoose, { Schema } from 'mongoose';

const TicketChannelSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    categoryId: {
        type: String,
        required: true,
    }
});
const name = 'ticket-channels';
export default mongoose.model(name, TicketChannelSchema, name);