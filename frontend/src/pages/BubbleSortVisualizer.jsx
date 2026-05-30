import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateBubbleSortHistory, generateRandomArray, ACTION_TYPES } from '../engine/bubbleSortEngine';
import ArrayBar from '../components/ArrayBar';
import Controls from '../components/Controls';
import Legend from '../components/Legend';
import StepInfo from '../components/StepInfo';

export default function BubbleSortVisualizer() {
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(100);
  const [originalArray, setOriginalArray] = useState(() => generateRandomArray(30));
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [lockedIndices, setLockedIndices] = useState(new Set());

  const timerRef = useRef(null);

  // Generate new array
  const handleShuffle = useCallback(() => {
    setIsPlaying(false);
    setIsSorting(false);
    setIsComplete(false);
    setCurrentStep(0);
    setLockedIndices(new Set());
    const newArr = generateRandomArray(arraySize);
    setOriginalArray(newArr);
    setHistory([]);
  }, [arraySize]);

  // Array size change
  const handleArraySizeChange = useCallback((newSize) => {
    setArraySize(newSize);
    setIsPlaying(false);
    setIsSorting(false);
    setIsComplete(false);
    setCurrentStep(0);
    setLockedIndices(new Set());
    const newArr = generateRandomArray(newSize);
    setOriginalArray(newArr);
    setHistory([]);
  }, []);

  // Fetch history from C++ backend (falls back to JS engine if backend is offline)
  const ensureHistory = useCallback(async () => {
    if (history.length === 0) {
      let h;
      try {
        const response = await fetch('http://localhost:8080/api/sort', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ array: originalArray, algorithm: 'bubble' }),
        });
        const data = await response.json();
        h = data.history;
        console.log(`[C++ Backend] Received ${h.length} steps`);
      } catch (err) {
        // Fallback to local JS engine if backend is not running
        console.warn('[Fallback] C++ backend offline, using JS engine:', err.message);
        const result = generateBubbleSortHistory(originalArray);
        h = result.history;
      }
      setHistory(h);
      setIsSorting(true);
      return h;
    }
    return history;
  }, [history, originalArray]);

  // Step forward
  const stepForward = useCallback(async () => {
    const h = await ensureHistory();
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, h.length);
      if (next >= h.length) {
        setIsPlaying(false);
        setIsComplete(true);
        setIsSorting(false);
      }
      // Track locked indices
      if (next > 0 && next <= h.length) {
        const step = h[next - 1];
        if (step.action === ACTION_TYPES.LOCKED) {
          setLockedIndices((prevSet) => new Set([...prevSet, ...step.indices]));
        }
      }
      return next;
    });
  }, [ensureHistory]);

  // Step back
  const stepBack = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 0);
      // Rebuild locked indices up to new step
      if (history.length > 0) {
        const newLocked = new Set();
        for (let i = 0; i < next; i++) {
          if (history[i].action === ACTION_TYPES.LOCKED) {
            history[i].indices.forEach((idx) => newLocked.add(idx));
          }
        }
        setLockedIndices(newLocked);
      }
      if (next === 0) {
        setIsSorting(false);
        setIsComplete(false);
      }
      return next;
    });
  }, [history]);

  // Reset
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setIsSorting(false);
    setIsComplete(false);
    setLockedIndices(new Set());
  }, []);

  // Play/Pause
  const handlePlayPause = useCallback(async () => {
    if (isComplete) return;
    await ensureHistory();
    setIsSorting(true);
    setIsPlaying((prev) => !prev);
  }, [isComplete, ensureHistory]);

  // Auto-step when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        stepForward();
      }, speed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, stepForward]);

  // Determine current display state
  const currentStepData = currentStep > 0 && currentStep <= history.length ? history[currentStep - 1] : null;
  const displayArray = currentStepData ? currentStepData.array : originalArray;
  const maxValue = Math.max(...displayArray);

  // Determine bar state per index
  const getBarState = (index) => {
    if (lockedIndices.has(index)) return 'locked';
    if (!currentStepData) return 'default';
    if (currentStepData.indices.includes(index)) {
      if (currentStepData.action === ACTION_TYPES.COMPARE) return 'compare';
      if (currentStepData.action === ACTION_TYPES.SWAP) return 'swap';
      if (currentStepData.action === ACTION_TYPES.LOCKED) return 'locked';
    }
    return 'default';
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-pink-600/8 rounded-full blur-3xl animate-pulse-slow animation-delay-4000" />
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
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bubble Sort
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
        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Legend />
        </motion.div>

        {/* Visualization Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full h-[450px] bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 pb-8 flex items-end justify-center gap-[2px] relative overflow-hidden"
        >
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {[25, 50, 75].map((pct) => (
              <div
                key={pct}
                className="absolute w-full border-t border-white/[0.03]"
                style={{ bottom: `${pct}%` }}
              />
            ))}
          </div>

          {/* Bars */}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-2xl"
        >
          <StepInfo step={currentStepData} />
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

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-600 font-mono">
        Algorithm Visualizer &nbsp;•&nbsp; DSA Course Project
      </footer>
    </div>
  );
}
