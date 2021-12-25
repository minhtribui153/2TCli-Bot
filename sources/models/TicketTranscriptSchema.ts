import mongoose, { Schema } from 'mongoose';

const TicketTranscriptSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    }
});
const name = 'ticket-transcripts';
export default mongoose.model(name, TicketTranscriptSchema, name);