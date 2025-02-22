import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  count: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  plan: { type: String, default: 'free' },
  usage: [usageSchema]
});

export default mongoose.model('User', userSchema);
