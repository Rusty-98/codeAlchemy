// telegram-bot/bot.js
import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenerativeAI } from '@google/generative-ai';
import archiver from 'archiver';
import streamBuffers from 'stream-buffers';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('[Bot] Code Alchemy Telegram bot started...');

// Per-user state: track if they're in "waiting for code" mode
const waitingForCode = new Map();
// Rate limiting: track daily usage per telegram user id
const dailyUsage = new Map(); // userId -> { date, count }

const DAILY_LIMIT = 5; // Telegram bot gets 5/day free

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function checkLimit(userId) {
  const today = todayStr();
  const entry = dailyUsage.get(userId);
  if (!entry || entry.date !== today) {
    dailyUsage.set(userId, { date: today, count: 0 });
    return { allowed: true, used: 0, remaining: DAILY_LIMIT };
  }
  const remaining = DAILY_LIMIT - entry.count;
  return { allowed: remaining > 0, used: entry.count, remaining };
}

function incrementUsage(userId) {
  const today = todayStr();
  const entry = dailyUsage.get(userId) || { date: today, count: 0 };
  entry.count += 1;
  entry.date = today;
  dailyUsage.set(userId, entry);
}

async function parseWithGemini(text) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are a project generator. Analyze the following chat log and output ONLY a valid JSON object 
(with no extra text or markdown code fences) that lists the files to create with their complete code.
The JSON format should be:
{
  "files": [
    { "name": "filename.ext", "content": "complete file code" },
    ...
  ]
}
Chat log:
${text}
  `;

  const result = await model.generateContent(prompt);
  let responseText = result.response.text().trim();
  if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```(?:json)?\s*/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(responseText);
}

async function buildZip(files) {
  const outputBuffer = new streamBuffers.WritableStreamBuffer();
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(outputBuffer);
  files.forEach(file => archive.append(file.content, { name: file.name }));
  await archive.finalize();
  return outputBuffer.getContents();
}

// /start command
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || 'there';
  bot.sendMessage(msg.chat.id,
    `👋 Hey ${name}! I'm *Code Alchemy Bot*.\n\n` +
    `I turn your AI chat conversations into organized code files.\n\n` +
    `*Commands:*\n` +
    `• /generate — start a new generation\n` +
    `• /usage — check your daily usage\n` +
    `• /help — show this message\n\n` +
    `You get *${DAILY_LIMIT} free generations per day* 🎉`,
    { parse_mode: 'Markdown' }
  );
});

// /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `*How to use Code Alchemy Bot:*\n\n` +
    `1️⃣ Send /generate\n` +
    `2️⃣ Paste your AI chat (with code blocks)\n` +
    `3️⃣ I'll send you a ZIP with all the files\n\n` +
    `*Limits:* ${DAILY_LIMIT} generations per day\n` +
    `*Max input:* 15,000 characters\n\n` +
    `💡 *Tip:* Works best with conversations from ChatGPT, Claude, Gemini etc. that contain code blocks.`,
    { parse_mode: 'Markdown' }
  );
});

// /usage command
bot.onText(/\/usage/, (msg) => {
  const { used, remaining } = checkLimit(msg.from.id);
  const bar = '█'.repeat(used) + '░'.repeat(Math.max(0, DAILY_LIMIT - used));
  bot.sendMessage(msg.chat.id,
    `📊 *Your usage today:*\n\n` +
    `\`${bar}\`\n` +
    `${used}/${DAILY_LIMIT} used — ${remaining} remaining\n\n` +
    `Resets at midnight UTC 🕛`,
    { parse_mode: 'Markdown' }
  );
});

// /generate command — enter "waiting" mode
bot.onText(/\/generate/, (msg) => {
  const { allowed, remaining } = checkLimit(msg.from.id);

  if (!allowed) {
    bot.sendMessage(msg.chat.id,
      `⛔ You've used all ${DAILY_LIMIT} generations for today.\n\nCome back tomorrow or use the web app at *codealchemy.vercel.app* 🌐`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  waitingForCode.set(msg.from.id, true);
  bot.sendMessage(msg.chat.id,
    `✅ Ready! You have *${remaining} generation${remaining !== 1 ? 's' : ''}* left today.\n\n` +
    `📋 *Paste your AI chat now* — include the full conversation with code blocks.\n\n` +
    `Send /cancel to abort.`,
    { parse_mode: 'Markdown' }
  );
});

// /cancel command
bot.onText(/\/cancel/, (msg) => {
  if (waitingForCode.has(msg.from.id)) {
    waitingForCode.delete(msg.from.id);
    bot.sendMessage(msg.chat.id, '❌ Cancelled. Send /generate to start again.');
  } else {
    bot.sendMessage(msg.chat.id, 'Nothing to cancel. Send /generate to start.');
  }
});

// Handle regular messages — only process if user is in waiting mode
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  if (!waitingForCode.get(msg.from.id)) {
    bot.sendMessage(msg.chat.id,
      `💡 Send /generate to start, or /help for instructions.`
    );
    return;
  }

  // Validate input
  if (msg.text.length < 10) {
    bot.sendMessage(msg.chat.id, '⚠️ That seems too short. Paste your full AI chat conversation.');
    return;
  }
  if (msg.text.length > 15000) {
    bot.sendMessage(msg.chat.id, `⚠️ Input too long (${msg.text.length} chars). Max is 15,000 characters. Try trimming the conversation.`);
    return;
  }

  const { allowed } = checkLimit(msg.from.id);
  if (!allowed) {
    waitingForCode.delete(msg.from.id);
    bot.sendMessage(msg.chat.id, `⛔ Daily limit reached. Come back tomorrow!`);
    return;
  }

  // Clear waiting state immediately
  waitingForCode.delete(msg.from.id);

  // Send "processing" message
  const processingMsg = await bot.sendMessage(msg.chat.id,
    `⚙️ *Processing your chat...*\n\nThis takes 5–15 seconds ⏳`,
    { parse_mode: 'Markdown' }
  );

  try {
    const parsedData = await parseWithGemini(msg.text);

    if (!parsedData.files || parsedData.files.length === 0) {
      await bot.editMessageText('❌ No files found in your chat. Make sure it contains code blocks.', {
        chat_id: msg.chat.id,
        message_id: processingMsg.message_id,
      });
      return;
    }

    incrementUsage(msg.from.id);
    const { used, remaining } = checkLimit(msg.from.id);

    // Build ZIP
    await bot.editMessageText(`⚙️ Building ZIP with ${parsedData.files.length} file(s)...`, {
      chat_id: msg.chat.id,
      message_id: processingMsg.message_id,
    });

    const zipBuffer = await buildZip(parsedData.files);

    if (!zipBuffer) throw new Error('Failed to build ZIP');

    // Delete processing message
    await bot.deleteMessage(msg.chat.id, processingMsg.message_id);

    // Send file list as a text message first
    const fileList = parsedData.files.map(f => `  📄 \`${f.name}\``).join('\n');
    await bot.sendMessage(msg.chat.id,
      `✅ *Done! Generated ${parsedData.files.length} file${parsedData.files.length !== 1 ? 's' : ''}:*\n\n${fileList}\n\n` +
      `📊 Usage: ${used}/${DAILY_LIMIT} today (${remaining} remaining)`,
      { parse_mode: 'Markdown' }
    );

    // Send ZIP as document
    const zipStream = Readable.from(zipBuffer);
    await bot.sendDocument(msg.chat.id, zipStream, {
      caption: '📦 Your code files — ready to unzip!',
    }, {
      filename: 'code-files.zip',
      contentType: 'application/zip',
    });

  } catch (err) {
    console.error('[Bot] Error:', err.message);
    await bot.editMessageText(
      `❌ Something went wrong: ${err.message}\n\nTry /generate again.`,
      { chat_id: msg.chat.id, message_id: processingMsg.message_id }
    ).catch(() => {
      bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}. Try /generate again.`);
    });
  }
});

console.log('[Bot] Listening for messages...');