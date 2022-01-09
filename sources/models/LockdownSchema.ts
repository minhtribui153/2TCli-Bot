import mongoose, { Schema } from "mongoose";

const Lockdown = new Schema({
    _id: {
        type: String,
        required: true,
    },
    channels: {
        type: Array,
        default: [],
    }
});

const name = 'ignoredlockdownchannels';

export default mongoose.model(name, Lockdown, name);