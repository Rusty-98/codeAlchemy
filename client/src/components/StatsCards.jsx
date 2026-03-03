// src/components/StatsCards.jsx
import { motion } from 'framer-motion';
import { Zap, Trophy, CalendarDays } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Used Today',
      value: `${stats.usedToday} / ${stats.dailyLimit}`,
      icon: <CalendarDays className="w-5 h-5 text-indigo-400" />,
      bg: 'from-indigo-900/40 to-indigo-800/20',
      border: 'border-indigo-800/50',
    },
    {
      label: 'Remaining Today',
      value: stats.remainingToday,
      icon: <Zap className="w-5 h-5 text-violet-400" />,
      bg: 'from-violet-900/40 to-violet-800/20',
      border: 'border-violet-800/50',
    },
    {
      label: 'All Time',
      value: stats.totalGenerations,
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      bg: 'from-amber-900/30 to-amber-800/10',
      border: 'border-amber-800/40',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`rounded-2xl border p-4 bg-gradient-to-br ${card.bg} ${card.border}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {card.label}
            </span>
            {card.icon}
          </div>
          <p className="text-2xl font-bold text-white">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}