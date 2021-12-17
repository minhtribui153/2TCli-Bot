import mongoose, { Schema } from 'mongoose';

const EconomySchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    wallet: {
        type: Number,
        default: 0,
    },
    bank: {
        type: Number,
        default: 0,
    },
    items: {
        type: Object,
        default: {},
    }
});

const name = 'economy';
export default mongoose.model(name, EconomySchema, name);