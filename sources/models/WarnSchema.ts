import mongoose, { Schema } from 'mongoose';

const WarnSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        guildId: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        staffId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const name = 'warnings';
export default mongoose.model(name, WarnSchema, name);