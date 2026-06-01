import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Controls from '../components/Controls';

export default function DijkstraVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [mode, setMode] = useState('add-node'); // 'add-node', 'add-edge', 'set-start', 'set-end'
  
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  
  const [pendingEdgeStart, setPendingEdgeStart] = useState(null); // Node ID

  const resetState = useCallback(() => {
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setStartNode(null);
    setEndNode(null);
    resetState();
  };

  const loadPrebuiltGraph = () => {
    setNodes([
      { id: 0, x: 100, y: 300 },
      { id: 1, x: 300, y: 150 },
      { id: 2, x: 300, y: 450 },
      { id: 3, x: 500, y: 200 },
      { id: 4, x: 500, y: 400 },
      { id: 5, x: 700, y: 300 },
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
    resetState();
  };

  const handleCanvasClick = (e) => {
    if (mode === 'add-node') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNodes(prev => [...prev, { id: prev.length, x, y }]);
      resetState();
    }
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    if (mode === 'set-start') {
      setStartNode(nodeId);
      resetState();
    } else if (mode === 'set-end') {
      setEndNode(nodeId);
      resetState();
    } else if (mode === 'add-edge') {
      if (pendingEdgeStart === null) {
        setPendingEdgeStart(nodeId);
      } else {
        if (pendingEdgeStart !== nodeId) {
          const w = prompt("Enter edge weight (e.g., 5):", "1");
          if (w !== null && !isNaN(parseInt(w))) {
            setEdges(prev => [...prev, { u: pendingEdgeStart, v: nodeId, weight: parseInt(w) }]);
            resetState();
          }
        }
        setPendingEdgeStart(null);
      }
    }
  };

  // ── History fetch ──────────────────────────────────────────────────
  const ensureHistory = useCallback(async () => {
    if (history.length > 0) return history;
    if (nodes.length === 0 || startNode === null || endNode === null) {
      alert("Please add nodes, select a Start node, and select an End node.");
      setIsPlaying(false);
      return [];
    }
    try {
      const res = await fetch('/api/pathfind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: 'dijkstra_graph',
          numNodes: nodes.length,
          startNode: startNode,
          endNode: endNode,
          edges: edges
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
  }, [history, nodes.length, startNode, endNode, edges]);

  // Playback Loop
  const timerRef = useRef(null);
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    const h = await ensureHistory();
    if (h.length === 0) return;
    setIsPlaying(true);
  }, [isPlaying, ensureHistory]);

  const handleStepForward = useCallback(async () => {
    setIsPlaying(false);
    const h = await ensureHistory();
    if (h.length > 0) {
      setCurrentStep(s => Math.min(s + 1, h.length));
    }
  }, [ensureHistory]);

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  if (isPlaying) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentStep(s => {
        if (s >= history.length) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, Math.max(10, 200 - speed));
  }

  // Determine Node & Edge States up to current step
  const nodeStates = new Map(); // id -> 'visited', 'queued', 'path'
  const edgeStates = new Map(); // "u-v" or "v-u" -> 'queued', 'path'
  
  for (let i = 0; i < currentStep; i++) {
    const step = history[i];
    // In our backend cols=1, so step.row is the node ID
    const n = step.row;
    
    if (step.action === 'ENQUEUE') nodeStates.set(n, 'queued');
    if (step.action === 'VISIT') nodeStates.set(n, 'visited');
    if (step.action === 'PATH') nodeStates.set(n, 'path');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      <header className="relative z-10 pt-6 pb-4 px-6">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
            <span className="text-xl">←</span> Back to Hub
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Dijkstra's Graph
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-mono tracking-wide">
              Weighted Graph &nbsp;•&nbsp; Priority Queue
            </p>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-8 max-w-7xl mx-auto w-full gap-4">
        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
          {['add-node', 'add-edge', 'set-start', 'set-end'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setPendingEdgeStart(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${
                mode === m ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
          <div className="w-px bg-slate-700 mx-2" />
          <button onClick={loadPrebuiltGraph} className="px-3 py-1.5 text-xs font-semibold rounded-md text-emerald-400 hover:bg-slate-700">
            LOAD EXAMPLE
          </button>
          <button onClick={clearGraph} className="px-3 py-1.5 text-xs font-semibold rounded-md text-rose-400 hover:bg-slate-700">
            CLEAR
          </button>
        </div>
        
        {mode === 'add-edge' && pendingEdgeStart !== null && (
          <div className="text-amber-400 text-xs animate-pulse">Select the target node to complete the edge.</div>
        )}

        <div 
          className="relative w-full h-[600px] bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
          onClick={handleCanvasClick}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((e, i) => {
              const n1 = nodes.find(n => n.id === e.u);
              const n2 = nodes.find(n => n.id === e.v);
              if (!n1 || !n2) return null;
              
              const isPath = nodeStates.get(n1.id) === 'path' && nodeStates.get(n2.id) === 'path';
              
              return (
                <g key={i}>
                  <line 
                    x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                    stroke={isPath ? '#fbbf24' : '#475569'}
                    strokeWidth={isPath ? 4 : 2}
                    className="transition-all duration-300"
                  />
                  <text 
                    x={(n1.x + n2.x) / 2} 
                    y={((n1.y + n2.y) / 2) - 10}
                    fill="#94a3b8"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {nodes.map(n => {
            let bg = 'bg-slate-700 border-slate-500';
            const state = nodeStates.get(n.id);
            
            if (state === 'path') bg = 'bg-amber-400 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.8)]';
            else if (state === 'visited') bg = 'bg-cyan-500/80 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]';
            else if (state === 'queued') bg = 'bg-indigo-500/80 border-indigo-300';
            
            if (n.id === startNode) bg = 'bg-emerald-500 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)]';
            if (n.id === endNode) bg = 'bg-rose-500 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.8)]';
            
            const isPending = pendingEdgeStart === n.id;
            
            return (
              <motion.div
                key={n.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center font-bold shadow-lg cursor-pointer pointer-events-auto transition-colors duration-300 ${bg} ${isPending ? 'ring-4 ring-amber-500 animate-pulse' : ''}`}
                style={{ left: n.x, top: n.y }}
                onClick={(e) => handleNodeClick(e, n.id)}
              >
                {n.id}
              </motion.div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-4 z-50">
        <Controls 
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onShuffle={resetState}
          speed={speed}
          onSpeedChange={setSpeed}
          disableShuffle={true}
        />
        
        {/* Progress Bar */}
        <div className="mt-4 max-w-3xl mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-200 ease-linear"
            style={{ width: `${history.length > 0 ? (currentStep / history.length) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
