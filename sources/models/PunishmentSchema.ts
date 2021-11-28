import mongoose, { Schema } from 'mongoose';

const PunishmentSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        guildId: {
            type: String,
            required: true,
        },
        staffId: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        expires: Date,
        type: {
            type: String,
            required: true,
            enum: ["ban", "mute"]
        }
    },
    {
        timestamps: true,
    }
);

const name = 'punishments';

export default mongoose.model(name, PunishmentSchema, name);