import { motion, AnimatePresence } from 'framer-motion';

// Action → display config. Covers every action all three sort algorithms emit.
const CONFIG = {
  COMPARE: {
    label: 'COMPARE', icon: '⟷', colour: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    describe: (idx, arr) =>
      `Comparing arr[${idx[0]}] = ${arr[idx[0]]} with arr[${idx[1]}] = ${arr[idx[1]]}`,
  },
  SWAP: {
    label: 'SWAP', icon: '⇄', colour: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    describe: (idx, arr) =>
      `Swapping arr[${idx[0]}] = ${arr[idx[0]]} and arr[${idx[1]}] = ${arr[idx[1]]}`,
  },
  LOCKED: {
    label: 'LOCKED', icon: '✓', colour: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    describe: (idx, arr) =>
      `Element arr[${idx[0]}] = ${arr[idx[0]]} is now in its final sorted position.`,
  },
  SHIFT: {
    label: 'SHIFT', icon: '→', colour: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    describe: (idx, arr) =>
      `Shifting element ${arr[idx[1]]} one position to the right.`,
  },
  INSERT: {
    label: 'INSERT', icon: '↓', colour: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    describe: (idx, arr) =>
      `Inserting key ${arr[idx[0]]} into its correct sorted position.`,
  }
};

export default function StepInfo({ step }) {
  if (!step) {
    return (
      <div className="h-16 flex items-center justify-center text-slate-500 font-mono text-sm border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
        Waiting to start...
      </div>
    );
  }

  const { action, indices, array } = step;
  const cfg = CONFIG[action] || {
    label: action, icon: '•', colour: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20',
    describe: () => 'Unknown action.',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${action}-${indices.join('-')}-${array.join('-')}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-4 p-4 rounded-xl border ${cfg.bg}`}
      >
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 font-bold text-lg ${cfg.colour}`}>
          {cfg.icon}
        </div>
        <div className="flex-1">
          <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${cfg.colour}`}>
            {cfg.label}
          </div>
          <div className="text-sm text-slate-300 font-mono">
            {cfg.describe(indices, array)}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
