import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import useVisualizer from '../hooks/useVisualizer';
import ArrayBar from './ArrayBar';

const ALGO_CONFIG = {
  bubble: {
    label: 'Bubble Sort',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    time: 'O(n²)', space: 'O(1)'
  },
  selection: {
    label: 'Selection Sort',
    description: 'Finds the minimum element from the unsorted part and puts it at the beginning.',
    time: 'O(n²)', space: 'O(1)'
  },
  insertion: {
    label: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time by picking a key and inserting it into its correct position.',
    time: 'O(n²)', space: 'O(1)'
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

export default function SortVisualizer({ algorithm }) {
  const cfg = ALGO_CONFIG[algorithm];
  const viz = useVisualizer();

  const [arraySize, setArraySize] = useState(20);
  const [sourceArray, setSourceArray] = useState(() => generateArray(20));

  const resetWithArray = useCallback((arr) => { viz.load(null); setSourceArray(arr); }, [viz]);
  const handleArraySizeChange = useCallback((n) => { setArraySize(n); resetWithArray(generateArray(n)); }, [resetWithArray]);
  const handleShuffle = useCallback(() => resetWithArray(generateArray(arraySize)), [arraySize, resetWithArray]);
  const onPlayPause = useCallback(() => viz.handlePlayPause(() => runSort(algorithm, sourceArray)), [viz, algorithm, sourceArray]);

  const stats = useMemo(() => {
    let comps = 0, swaps = 0;
    const locked = new Set();
    for (let i = 0; i < viz.currentStep; i++) {
      const step = viz.history[i];
      if (!step) continue;
      if (step.action === ACTION_TYPES.COMPARE) comps++;
      if (step.action === ACTION_TYPES.SWAP || step.action === ACTION_TYPES.SHIFT) swaps++;
      if (step.action === ACTION_TYPES.LOCKED) step.indices.forEach(idx => locked.add(idx));
    }
    return { comps, swaps, locked };
  }, [viz.history, viz.currentStep]);

  const displayArray = viz.currentFrame?.array ?? sourceArray;
  const maxValue = Math.max(...displayArray);

  const getBarState = (idx) => {
    if (stats.locked.has(idx)) return 'locked';
    if (!viz.currentFrame || !viz.currentFrame.indices.includes(idx)) return 'default';
    const a = viz.currentFrame.action;
    return a === 'COMPARE' ? 'compare' : a === 'SWAP' || a === 'SHIFT' ? 'swap' : a === 'INSERT' ? 'insert' : 'locked';
  };

  return (
    // Full-viewport-height flex column — fills all space below the navbar
    <div className="flex flex-col font-sans" style={{ height: 'calc(100vh - 65px)' }}>
      <div className="flex flex-col flex-1 max-w-7xl w-full mx-auto px-6 py-4 gap-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{cfg.label}</h1>
            <p className="text-xs text-gray-500">{cfg.description}</p>
          </div>
        </div>

        {/* Main 2-col layout — fills remaining height */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">

          {/* Left: Chart (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
            {/* Bar chart — grows to fill all available vertical space */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-0">
              <div className="flex items-stretch justify-center gap-0.5 px-4 pt-4" style={{ height: '100%' }}>
                <AnimatePresence mode="popLayout">
                  {displayArray.map((value, index) => (
                    <ArrayBar key={`bar-${index}`} value={value} maxValue={maxValue}
                      state={getBarState(index)} totalBars={displayArray.length} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Comparisons</div>
                  <div className="text-2xl font-bold text-blue-600 leading-tight">{stats.comps}</div>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Swaps</div>
                  <div className="text-2xl font-bold text-emerald-600 leading-tight">{stats.swaps}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls (1/4 width) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4 h-fit">
            <div>
              <h3 className="text-base font-bold text-gray-900">{cfg.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Configure and run sorting</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Speed: {Math.max(0, 100 - (viz.speed - 20) / 1.8).toFixed(0)}%
              </label>
              <input type="range" min="20" max="200" step="10"
                value={220 - viz.speed}
                onChange={(e) => viz.setSpeed(220 - Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Array Size</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map(size => (
                  <button key={size} onClick={() => handleArraySizeChange(size)}
                    className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                      arraySize === size ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={onPlayPause} disabled={viz.isComplete}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                {viz.isPlaying
                  ? <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>Pause</>
                  : <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>Sort</>
                }
              </button>
              <button onClick={handleShuffle}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-2.5 border border-gray-200 transition-colors" title="Shuffle">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <h4 className="text-xs font-bold text-gray-900 mb-1.5">Complexity Analysis</h4>
              <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                <div>Time: <span className="font-mono text-gray-900">{cfg.time}</span></div>
                <div>Space: <span className="font-mono text-gray-900">{cfg.space}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
