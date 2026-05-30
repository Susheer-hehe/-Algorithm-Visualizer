import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_TYPES } from '../engine/bubbleSortEngine';

const actionConfig = {
  [ACTION_TYPES.COMPARE]: {
    label: 'COMPARE',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: '⟷',
    describe: (indices, array) =>
      `Comparing arr[${indices[0]}] = ${array[indices[0]]} with arr[${indices[1]}] = ${array[indices[1]]}`,
  },
  [ACTION_TYPES.SWAP]: {
    label: 'SWAP',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    icon: '⇄',
    describe: (indices, array) =>
      `Swapped arr[${indices[0]}] = ${array[indices[0]]} and arr[${indices[1]}] = ${array[indices[1]]}`,
  },
  [ACTION_TYPES.LOCKED]: {
    label: 'LOCKED',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: '✓',
    describe: (indices, array) =>
      `Element arr[${indices[0]}] = ${array[indices[0]]} is now in its final position`,
  },
};

export default function StepInfo({ step }) {
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
