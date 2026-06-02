import { useState, useCallback, useMemo, useRef } from 'react';
import useVisualizer from '../hooks/useVisualizer';
import GridNode from './GridNode';

const ROWS = 20;
const COLS = 40;
const START = { r: 9, c: 8  };
const END   = { r: 9, c: 31 };

const ALGO_CONFIG = {
  bfs: {
    label: 'Breadth-First Search (BFS)',
    shortLabel: 'BFS',
    description: 'Explores all neighbors at the current depth before moving deeper. Guarantees the shortest path in an unweighted grid.',
    time: 'O(V + E)',
    space: 'O(V)',
    note: 'Shortest path guaranteed',
    iconBg: 'bg-cyan-500',
  },
  dfs: {
    label: 'Depth-First Search (DFS)',
    shortLabel: 'DFS',
    description: 'Goes as deep as possible along each branch before backtracking. Uses a stack internally. Does not guarantee shortest path.',
    time: 'O(V + E)',
    space: 'O(V)',
    note: 'No shortest-path guarantee',
    iconBg: 'bg-violet-500',
  },
};

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

// algorithm: "bfs" | "dfs"
export default function PathVisualizer({ algorithm }) {
  const cfg = ALGO_CONFIG[algorithm];
  const viz = useVisualizer();

  const [walls, setWalls]                   = useState(() => new Array(ROWS * COLS).fill(0));
  const [isMousePressed, setIsMousePressed] = useState(false);
  const paintModeRef = useRef(null);

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

  const clearPath = useCallback(() => viz.load(null), [viz]);
  const clearAll  = useCallback(() => {
    viz.load(null);
    setWalls(new Array(ROWS * COLS).fill(0));
  }, [viz]);

  const onPlayPause = useCallback(() => {
    viz.handlePlayPause(() =>
      runPathfind(algorithm, ROWS, COLS, START.r, START.c, END.r, END.c, walls)
    );
  }, [viz, algorithm, walls]);

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

  // Count visited and path nodes for stats
  const stats = useMemo(() => {
    let visited = 0, path = 0;
    nodeStates.forEach(v => {
      if (v === 'visited') visited++;
      if (v === 'path') path++;
    });
    return { visited, path };
  }, [nodeStates]);

  return (
    <div className="flex flex-col font-sans" style={{ height: 'calc(100vh - 65px)' }}
         onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="flex flex-col flex-1 max-w-7xl w-full mx-auto px-6 py-4 gap-4 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${cfg.iconBg} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{cfg.label}</h1>
          <p className="text-xs text-gray-500 leading-snug">Visualize how algorithms navigate through a grid to find the shortest path</p>
        </div>
      </div>


      {/* Main Grid Layout — fills remaining height */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">

        {/* Left: Grid visualizer — 3/4 width, fills height */}
        <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{cfg.label}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
          </div>

          {/* Grid container — grows to fill all available vertical space */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 shadow-sm overflow-hidden min-h-0">
            <p className="text-xs text-gray-400 mb-2 font-medium">Click and drag to draw walls. Click a wall to erase it.</p>
            <div
              className="grid gap-[1px] bg-gray-200 border border-gray-200 rounded-md overflow-hidden mx-auto"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                width: '100%',
                aspectRatio: `${COLS} / ${ROWS}`
              }}
            >
              {Array.from({ length: ROWS }, (_, r) =>
                Array.from({ length: COLS }, (_, c) => (
                  <GridNode key={`${r}-${c}`} row={r} col={c} status={getStatus(r, c)}
                            onMouseDown={handleMouseDown} onMouseEnter={handleMouseEnter}
                            onMouseUp={handleMouseUp} />
                ))
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-xs text-gray-500 font-medium">Nodes Visited</span>
              <div className="text-2xl font-bold text-blue-600 mt-0.5">{stats.visited}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
              <span className="text-xs text-gray-500 font-medium">Path Length</span>
              <div className="text-2xl font-bold text-yellow-600 mt-0.5">{stats.path}</div>
            </div>
          </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3 h-fit">
          <div>
            <h3 className="text-base font-bold text-gray-900">Controls</h3>
            <p className="text-xs text-gray-500">Configure and run pathfinding</p>
          </div>

          {/* Speed Slider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Speed: {Math.max(0, Math.round(100 - (viz.speed - 20) / 1.8))}%</label>
            <input
              type="range" min="20" max="200" step="10"
              value={220 - viz.speed}
              onChange={(e) => viz.setSpeed(220 - Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onPlayPause}
              disabled={viz.isComplete}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-5 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {viz.isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              )}
              {viz.isPlaying ? 'Pause' : 'Find Path'}
            </button>
            <button
              onClick={clearPath}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-3 transition-colors border border-gray-200 text-sm font-medium"
              title="Clear Path"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={clearAll}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-3 transition-colors border border-gray-200 text-sm font-medium"
              title="Clear All"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">Legend</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500 flex-shrink-0"></span>Start</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-rose-500 flex-shrink-0"></span>End</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-700 flex-shrink-0"></span>Wall</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-200 flex-shrink-0"></span>Visited</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-100 flex-shrink-0"></span>Queued</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-400 flex-shrink-0"></span>Path</div>
            </div>
          </div>

          {/* Complexity */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Complexity Analysis</h4>
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <div>Time: <span className="font-mono text-gray-900">{cfg.time}</span></div>
              <div>Space: <span className="font-mono text-gray-900">{cfg.space}</span></div>
              <div className="mt-1 text-xs text-gray-400">{cfg.note}</div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
