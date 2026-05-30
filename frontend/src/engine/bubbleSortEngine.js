/**
 * Bubble Sort Engine
 * 
 * Generates the complete step-by-step history of a Bubble Sort execution.
 * This mirrors the JSON format the C++ backend will eventually produce.
 * 
 * Actions:
 *   COMPARE  — two elements are being compared
 *   SWAP     — two elements are being swapped
 *   LOCKED   — an element is in its final sorted position
 */

export const ACTION_TYPES = {
  COMPARE: 'COMPARE',
  SWAP: 'SWAP',
  LOCKED: 'LOCKED',
};

/**
 * @param {number[]} inputArray - The unsorted array
 * @returns {{ history: Array<{ action: string, indices: number[], array: number[] }>, sortedArray: number[] }}
 */
export function generateBubbleSortHistory(inputArray) {
  const arr = [...inputArray];
  const n = arr.length;
  const history = [];

  // Snapshot helper — capture current array state
  const snapshot = (action, indices) => {
    history.push({
      action,
      indices: [...indices],
      array: [...arr],
    });
  };

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // Step 1: Compare
      snapshot(ACTION_TYPES.COMPARE, [j, j + 1]);

      // Step 2: Swap if needed
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        snapshot(ACTION_TYPES.SWAP, [j, j + 1]);
      }
    }
    // The last unsorted element is now locked
    snapshot(ACTION_TYPES.LOCKED, [n - 1 - i]);
  }

  // Lock the very first element (it's sorted by default)
  snapshot(ACTION_TYPES.LOCKED, [0]);

  return { history, sortedArray: [...arr] };
}

/**
 * Generate a random array of a given size with values between min and max
 */
export function generateRandomArray(size = 30, min = 10, max = 400) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}
