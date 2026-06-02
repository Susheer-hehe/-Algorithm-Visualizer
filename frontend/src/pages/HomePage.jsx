import { Link } from 'react-router-dom';

const sortingAlgorithms = [
  {
    name: 'Bubble Sort',
    path: '/bubble-sort',
    time: 'O(n²)',
    space: 'O(1)',
    description: 'Repeatedly swaps adjacent elements if they are in the wrong order. Simple but inefficient for large datasets.',
    accent: 'border-t-indigo-500',
    iconBg: 'bg-indigo-500',
    linkColor: 'text-indigo-600 hover:text-indigo-700',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    name: 'Insertion Sort',
    path: '/insertion-sort',
    time: 'O(n²)',
    space: 'O(1)',
    description: 'Builds a sorted portion one element at a time by picking a key and inserting it into its correct position.',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500',
    linkColor: 'text-amber-600 hover:text-amber-700',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    ),
  },
  {
    name: 'Selection Sort',
    path: '/selection-sort',
    time: 'O(n²)',
    space: 'O(1)',
    description: 'Finds the minimum element and places it at the beginning. Repeats for the remaining unsorted portion.',
    accent: 'border-t-cyan-500',
    iconBg: 'bg-cyan-500',
    linkColor: 'text-cyan-600 hover:text-cyan-700',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

const pathfindingAlgorithms = [
  {
    name: 'BFS',
    path: '/bfs',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Breadth-First Search explores all neighbors at the current depth before moving deeper. Guarantees shortest path.',
    accent: 'border-t-cyan-500',
    iconBg: 'bg-cyan-500',
    linkColor: 'text-cyan-600 hover:text-cyan-700',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'DFS',
    path: '/dfs',
    time: 'O(V + E)',
    space: 'O(V)',
    description: 'Depth-First Search goes as deep as possible along each branch before backtracking. Uses a stack.',
    accent: 'border-t-violet-500',
    iconBg: 'bg-violet-500',
    linkColor: 'text-violet-600 hover:text-violet-700',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
  },
  {
    name: "Dijkstra's",
    path: '/dijkstra',
    time: 'O(V + E log V)',
    space: 'O(V)',
    description: 'The father of pathfinding. Explores paths favoring lower costs, ensuring the shortest path on weighted graphs.',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500',
    linkColor: 'text-amber-600 hover:text-amber-700',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

function AlgoCard({ algo }) {
  return (
    <Link
      to={algo.path}
      className={`group bg-white border-t-4 ${algo.accent} rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${algo.iconBg} flex items-center justify-center flex-shrink-0`}>
          {algo.icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">{algo.name}</h3>
          <div className="flex gap-3 mt-0.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              TIME: <span className="text-gray-600">{algo.time}</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              SPACE: <span className="text-gray-600">{algo.space}</span>
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{algo.description}</p>
      <div className={`mt-4 text-sm font-semibold ${algo.linkColor} flex items-center gap-1 transition-colors`}>
        Launch Visualizer →
      </div>
    </Link>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30">
            <svg className="w-11 h-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Algorithm Visualizer
          </h1>
          <p className="text-gray-500 text-xl">
            Visualize sorting and pathfinding algorithms with step-by-step animations
          </p>
        </div>

        {/* Sorting Section */}
        <div className="mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <SectionHeader
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            }
            title="Sorting Algorithms"
            subtitle="Visualize how elements compare, swap, and lock into their final positions"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortingAlgorithms.map((algo) => (
              <AlgoCard key={algo.path} algo={algo} />
            ))}
          </div>
        </div>

        {/* Pathfinding Section */}
        <div className="mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <SectionHeader
            icon={
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            title="Pathfinding Algorithms"
            subtitle="Explore how algorithms navigate through a grid to find the shortest path"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pathfindingAlgorithms.map((algo) => (
              <AlgoCard key={algo.path} algo={algo} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
