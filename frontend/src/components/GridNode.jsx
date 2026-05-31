import { memo } from 'react';

// Using memo to prevent re-rendering the entire grid on every frame.
// Grid node receives its status as a simple string.
const GridNode = memo(({ row, col, status, onMouseDown, onMouseEnter, onMouseUp }) => {
  // Determine color based on status
  let bg = 'bg-white/[0.03] border-white/[0.05]'; // default empty
  let isNode = false;

  if (status === 'start') {
    bg = 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400 z-10';
    isNode = true;
  } else if (status === 'end') {
    bg = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] border-rose-400 z-10';
    isNode = true;
  } else if (status === 'wall') {
    bg = 'bg-slate-700 border-slate-600 scale-95 rounded-sm';
  } else if (status === 'visited') {
    bg = 'bg-cyan-500/40 border-cyan-400/50 animate-pulse-fast';
  } else if (status === 'queued') {
    bg = 'bg-indigo-500/30 border-indigo-400/40';
  } else if (status === 'path') {
    bg = 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] border-amber-300 z-10 scale-110 rounded-sm transition-transform';
  }

  return (
    <div
      className={`w-full h-full border ${bg} transition-colors duration-200 select-none`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
      // Prevent drag events from interfering with custom mouse draw handling
      onDragStart={(e) => e.preventDefault()}
    >
      {isNode && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-2 h-2 rounded-full bg-white opacity-90 shadow-md" />
        </div>
      )}
    </div>
  );
});

GridNode.displayName = 'GridNode';
export default GridNode;
