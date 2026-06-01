import { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useVisualizer from '../hooks/useVisualizer';
import GridNode from './GridNode';
import Controls from './Controls';

const ROWS = 20;
const COLS = 40;
const START = { r: 9, c: 8  };
const END   = { r: 9, c: 31 };

const runPathfind = async (algorithm, rows, cols, startR, startC, endR, endC, walls) => {
    const res = await fetch('/api/pathfind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            algorithm, 
            gridRows: rows, 
            gridCols: cols, 
            start: { r: startR, c: startC }, 
            end: { r: endR, c: endC }, 
            walls 
        }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};

const ALGO_CONFIG = {
  bfs: {
    label:    'Breadth-First Search',
    gradient: 'from-cyan-400 via-teal-400 to-emerald-400',
    orbs:     ['bg-cyan-600/10', 'bg-teal-600/10'],
    note:     'Shortest path guaranteed  •  Unweighted graph',
  },
  dfs: {
    label:    'Depth-First Search',
    gradient: 'from-violet-400 via-fuchsia-400 to-pink-400',
    orbs:     ['bg-violet-600/10', 'bg-purple-600/10'],
    note:     'No shortest-path guarantee  •  Stack-based',
  },
};

// algorithm: "bfs" | "dfs"
export default function PathVisualizer({ algorithm }) {
  const cfg = ALGO_CONFIG[algorithm];
  const viz = useVisualizer();

  // Flat wall array: 0 = open, 1 = wall
  const [walls,          setWalls]          = useState(() => new Array(ROWS * COLS).fill(0));
  const [isMousePressed, setIsMousePressed] = useState(false);
  const paintModeRef = useRef(null); // "draw" | "erase" — set on mousedown, used on enter

  // ── Grid painting ────────────────────────────────────────────────────────────
  const toggleWall = useCallback((r, c, mode) => {
    if (r === START.r && c === START.c) return;
    if (r === END.r   && c === END.c)   return;
    setWalls(prev => {
      const next = [...prev];
      next[r * COLS + c] = mode === 'draw' ? 1 : 0;
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((r, c) => {
    if (viz.isSorting || viz.isComplete) return;
    const mode = walls[r * COLS + c] === 1 ? 'erase' : 'draw';
    paintModeRef.current = mode;
    setIsMousePressed(true);
    toggleWall(r, c, mode);
  }, [viz.isSorting, viz.isComplete, walls, toggleWall]);

  const handleMouseEnter = useCallback((r, c) => {
    if (!isMousePressed) return;
    toggleWall(r, c, paintModeRef.current);
  }, [isMousePressed, toggleWall]);

  const handleMouseUp = useCallback(() => setIsMousePressed(false), []);

  // ── Reset helpers ─────────────────────────────────────────────────────────────
  const clearPath = useCallback(() => viz.load(null), [viz]);

  const clearAll  = useCallback(() => {
    viz.load(null);
    setWalls(new Array(ROWS * COLS).fill(0));
  }, [viz]);

  // ── Playback ─────────────────────────────────────────────────────────────────
  const onPlayPause = useCallback(() => {
    viz.handlePlayPause(() =>
      runPathfind(algorithm, ROWS, COLS, START.r, START.c, END.r, END.c, walls)
    );
  }, [viz, algorithm, walls]);

  // ── Node state computation ───────────────────────────────────────────────────
  // Walk history up to currentStep and build a map of cell states.
  // PATH beats VISIT beats ENQUEUE — later writes in the same cell win.
  const nodeStates = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < viz.currentStep; i++) {
      const { action, row, col } = viz.history[i];
      const key = `${row}-${col}`;
      if (action === 'ENQUEUE' && !map.has(key)) map.set(key, 'queued');
      if (action === 'VISIT')   map.set(key, 'visited');
      if (action === 'PATH')    map.set(key, 'path');
    }
    return map;
  }, [viz.history, viz.currentStep]);

  const getStatus = useCallback((r, c) => {
    if (r === START.r && c === START.c) return 'start';
    if (r === END.r   && c === END.c)   return 'end';
    const overlay = nodeStates.get(`${r}-${c}`);
    if (overlay) return overlay;
    return walls[r * COLS + c] === 1 ? 'wall' : 'empty';
  }, [nodeStates, walls]);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col"
         onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {cfg.orbs.map((c, i) => (
          <div key={i} className={`absolute w-96 h-96 rounded-full blur-3xl animate-pulse-slow ${c}`}
               style={{ top: i === 0 ? '-10%' : '33%', left: i === 0 ? '-10%' : 'auto',
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
          <p className="mt-2 text-sm text-slate-500 font-mono tracking-wide">{cfg.note}</p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 md:px-8 pb-8 gap-6 max-w-7xl mx-auto w-full">
        <p className="text-sm text-slate-400 font-mono tracking-wide">
          Click and drag to draw walls. Click a wall to erase it.
        </p>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 md:p-6 shadow-2xl"
        >
          <div className="grid gap-[1px] bg-white/[0.08] border border-white/[0.08]"
               style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                        width: 'min(90vw, 1000px)', aspectRatio: `${COLS} / ${ROWS}` }}>
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => (
                <GridNode key={`${r}-${c}`} row={r} col={c} status={getStatus(r, c)}
                          onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter}
                          onMouseUp={handleMouseUp} />
              ))
            )}
          </div>
        </motion.div>

        {/* Controls panel */}
        <div className="w-full max-w-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex justify-center gap-3">
            <button onClick={clearPath}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg border border-slate-700 transition-colors">
              Clear Path
            </button>
            <button onClick={clearAll}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg border border-slate-700 text-rose-400 transition-colors">
              Clear All
            </button>
          </div>
          <Controls
            isPlaying={viz.isPlaying}     onPlayPause={onPlayPause}
            onStepForward={viz.stepForward} onStepBack={viz.stepBack}
            onReset={clearPath}           onShuffle={clearAll}
            speed={viz.speed}             onSpeedChange={viz.setSpeed}
            currentStep={viz.currentStep} totalSteps={viz.history.length}
            isSorting={viz.isSorting}     isComplete={viz.isComplete}
            // arraySize intentionally omitted — Controls hides that slider automatically
          />
        </div>
      </main>
    </div>
  );
}
