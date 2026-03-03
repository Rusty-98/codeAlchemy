// Controllers/fileController.js
import archiver from 'archiver';
import streamBuffers from 'stream-buffers';
import { parseTextWithGemini } from '../Utils/geminiParser.js';
import User from '../Models/User.js';
import { logger } from '../Utils/logger.js';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

const DAILY_LIMIT = 10;

const fileController = {
  uploadAndParse: async (req, res) => {
    try {
      const { userId } = req.auth;
      if (!userId) return res.status(401).json({ error: 'Not authenticated. Please sign in.' });

      const { text } = req.body;
      if (!text || typeof text !== 'string') return res.status(400).json({ error: 'No text provided.' });
      if (text.trim().length < 10) return res.status(400).json({ error: 'Input text is too short.' });
      if (text.length > 20000) return res.status(400).json({ error: 'Input text exceeds 20,000 character limit.' });

      let user = await User.findOne({ clerkUserId: userId });
      if (!user) user = await User.create({ clerkUserId: userId });

      const today = todayString();
      let usageEntry = user.usage.find(u => u.date === today);
      if (!usageEntry) {
        usageEntry = { date: today, count: 0 };
        user.usage.push(usageEntry);
      }

      if (usageEntry.count >= DAILY_LIMIT) {
        return res.status(403).json({
          error: `Daily limit of ${DAILY_LIMIT} generations reached. Come back tomorrow!`,
          limitReached: true,
        });
      }

      logger.info(`User ${userId} generating — ${usageEntry.count + 1}/${DAILY_LIMIT} today`);

      const parsedData = await parseTextWithGemini(text);

      if (!parsedData.files || parsedData.files.length === 0) {
        return res.status(400).json({ error: 'No files were generated. Try providing more detailed code.' });
      }

      const historyEntry = {
        createdAt: new Date(),
        inputLength: text.length,
        filesGenerated: parsedData.files.length,
        fileNames: parsedData.files.map(f => f.name),
      };
      if (user.history.length >= 50) user.history.shift();
      user.history.push(historyEntry);

      usageEntry.count += 1;
      await user.save();

      const outputBuffer = new streamBuffers.WritableStreamBuffer();
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(outputBuffer);
      parsedData.files.forEach(file => archive.append(file.content, { name: file.name }));
      await archive.finalize();
      const zipData = outputBuffer.getContents();

      if (!zipData) return res.status(500).json({ error: 'Error generating ZIP file.' });

      logger.info(`Done for user ${userId} — ${parsedData.files.length} files`);

      return res.json({
        used: usageEntry.count,
        remaining: DAILY_LIMIT - usageEntry.count,
        files: parsedData.files,
        zip: zipData.toString('base64'),
      });

    } catch (error) {
      logger.error('Error in uploadAndParse:', error.message);
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  },

  getStats: async (req, res) => {
    try {
      const { userId } = req.auth;
      if (!userId) return res.status(401).json({ error: 'Not authenticated.' });

      let user = await User.findOne({ clerkUserId: userId });
      if (!user) user = await User.create({ clerkUserId: userId });

      const today = todayString();
      const todayEntry = user.usage.find(u => u.date === today);
      const usedToday = todayEntry?.count || 0;
      const totalGenerations = user.usage.reduce((sum, u) => sum + u.count, 0);

      return res.json({
        plan: user.plan,
        usedToday,
        remainingToday: Math.max(0, DAILY_LIMIT - usedToday),
        dailyLimit: DAILY_LIMIT,
        totalGenerations,
        history: user.history.slice().reverse(),
      });
    } catch (error) {
      logger.error('Error in getStats:', error.message);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default fileController;