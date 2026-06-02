import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const sortingLinks = [
  { label: 'Bubble Sort', path: '/bubble-sort' },
  { label: 'Insertion Sort', path: '/insertion-sort' },
  { label: 'Selection Sort', path: '/selection-sort' },
];

const pathfindingLinks = [
  { label: 'BFS', path: '/bfs' },
  { label: 'DFS', path: '/dfs' },
  { label: "Dijkstra's", path: '/dijkstra' },
];

function NavDropdown({ label, links, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`px-4 py-2 rounded-full flex items-center gap-1.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 min-w-[160px]">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isSorting = ['/bubble-sort', '/selection-sort', '/insertion-sort'].includes(currentPath);
  const isPathfinding = ['/bfs', '/dfs', '/dijkstra'].includes(currentPath);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-xl">Algorithm Visualizer</span>
      </Link>

      <div className="flex items-center gap-1 text-sm font-medium">
        <Link
          to="/"
          className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
            currentPath === '/' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>

        <NavDropdown label="Sorting" links={sortingLinks} isActive={isSorting} />
        <NavDropdown label="Pathfinding" links={pathfindingLinks} isActive={isPathfinding} />
      </div>
    </nav>
  );
}
