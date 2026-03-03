// src/components/HistoryPanel.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, FileCode2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function HistoryItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-900/50 flex items-center justify-center">
            <FileCode2 className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">
              {item.filesGenerated} file{item.filesGenerated !== 1 ? 's' : ''} generated
            </p>
            <p className="text-xs text-gray-500">
              {Math.round(item.inputLength / 1000 * 10) / 10}k chars input
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-700 px-4 py-3 bg-gray-800/50"
          >
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Files</p>
            <div className="flex flex-wrap gap-2">
              {item.fileNames.map(name => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded-md bg-gray-700 text-xs text-gray-300 font-mono"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HistoryPanel({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center text-gray-500">
        <Clock className="w-8 h-8 mb-3 opacity-40" />
        <p className="text-sm">No generations yet. Start by pasting some code!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item, i) => (
        <HistoryItem key={i} item={item} />
      ))}
    </div>
  );
}