import { motion } from 'framer-motion';

const BAR_COLORS = {
  default: 'from-indigo-500 to-purple-500',
  compare: 'from-amber-400 to-orange-500',
  swap: 'from-rose-500 to-pink-600',
  locked: 'from-emerald-400 to-teal-500',
};

const BAR_SHADOWS = {
  default: '0 0 15px rgba(99, 102, 241, 0.3)',
  compare: '0 0 25px rgba(251, 191, 36, 0.5)',
  swap: '0 0 25px rgba(244, 63, 94, 0.5)',
  locked: '0 0 20px rgba(52, 211, 153, 0.4)',
};

export default function ArrayBar({ value, maxValue, state = 'default', totalBars }) {
  const heightPercent = (value / maxValue) * 100;
  const gradient = BAR_COLORS[state] || BAR_COLORS.default;
  const shadow = BAR_SHADOWS[state] || BAR_SHADOWS.default;

  // Dynamic width based on number of bars
  const barWidth = Math.max(4, Math.min(48, Math.floor(800 / totalBars)));
  const showLabel = barWidth >= 14;

  return (
    <div
      className="flex flex-col items-center justify-end h-full"
      style={{ width: `${barWidth}px`, minWidth: `${barWidth}px` }}
    >
      {/* Value label above the bar */}
      {showLabel && (
        <motion.span
          className="text-[9px] font-mono text-slate-400 mb-1 select-none leading-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={value}
        >
          {value}
        </motion.span>
      )}

      {/* The bar — height is calculated in pixels based on parent */}
      <motion.div
        className={`w-full rounded-t-sm bg-gradient-to-t ${gradient}`}
        style={{
          boxShadow: shadow,
          height: `${heightPercent}%`,
          minHeight: '2px',
        }}
        animate={{
          height: `${heightPercent}%`,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      />
    </div>
  );
}
