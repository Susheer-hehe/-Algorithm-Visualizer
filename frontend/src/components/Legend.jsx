import { motion } from 'framer-motion';

const items = [
  { label: 'Default', gradient: 'from-indigo-500 to-purple-500', glow: 'shadow-indigo-500/30' },
  { label: 'Comparing', gradient: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/30' },
  { label: 'Swapping', gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/30' },
  { label: 'Sorted', gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/30' },
];

export default function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <div className={`w-3.5 h-3.5 rounded-sm bg-gradient-to-br ${item.gradient} shadow-md ${item.glow}`} />
          <span className="text-xs font-medium text-slate-400">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
