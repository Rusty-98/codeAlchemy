// Models/User.js
import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  inputLength: { type: Number },           // chars of input text
  filesGenerated: { type: Number },        // how many files came out
  fileNames: [{ type: String }],           // names of generated files
});

const usageSchema = new mongoose.Schema({
  date: { type: String, required: true },  // e.g. "2025-02-28"
  count: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  plan: { type: String, default: 'free' },
  usage: [usageSchema],
  history: {
    type: [generationSchema],
    default: [],
    validate: [arr => arr.length <= 50, 'History capped at 50 entries'],
  },
});

export default mongoose.model('User', userSchema);