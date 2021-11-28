import mongoose, { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true,
}

const Welcome = new Schema({
    _id: reqString,
    channelId: reqString,
    text: reqString,
});

const name = 'welcomechannels';

export default mongoose.model(name, Welcome, name);