import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Controls from '../components/Controls';
import GridNode from '../components/GridNode';

export const ACTION_TYPES = {
  VISIT: 'VISIT',
  ENQUEUE: 'ENQUEUE',
  PATH: 'PATH',
};

const ROWS = 20;
const COLS = 40;

const INITIAL_START = { r: 9, c: 8 };
const INITIAL_END = { r: 9, c: 31 };

export default function BfsVisualizer() {
  const [speed, setSpeed] = useState(50);
  const [walls, setWalls] = useState(() => Array(ROWS * COLS).fill(0));
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMousePressed, setIsMousePressed] = useState(false);
  
  const timerRef = useRef(null);

  // ── Derived state ───────────────────────────────────────────────
  const isSorting = history.length > 0 && currentStep > 0;
  const isComplete = history.length > 0 && currentStep >= history.length;

  // Compute the state of every node up to currentStep
  const nodeStates = useMemo(() => {
    const states = new Map(); // key: "r-c", value: "queued" | "visited" | "path"
    for (let i = 0; i < currentStep; i++) {
      const step = history[i];
      if (!step) continue;
      const key = `${step.row}-${step.col}`;
      
      if (step.action === ACTION_TYPES.ENQUEUE) {
        if (!states.has(key)) states.set(key, 'queued');
      } else if (step.action === ACTION_TYPES.VISIT) {
        states.set(key, 'visited');
      } else if (step.action === ACTION_TYPES.PATH) {
        states.set(key, 'path');
      }
    }
    return states;
  }, [history, currentStep]);

  // ── Grid Interaction (Drawing walls) ────────────────────────────
  const handleMouseDown = (r, c) => {
    if (isSorting || isComplete) return;
    if ((r === INITIAL_START.r && c === INITIAL_START.c) || 
        (r === INITIAL_END.r && c === INITIAL_END.c)) return;
        
    setIsMousePressed(true);
    toggleWall(r, c);
  };

  const handleMouseEnter = (r, c) => {
    if (!isMousePressed) return;
    if (isSorting || isComplete) return;
    if ((r === INITIAL_START.r && c === INITIAL_START.c) || 
        (r === INITIAL_END.r && c === INITIAL_END.c)) return;
        
    toggleWall(r, c);
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
  };

  const toggleWall = (r, c) => {
    setWalls(prev => {
      const newWalls = [...prev];
      const idx = r * COLS + c;
      newWalls[idx] = newWalls[idx] === 1 ? 0 : 1;
      return newWalls;
    });
  };

  // ── Reset helpers ────────────────────────────────────────────────
  const clearGrid = useCallback(() => {
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setHistory([]);
    setWalls(Array(ROWS * COLS).fill(0));
  }, []);

  const clearPath = useCallback(() => {
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setHistory([]);
  }, []);

  // ── History fetch (C++ Backend ONLY) ─────────────────────────────
  const ensureHistory = useCallback(async () => {
    if (history.length > 0) return history;
    try {
      const res = await fetch('http://localhost:8080/api/pathfind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: 'bfs',
          gridRows: ROWS,
          gridCols: COLS,
          start: INITIAL_START,
          end: INITIAL_END,
          walls: walls
        }),
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
  }, [history, walls]);

  // ── Playback ──────────────────────────────────────────────────────
  const stepForward = useCallback(async () => {
    const h = await ensureHistory();
    setCurrentStep(prev => Math.min(prev + 1, h.length));
  }, [ensureHistory]);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (isComplete) return;
    await ensureHistory();
    setIsPlaying(p => !p);
  }, [isComplete, ensureHistory]);

  useEffect(() => {
    if (!isPlaying || isComplete) { setIsPlaying(false); return; }
    timerRef.current = setTimeout(stepForward, speed);
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStep, speed, isComplete, stepForward]);

  // ── Render helpers ────────────────────────────────────────────────
  const getStatus = (r, c) => {
    if (r === INITIAL_START.r && c === INITIAL_START.c) return 'start';
    if (r === INITIAL_END.r && c === INITIAL_END.c) return 'end';
    
    const key = `${r}-${c}`;
    if (nodeStates.has(key)) return nodeStates.get(key);
    
    const idx = r * COLS + c;
    if (walls[idx] === 1) return 'wall';
    
    return 'empty';
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a14] text-white flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      </div>

      <header className="relative z-10 pt-6 pb-4 px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Breadth-First Search
              </span>
              <span className="text-slate-500 font-light ml-3">Visualizer</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-mono tracking-wide">
              Shortest Path Guarantee &nbsp;•&nbsp; Unweighted Graph
            </p>
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 md:px-8 pb-8 gap-6 max-w-7xl mx-auto w-full">
        {/* Draw Instructions */}
        <div className="text-sm text-slate-400 font-mono">
          Click and drag on the grid to draw walls before playing.
        </div>

        {/* Grid Visualization Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 md:p-6 shadow-2xl"
        >
          <div 
            className="grid gap-[1px] bg-white/[0.1] border border-white/[0.1]" 
            style={{ 
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              width: 'min(90vw, 1000px)',
              aspectRatio: `${COLS} / ${ROWS}`
            }}
          >
            {Array.from({ length: ROWS }).map((_, r) => 
              Array.from({ length: COLS }).map((_, c) => (
                <GridNode
                  key={`${r}-${c}`}
                  row={r}
                  col={c}
                  status={getStatus(r, c)}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onMouseUp={handleMouseUp}
                />
              ))
            )}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full max-w-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex justify-center gap-4">
             <button onClick={clearPath} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-700">
               Clear Path
             </button>
             <button onClick={clearGrid} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-700 text-rose-400">
               Clear All
             </button>
          </div>
          <Controls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStepForward={stepForward}
            onStepBack={stepBack}
            onReset={clearPath}
            onShuffle={clearGrid}
            speed={speed}
            onSpeedChange={setSpeed}
            arraySize={COLS} // Not used for grid size, but needed for prop constraint
            onArraySizeChange={() => {}}
            currentStep={currentStep}
            totalSteps={history.length}
            isSorting={isSorting}
            isComplete={isComplete}
          />
        </motion.div>
      </main>
    </div>
  );
}
