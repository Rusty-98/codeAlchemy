// src/pages/LandingPage.jsx
import { motion } from 'framer-motion';
import { Code2, Zap, Download, Sparkles, MessageSquareCode, FolderOpen, Clock } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const steps = [
  {
    icon: <MessageSquareCode className="w-6 h-6 text-violet-400" />,
    title: 'Paste Your AI Chat',
    desc: 'Copy the conversation from ChatGPT, Claude, or any AI assistant that produced code.',
  },
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" />,
    title: 'One Click Generate',
    desc: 'Our Gemini-powered engine identifies every file, its name, and its complete content.',
  },
  {
    icon: <FolderOpen className="w-6 h-6 text-emerald-400" />,
    title: 'Download Ready Project',
    desc: 'Get a ZIP with properly named files, instantly ready for your editor.',
  },
];

const features = [
  { icon: <Clock className="w-5 h-5" />, text: '10 free generations per day' },
  { icon: <Code2 className="w-5 h-5" />, text: 'Supports any language or framework' },
  { icon: <Download className="w-5 h-5" />, text: 'Clean ZIP output every time' },
  { icon: <Sparkles className="w-5 h-5" />, text: 'Powered by Gemini 2.0 Flash' },
];

export default function LandingPage({ isSignedIn = false, onGoToDashboard }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-24">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-8 pb-16"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-900/40 border border-violet-700/50 text-violet-300 text-sm font-medium mb-6"
        >
          <Sparkles className="w-4 h-4" />
          Free to use — 10 generations/day
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          <span className="text-white">Turn AI chats into</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
            real code files
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Stop copying code block by block. Paste your entire AI conversation and 
          download a perfectly organized project ZIP in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isSignedIn ? (
            <motion.button
              onClick={onGoToDashboard}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              ✓ You're signed in — Go to Dashboard →
            </motion.button>
          ) : (
            <>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 transition-all"
                >
                  Start for Free
                </motion.button>
              </SignUpButton>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white font-semibold text-lg transition-all"
                >
                  Sign In
                </motion.button>
              </SignInButton>
            </>
          )}
        </div>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3 mb-20"
      >
        {features.map(f => (
          <span
            key={f.text}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700 text-gray-300 text-sm"
          >
            <span className="text-violet-400">{f.icon}</span>
            {f.text}
          </span>
        ))}
      </motion.div>

      {/* How it works */}
      <div className="mb-20">
        <h2 className="text-center text-2xl font-bold text-white mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className="relative bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-violet-700/50 transition-colors"
            >
              <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {i + 1}
              </div>
              <div className="mb-4">{step.icon}</div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Example / Demo visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-gray-700 bg-gray-800/40 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-gray-500 font-mono">output.zip</span>
        </div>
        <div className="p-6 font-mono text-sm text-gray-300 space-y-1.5">
          {['📁 src/', '  📄 App.jsx', '  📄 index.css', '📄 package.json', '📄 vite.config.js', '📄 README.md'].map(line => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.random() * 0.5 + 0.6 }}
              className="text-emerald-400"
            >
              {line}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}