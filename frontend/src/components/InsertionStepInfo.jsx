import { motion, AnimatePresence } from 'framer-motion';

const actionConfig = {
  COMPARE: {
    label: 'COMPARE',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: '⟷',
    describe: (indices, array) =>
      `Comparing key with arr[${indices[0]}] = ${array[indices[0]]}`,
  },
  SHIFT: {
    label: 'SHIFT',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    icon: '→',
    describe: (indices, array) =>
      `Shifted arr[${indices[0]}] to position [${indices[1]}]`,
  },
  INSERT: {
    label: 'INSERT',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    icon: '⬇',
    describe: (indices, array) =>
      `Inserted key at position [${indices[0]}] = ${array[indices[0]]}`,
  },
  LOCKED: {
    label: 'SORTED',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: '✓',
    describe: (indices, array) =>
      `Element arr[${indices[0]}] = ${array[indices[0]]} is now in sorted portion`,
  },
};

export default function InsertionStepInfo({ step }) {
  if (!step) {
    return (
      <div className="h-16 flex items-center justify-center text-slate-500 text-sm font-mono">
        Press Play or Step Forward to begin
      </div>
    );
  }

  const config = actionConfig[step.action];
  if (!config) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${step.action}-${step.indices.join('-')}-${Math.random()}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg}`}
      >
        <span className="text-xl">{config.icon}</span>
        <div className="flex flex-col">
          <span className={`text-xs font-bold uppercase tracking-widest ${config.color}`}>
            {config.label}
          </span>
          <span className="text-sm text-slate-300 font-mono">
            {config.describe(step.indices, step.array)}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
