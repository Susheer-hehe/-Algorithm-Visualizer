import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ─── Algorithm Data ─────────────────────────────────────────────────
const sortingAlgorithms = [
  {
    name: 'Bubble Sort',
    path: '/bubble-sort',
    complexity: 'O(n²)',
    space: 'O(1)',
    description: 'Repeatedly swaps adjacent elements if they are in the wrong order. Simple but inefficient for large datasets.',
    color: 'from-indigo-500 to-purple-600',
    glow: 'group-hover:shadow-indigo-500/30',
    icon: '🫧',
    ready: true,
  },
  {
    name: 'Insertion Sort',
    path: '/insertion-sort',
    complexity: 'O(n²)',
    space: 'O(1)',
    description: 'Builds a sorted portion one element at a time by picking a key and inserting it into its correct position.',
    color: 'from-amber-500 to-orange-600',
    glow: 'group-hover:shadow-amber-500/30',
    icon: '📥',
    ready: true,
  },
  {
    name: 'Selection Sort',
    path: '/selection-sort',
    complexity: 'O(n²)',
    space: 'O(1)',
    description: 'Finds the minimum element and places it at the beginning. Repeats for the remaining unsorted portion.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'group-hover:shadow-cyan-500/30',
    icon: '🎯',
    ready: false,
  },
  {
    name: 'Quick Sort',
    path: '/quick-sort',
    complexity: 'O(n log n)',
    space: 'O(log n)',
    description: 'Picks a pivot, partitions the array around it, and recursively sorts the sub-arrays. Fast in practice.',
    color: 'from-rose-500 to-pink-600',
    glow: 'group-hover:shadow-rose-500/30',
    icon: '⚡',
    ready: false,
  },
];

const pathfindingAlgorithms = [
  {
    name: 'BFS',
    path: '/bfs',
    complexity: 'O(V + E)',
    space: 'O(V)',
    description: 'Breadth-First Search explores all neighbors at the current depth before moving deeper. Guarantees shortest path.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'group-hover:shadow-cyan-500/30',
    icon: '🌊',
    ready: false,
  },
  {
    name: 'DFS',
    path: '/dfs',
    complexity: 'O(V + E)',
    space: 'O(V)',
    description: 'Depth-First Search goes as deep as possible along each branch before backtracking. Uses a stack.',
    color: 'from-violet-500 to-purple-700',
    glow: 'group-hover:shadow-violet-500/30',
    icon: '🔍',
    ready: false,
  },
  {
    name: "Dijkstra's",
    path: '/dijkstra',
    complexity: 'O(V² / V+E log V)',
    space: 'O(V)',
    description: "Finds the shortest path from a source to all other nodes in a weighted graph. Uses a priority queue.",
    color: 'from-emerald-500 to-teal-600',
    glow: 'group-hover:shadow-emerald-500/30',
    icon: '🗺️',
    ready: false,
  },
];

// ─── Algorithm Card Component ───────────────────────────────────────
function AlgorithmCard({ algo, index }) {
  const CardWrapper = algo.ready ? Link : 'div';
  const linkProps = algo.ready ? { to: algo.path } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
    >
      <CardWrapper
        {...linkProps}
        className={`group block relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] ${algo.glow} hover:shadow-xl ${algo.ready ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
      >
        {/* Gradient accent line at top */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${algo.color} opacity-50 group-hover:opacity-100 transition-opacity`} />

        {/* Icon and title */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{algo.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
              {algo.name}
            </h3>
            <div className="flex gap-3 mt-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Time: <span className="text-slate-400">{algo.complexity}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Space: <span className="text-slate-400">{algo.space}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed">
          {algo.description}
        </p>

        {/* Status badge */}
        <div className="mt-4 flex items-center justify-between">
          {algo.ready ? (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r ${algo.color} bg-clip-text text-transparent`}>
              Launch Visualizer →
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
              🔒 Coming Soon
            </span>
          )}
        </div>
      </CardWrapper>
    </motion.div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────
function SectionHeader({ title, subtitle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      className="mb-6"
    >
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </motion.div>
  );
}

// ─── Main Landing Page ──────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-600/6 rounded-full blur-3xl animate-pulse-slow animation-delay-4000" />
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/6 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Algorithm
            </span>
            <br />
            <span className="text-white">Visualizer</span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Watch sorting and pathfinding algorithms come to life.
            Powered by a <span className="text-indigo-400 font-medium">C++ backend engine</span> with
            raw arrays and manual memory management.
          </p>

          {/* Tech badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-6"
          >
            {['C++ Backend', 'React Frontend', 'Raw Arrays', 'Custom Linked Lists', 'No std::vector'].map((tag, i) => (
              <span
                key={tag}
                className="px-3 py-1 text-[11px] font-mono rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Sorting Section */}
        <section className="mb-14">
          <SectionHeader
            title="📊 Sorting Algorithms"
            subtitle="Visualize how elements compare, swap, and lock into their final positions"
            index={1}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortingAlgorithms.map((algo, i) => (
              <AlgorithmCard key={algo.name} algo={algo} index={i + 2} />
            ))}
          </div>
        </section>

        {/* Pathfinding Section */}
        <section className="mb-14">
          <SectionHeader
            title="🧭 Pathfinding Algorithms"
            subtitle="Explore how algorithms navigate through a grid to find the shortest path"
            index={5}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pathfindingAlgorithms.map((algo, i) => (
              <AlgorithmCard key={algo.name} algo={algo} index={i + 6} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center pt-8 border-t border-white/[0.04] space-y-3"
        >
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            👥 About the Team
          </Link>
          <p className="text-xs text-slate-600 font-mono">
            DSA Course Project &nbsp;•&nbsp; Built with C++ &amp; React
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
