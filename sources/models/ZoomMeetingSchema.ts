import mongoose, { Schema, Document, Model } from 'mongoose';

const ZoomMeetingSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

const name = "zoom_meeting_authentication";

export default mongoose.model(name, ZoomMeetingSchema, name);