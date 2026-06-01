import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useVisualizer from '../hooks/useVisualizer';
import ArrayBar from './ArrayBar';
import Controls from './Controls';
import Legend from './Legend';
import StepInfo from './StepInfo';

// ─── Per-algorithm display config ─────────────────────────────────────────────
const ALGO_CONFIG = {
  bubble: {
    label: 'Bubble Sort',
    gradient: 'from-indigo-400 via-purple-400 to-pink-400',
    orbs: ['bg-indigo-600/10', 'bg-purple-600/10', 'bg-pink-600/8'],
    legend: 'bubble',
  },
  selection: {
    label: 'Selection Sort',
    gradient: 'from-cyan-400 via-blue-400 to-sky-400',
    orbs: ['bg-cyan-600/10', 'bg-blue-600/10', 'bg-sky-600/8'],
    legend: 'bubble', // same legend items as bubble
  },
  insertion: {
    label: 'Insertion Sort',
    gradient: 'from-amber-400 via-orange-400 to-yellow-400',
    orbs: ['bg-amber-600/10', 'bg-orange-600/10', 'bg-yellow-600/8'],
    legend: 'insertion',
  },
};

const ACTION_TYPES = { COMPARE: 'COMPARE', SWAP: 'SWAP', LOCKED: 'LOCKED', SHIFT: 'SHIFT', INSERT: 'INSERT' };

function generateArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

const runSort = async (algorithm, array) => {
    const res = await fetch('/api/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ array, algorithm }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};

// algorithm: "bubble" | "selection" | "insertion"
export default function SortVisualizer({ algorithm }) {
  const cfg = ALGO_CONFIG[algorithm];
  const viz = useVisualizer();

  const [arraySize,    setArraySize]    = useState(30);
  const [sourceArray,  setSourceArray]  = useState(() => generateArray(30));

  // Reset everything and generate a new random array
  const resetWithArray = useCallback((arr) => {
    viz.load(null);
    setSourceArray(arr);
  }, [viz]);

  const handleShuffle         = useCallback(() => resetWithArray(generateArray(arraySize)), [arraySize, resetWithArray]);
  const handleArraySizeChange = useCallback((n) => { setArraySize(n); resetWithArray(generateArray(n)); }, [resetWithArray]);

  // Called by the play/pause button — fetches history on first press
  const onPlayPause = useCallback(() => {
    viz.handlePlayPause(() => runSort(algorithm, sourceArray));
  }, [viz, algorithm, sourceArray]);

  // Accumulate locked indices by scanning history up to currentStep
  const lockedIndices = useMemo(() => {
    const locked = new Set();
    for (let i = 0; i < viz.currentStep; i++) {
      if (viz.history[i]?.action === ACTION_TYPES.LOCKED)
        viz.history[i].indices.forEach(idx => locked.add(idx));
    }
    return locked;
  }, [viz.history, viz.currentStep]);

  const displayArray = viz.currentFrame?.array ?? sourceArray;
  const maxValue     = Math.max(...displayArray);

  const getBarState = (idx) => {
    if (lockedIndices.has(idx))                       return 'locked';
    if (!viz.currentFrame)                            return 'default';
    if (!viz.currentFrame.indices.includes(idx))      return 'default';
    const a = viz.currentFrame.action;
    return a === 'COMPARE' ? 'compare' : a === 'SWAP' ? 'swap' : a === 'SHIFT' ? 'swap' : a === 'INSERT' ? 'insert' : 'locked';
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {cfg.orbs.map((c, i) => (
          <div key={i} className={`absolute w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${c}`}
               style={{ top: `${['-10%','33%','-5%'][i]}`, left: `${['-10%','auto','33%'][i]}`,
                        right: i === 1 ? '-5%' : 'auto', animationDelay: `${i * 2}s` }} />
        ))}
      </div>

      <header className="relative z-10 pt-6 pb-4 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className={`bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>
              {cfg.label}
            </span>
            <span className="text-slate-500 font-light ml-3">Visualizer</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-mono tracking-wide">
            Time Complexity: O(n²) &nbsp;•&nbsp; Space Complexity: O(1)
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 md:px-8 pb-8 gap-6 max-w-7xl mx-auto w-full">
        <Legend variant={cfg.legend} />

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full h-[450px] bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 pb-8 flex items-end justify-center gap-[2px] relative overflow-hidden shadow-2xl"
        >
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute w-full border-t border-white/[0.03] pointer-events-none"
                 style={{ bottom: `${p}%` }} />
          ))}
          <AnimatePresence mode="popLayout">
            {displayArray.map((value, index) => (
              <ArrayBar key={`bar-${index}`} value={value} maxValue={maxValue}
                        state={getBarState(index)} totalBars={displayArray.length} />
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="w-full max-w-2xl">
          <StepInfo step={viz.currentFrame} />
        </div>

        <div className="w-full max-w-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
          <Controls
            isPlaying={viz.isPlaying}   onPlayPause={onPlayPause}
            onStepForward={viz.stepForward} onStepBack={viz.stepBack}
            onReset={viz.reset}         onShuffle={handleShuffle}
            speed={viz.speed}           onSpeedChange={viz.setSpeed}
            arraySize={arraySize}       onArraySizeChange={handleArraySizeChange}
            currentStep={viz.currentStep} totalSteps={viz.history.length}
            isSorting={viz.isSorting}   isComplete={viz.isComplete}
          />
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-slate-600 font-mono">
        Algorithm Visualizer &nbsp;•&nbsp; Sorting algorithms built with C++ and React
      </footer>
    </div>
  );
}
