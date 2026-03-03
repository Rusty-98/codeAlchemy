// src/components/UsageBar.jsx
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function UsageBar({ used, limit }) {
  const pct = Math.min((used / limit) * 100, 100);
  const remaining = limit - used;

  const color =
    remaining === 0 ? 'from-red-500 to-red-600' :
    remaining <= 2  ? 'from-orange-500 to-amber-500' :
                      'from-violet-500 to-indigo-500';

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 px-1">
      <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-gray-400">
          <Zap className="w-3.5 h-3.5" />
          Daily usage
        </span>
        <span className={remaining === 0 ? 'text-red-400' : 'text-gray-300'}>
          {used}/{limit} used &mdash; {remaining} remaining
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}