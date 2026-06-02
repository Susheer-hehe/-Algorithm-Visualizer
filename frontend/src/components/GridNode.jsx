import { memo } from 'react';

// Using memo to prevent re-rendering the entire grid on every frame.
// Grid node receives its status as a simple string.
const GridNode = memo(({ row, col, status, onMouseDown, onMouseEnter, onMouseUp }) => {
  // Determine color based on status
  let bg = 'bg-gray-50 border-gray-200'; // default empty
  let isNode = false;

  if (status === 'start') {
    bg = 'bg-emerald-500 border-emerald-600 z-10';
    isNode = true;
  } else if (status === 'end') {
    bg = 'bg-rose-500 border-rose-600 z-10';
    isNode = true;
  } else if (status === 'wall') {
    bg = 'bg-gray-700 border-gray-800';
  } else if (status === 'weight') {
    bg = 'bg-amber-700 border-amber-800';
  } else if (status === 'visited') {
    bg = 'bg-blue-200 border-blue-300';
  } else if (status === 'queued') {
    bg = 'bg-blue-100 border-blue-200';
  } else if (status === 'path') {
    bg = 'bg-yellow-400 border-yellow-500 z-10';
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
