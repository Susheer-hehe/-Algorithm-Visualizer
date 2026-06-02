import { motion } from 'framer-motion';

const BAR_COLORS = {
  default: 'bg-gray-200',
  compare: 'bg-blue-400',
  swap: 'bg-purple-500',
  locked: 'bg-emerald-400',
  insert: 'bg-cyan-400',
};

const LABEL_HEIGHT = 20; // px — reserved at bottom for number labels

export default function ArrayBar({ value, maxValue, state = 'default', totalBars }) {
  const heightPercent = (value / maxValue) * 100;
  const colorClass = BAR_COLORS[state] || BAR_COLORS.default;

  const barWidth = Math.max(4, Math.min(48, Math.floor(800 / totalBars)));
  const showLabel = barWidth >= 16;

  return (
    <div
      style={{ width: barWidth, minWidth: barWidth, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/*
        Bar area: takes all space EXCEPT the label row.
        The bar's height% is relative to THIS div only,
        so 100% bar height = top of bar area, never leaking into label space.
      */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
        <motion.div
          className={`w-full rounded-t-sm ${colorClass}`}
          style={{ height: `${heightPercent}%`, minHeight: 2, width: '100%' }}
          animate={{ height: `${heightPercent}%` }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      </div>

      {/* Fixed label row — always occupies LABEL_HEIGHT px regardless of bar size */}
      <div
        style={{ height: LABEL_HEIGHT, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 2 }}
      >
        {showLabel && (
          <span style={{ fontSize: 9, color: '#9ca3af', lineHeight: 1, userSelect: 'none' }}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
