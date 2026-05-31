/**
 * Insertion Sort Engine (JS fallback)
 *
 * Generates step-by-step history matching the C++ backend format.
 * Actions: COMPARE, SHIFT, INSERT, LOCKED
 */

export const ACTION_TYPES = {
  COMPARE: 'COMPARE',
  SWAP: 'SWAP',
  LOCKED: 'LOCKED',
  SHIFT: 'SHIFT',
  INSERT: 'INSERT',
};

/**
 * @param {number[]} inputArray
 * @returns {{ history: Array<{ action: string, indices: number[], array: number[] }> }}
 */
export function generateInsertionSortHistory(inputArray) {
  const arr = [...inputArray];
  const n = arr.length;
  const history = [];

  const snapshot = (action, indices) => {
    history.push({
      action,
      indices: [...indices],
      array: [...arr],
    });
  };

  // First element is already sorted
  snapshot(ACTION_TYPES.LOCKED, [0]);

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    while (j >= 0) {
      snapshot(ACTION_TYPES.COMPARE, [j, i]);

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        snapshot(ACTION_TYPES.SHIFT, [j, j + 1]);
        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    snapshot(ACTION_TYPES.INSERT, [j + 1]);
    snapshot(ACTION_TYPES.LOCKED, [i]);
  }

  return { history };
}

export function generateRandomArray(size = 30, min = 10, max = 400) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}
