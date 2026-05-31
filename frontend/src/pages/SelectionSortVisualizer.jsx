import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateRandomArray } from '../utils/arrayUtils';
import ArrayBar from '../components/ArrayBar';
import Controls from '../components/Controls';
import Legend from '../components/Legend';
import SelectionStepInfo from '../components/SelectionStepInfo';

export const ACTION_TYPES = {
  COMPARE: 'COMPARE',
  SWAP: 'SWAP',
  LOCKED: 'LOCKED',
};

export default function SelectionSortVisualizer() {
  // ── State Management ─────────────────────────────────────────────
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed]         = useState(100);
  const [sourceArray, setSourceArray] = useState(() => generateRandomArray(30));
  
  // Stores the step-by-step history fetched from backend or fallback JS engine
  const [history, setHistory]     = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  // ── Derived state — computed automatically based on history and currentStep
  const isSorting  = history.length > 0 && currentStep > 0;
  const isComplete = history.length > 0 && currentStep >= history.length;

  // Calculates which indices are fully sorted (locked) up to the current step
  const lockedIndices = useMemo(() => {
    const locked = new Set();
    for (let i = 0; i < currentStep; i++) {
      if (history[i]?.action === ACTION_TYPES.LOCKED)
        history[i].indices.forEach(idx => locked.add(idx));
    }
    return locked;
  }, [history, currentStep]);

  // ── Helper to reset state when generating a new array ───────────
  const resetState = useCallback((newArr) => {
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setHistory([]);
    setSourceArray(newArr);
  }, []);

  const handleShuffle         = useCallback(() => resetState(generateRandomArray(arraySize)), [arraySize, resetState]);
  const handleArraySizeChange = useCallback((n) => { setArraySize(n); resetState(generateRandomArray(n)); }, [resetState]);

  // ── Fetches history from C++ backend ONLY ───────────────────────
  const ensureHistory = useCallback(async () => {
    if (history.length > 0) return history;
    try {
      const res  = await fetch('http://localhost:8080/api/sort', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ array: sourceArray, algorithm: 'selection' }),
      });
      const data = await res.json();
      if (!data.history) throw new Error("No history returned from backend");
      setHistory(data.history);
      return data.history;
    } catch (err) {
      alert("Error connecting to C++ backend. Please ensure the server is running.");
      console.error(err);
      setIsPlaying(false);
      return [];
    }
  }, [history, sourceArray]);

  // ── Playback Controls ────────────────────────────────────────────
  const stepForward = useCallback(async () => {
    const h = await ensureHistory();
    setCurrentStep(prev => Math.min(prev + 1, h.length));
  }, [ensureHistory]);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleReset     = useCallback(() => { setIsPlaying(false); setCurrentStep(0); }, []);
  const handlePlayPause = useCallback(async () => {
    if (isComplete) return;
    await ensureHistory();
    setIsPlaying(p => !p);
  }, [isComplete, ensureHistory]);

  // Main playback loop
  useEffect(() => {
    if (!isPlaying || isComplete) { setIsPlaying(false); return; }
    timerRef.current = setTimeout(stepForward, speed);
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStep, speed, isComplete, stepForward]);

  // ── Render Helpers ────────────────────────────────────────────────
  const currentStepData = history[currentStep - 1] ?? null;
  const displayArray    = currentStepData?.array ?? sourceArray;
  const maxValue        = Math.max(...displayArray);

  // Determines color of the bar (default, compare, swap, locked)
  const getBarState = (index) => {
    if (lockedIndices.has(index))                  return 'locked';
    if (!currentStepData)                          return 'default';
    if (!currentStepData.indices.includes(index))  return 'default';
    return currentStepData.action === ACTION_TYPES.COMPARE ? 'compare'
         : currentStepData.action === ACTION_TYPES.SWAP    ? 'swap'
         : 'locked';
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">
      {/* Background orbs (Cyan/Blue for Selection Sort) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-sky-600/8 rounded-full blur-3xl animate-pulse-slow animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 pb-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 bg-clip-text text-transparent">
                Selection Sort
              </span>
              <span className="text-slate-500 font-light ml-3">Visualizer</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-mono tracking-wide">
              Time Complexity: O(n²) &nbsp;•&nbsp; Space Complexity: O(1)
            </p>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 md:px-8 pb-8 gap-6 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Legend variant="bubble" />
        </motion.div>

        {/* Visualization Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full h-[450px] bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 pb-8 flex items-end justify-center gap-[2px] relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            {[25, 50, 75].map((pct) => (
              <div key={pct} className="absolute w-full border-t border-white/[0.03]" style={{ bottom: `${pct}%` }} />
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {displayArray.map((value, index) => (
              <ArrayBar
                key={`bar-${index}`}
                value={value}
                maxValue={maxValue}
                state={getBarState(index)}
                totalBars={displayArray.length}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Step Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-2xl">
          <SelectionStepInfo step={currentStepData} />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6"
        >
          <Controls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStepForward={stepForward}
            onStepBack={stepBack}
            onReset={handleReset}
            onShuffle={handleShuffle}
            speed={speed}
            onSpeedChange={setSpeed}
            arraySize={arraySize}
            onArraySizeChange={handleArraySizeChange}
            currentStep={currentStep}
            totalSteps={history.length}
            isSorting={isSorting}
            isComplete={isComplete}
          />
        </motion.div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-slate-600 font-mono">
        Algorithm Visualizer &nbsp;•&nbsp; DSA Course Project
      </footer>
    </div>
  );
}
