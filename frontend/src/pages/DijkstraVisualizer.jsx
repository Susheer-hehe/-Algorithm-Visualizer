import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useVisualizer from '../hooks/useVisualizer';

export default function DijkstraVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [mode, setMode] = useState('add-node');
  const [pendingEdgeStart, setPendingEdgeStart] = useState(null);
  const viz = useVisualizer();

  const CANVAS_W = 700;
  const CANVAS_H = 400;

  const clearGraph = () => {
    setNodes([]); setEdges([]);
    setStartNode(null); setEndNode(null);
    setPendingEdgeStart(null);
    viz.load(null);
  };

  const loadPrebuiltGraph = () => {
    // Positions scaled to fit canvas center
    setNodes([
      { id: 0, x: 80,  y: 200 },
      { id: 1, x: 230, y: 80  },
      { id: 2, x: 230, y: 320 },
      { id: 3, x: 420, y: 110 },
      { id: 4, x: 420, y: 300 },
      { id: 5, x: 620, y: 200 },
    ]);
    setEdges([
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 2 },
      { u: 1, v: 2, weight: 5 },
      { u: 1, v: 3, weight: 10 },
      { u: 2, v: 4, weight: 3 },
      { u: 4, v: 3, weight: 4 },
      { u: 3, v: 5, weight: 11 },
      { u: 4, v: 5, weight: 2 },
    ]);
    setStartNode(0);
    setEndNode(5);
    viz.load(null);
  };

  const handleCanvasClick = (e) => {
    if (mode !== 'add-node') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNodes(prev => [...prev, { id: prev.length, x, y }]);
    viz.load(null);
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    if (mode === 'set-start') { setStartNode(nodeId); viz.load(null); }
    else if (mode === 'set-end') { setEndNode(nodeId); viz.load(null); }
    else if (mode === 'add-edge') {
      if (pendingEdgeStart === null) {
        setPendingEdgeStart(nodeId);
      } else {
        if (pendingEdgeStart !== nodeId) {
          const w = prompt('Enter edge weight:', '1');
          if (w !== null && !isNaN(parseInt(w))) {
            setEdges(prev => [...prev, { u: pendingEdgeStart, v: nodeId, weight: parseInt(w) }]);
            viz.load(null);
          }
        }
        setPendingEdgeStart(null);
      }
    }
  };

  const onPlay = useCallback(() => {
    viz.handlePlayPause(async () => {
      if (nodes.length === 0 || startNode === null || endNode === null) {
        alert('Please add nodes, select a Start node, and select an End node.');
        throw new Error('incomplete graph');
      }
      const res = await fetch('/api/pathfind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: 'dijkstra_graph',
          numNodes: nodes.length,
          startNode,
          endNode,
          edges,
        }),
      });
      const data = await res.json();
      if (!data.history) throw new Error('No history returned');
      return data;
    });
  }, [viz, nodes.length, startNode, endNode, edges]);

  // Build node state map
  const nodeStates = new Map();
  for (let i = 0; i < viz.currentStep; i++) {
    const step = viz.history[i];
    const n = step.row;
    if (step.action === 'ENQUEUE') nodeStates.set(n, 'queued');
    if (step.action === 'VISIT')   nodeStates.set(n, 'visited');
    if (step.action === 'PATH')    nodeStates.set(n, 'path');
  }

  let visitedCount = 0, pathLen = 0;
  nodeStates.forEach(v => { if (v === 'visited') visitedCount++; if (v === 'path') pathLen++; });

  const modeButtons = [
    { key: 'add-node',  label: 'Add Node' },
    { key: 'add-edge',  label: 'Add Edge' },
    { key: 'set-start', label: 'Set Start' },
    { key: 'set-end',   label: 'Set End' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Dijkstra's Algorithm</h1>
          <p className="text-xs text-gray-500 leading-snug">Weighted graph pathfinding using a custom min-priority queue</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: Graph Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Dijkstra's Graph</h2>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              The father of pathfinding. Explores paths favoring lower costs, ensuring the shortest path on weighted graphs.
            </p>
          </div>

          {/* Mode toolbar */}
          <div className="flex flex-wrap gap-2">
            {modeButtons.map(({ key, label }) => (
              <button key={key} onClick={() => { setMode(key); setPendingEdgeStart(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  mode === key ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                {label}
              </button>
            ))}
            <button onClick={loadPrebuiltGraph} className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 transition-colors">
              Load Example
            </button>
            <button onClick={clearGraph} className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-rose-500 border-rose-200 hover:bg-rose-50 transition-colors">
              Clear
            </button>
          </div>

          {mode === 'add-edge' && pendingEdgeStart !== null && (
            <p className="text-xs text-amber-600 font-medium animate-pulse">
              Node {pendingEdgeStart} selected — click another node to complete the edge.
            </p>
          )}

          {/* Canvas — single relative container for both SVG edges and node divs */}
          <div
            className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden cursor-crosshair relative"
            style={{ height: 350 }}
            onClick={handleCanvasClick}
          >
            {/* SVG layer for edges — no viewBox so coordinates match node div pixels 1:1 */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {edges.map((e, i) => {
                const n1 = nodes.find(n => n.id === e.u);
                const n2 = nodes.find(n => n.id === e.v);
                if (!n1 || !n2) return null;
                const isPath = nodeStates.get(n1.id) === 'path' && nodeStates.get(n2.id) === 'path';
                const mx = (n1.x + n2.x) / 2;
                const my = (n1.y + n2.y) / 2;
                return (
                  <g key={i}>
                    <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                      stroke={isPath ? '#f59e0b' : '#d1d5db'} strokeWidth={isPath ? 3 : 2}
                    />
                    <rect x={mx - 12} y={my - 10} width={24} height={18} rx={3} fill="white" stroke="#e5e7eb" strokeWidth={1} />
                    <text x={mx} y={my + 4} fill="#6b7280" fontSize="11" fontWeight="700" textAnchor="middle">{e.weight}</text>
                  </g>
                );
              })}
            </svg>

            {/* Node divs — absolutely positioned inside the same container */}
            {nodes.map(n => {
              const state = nodeStates.get(n.id);
              let bg = 'bg-gray-100 border-gray-300 text-gray-700';
              if (state === 'path')    bg = 'bg-yellow-400 border-yellow-500 text-gray-900 shadow-md';
              else if (state === 'visited') bg = 'bg-blue-400 border-blue-500 text-white';
              else if (state === 'queued')  bg = 'bg-blue-100 border-blue-300 text-blue-700';
              if (n.id === startNode) bg = 'bg-emerald-500 border-emerald-600 text-white shadow-md';
              if (n.id === endNode)   bg = 'bg-rose-500 border-rose-600 text-white shadow-md';

              return (
                <motion.div key={n.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className={`absolute w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm cursor-pointer pointer-events-auto transition-colors duration-200 ${bg} ${pendingEdgeStart === n.id ? 'ring-4 ring-amber-400 ring-offset-1' : ''}`}
                  style={{ left: n.x - 20, top: n.y - 20 }}
                  onClick={(e) => handleNodeClick(e, n.id)}
                >
                  {n.id}
                </motion.div>
              );
            })}

            {/* Empty state hint */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none select-none">
                <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm">Click "Load Example" or click the canvas to add nodes</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <span className="text-xs text-gray-500 font-medium">Nodes Visited</span>
              <div className="text-2xl font-bold text-blue-600 mt-0.5">{visitedCount}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
              <span className="text-xs text-gray-500 font-medium">Path Length</span>
              <div className="text-2xl font-bold text-yellow-600 mt-0.5">{pathLen}</div>
            </div>
          </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3 h-fit">
          <div>
            <h3 className="text-base font-bold text-gray-900">Controls</h3>
            <p className="text-xs text-gray-500">Configure and run Dijkstra's</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Speed: {Math.max(0, Math.round(100 - (viz.speed - 20) / 1.8))}%
            </label>
            <input type="range" min="20" max="200" step="10"
              value={220 - viz.speed}
              onChange={(e) => viz.setSpeed(220 - Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={onPlay} disabled={viz.isComplete}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-5 py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {viz.isPlaying
                ? <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>Pause</>
                : <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>Find Path</>
              }
            </button>
            <button onClick={() => viz.load(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-3 transition-colors border border-gray-200" title="Reset path">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">Legend</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0"></span>Start</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-rose-500 flex-shrink-0"></span>End</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300 flex-shrink-0"></span>Unvisited</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300 flex-shrink-0"></span>Queued</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-400 flex-shrink-0"></span>Visited</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-yellow-400 flex-shrink-0"></span>Path</div>
            </div>
          </div>

          {/* Complexity */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Complexity Analysis</h4>
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <div>Time: <span className="font-mono text-gray-900">O(V + E log V)</span></div>
              <div>Space: <span className="font-mono text-gray-900">O(V)</span></div>
              <div className="mt-1 text-xs text-gray-400">Shortest path guaranteed (weighted)</div>
            </div>
          </div>

          {/* How to use */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Click "Load Example" for a prebuilt graph</li>
              <li>Or click the canvas to add nodes</li>
              <li>Use Add Edge to connect nodes with weights</li>
              <li>Set Start and End nodes</li>
              <li>Press Find Path!</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}
