#ifndef INSERTION_SORT_H
#define INSERTION_SORT_H

#include <iostream>
#include "common.h"

// ─── Insertion Sort ───────────────────────────────────────────────────
// Builds a sorted portion one element at a time.
// Picks a key, shifts larger elements right, then inserts the key.
// Time: O(n²)   Space: O(1)
inline void insertionSort(int* arr, int size, StepHistory& history) {

    // First element is already "sorted"
    history.addStep(LOCKED, 0, -1, arr, size);

    for (int i = 1; i < size; i++) {
        int key = arr[i];
        int j   = i - 1;

        // Compare key with each element to its left
        while (j >= 0) {
            history.addStep(COMPARE, j, i, arr, size);

            if (arr[j] > key) {
                // Shift arr[j] one position to the right
                arr[j + 1] = arr[j];
                history.addStep(SHIFT, j, j + 1, arr, size);
                j--;
            } else {
                // arr[j] <= key, stop here
                break;
            }
        }

        // Insert the key into its correct position
        arr[j + 1] = key;
        history.addStep(INSERT, j + 1, -1, arr, size);

        // Mark this element as sorted
        history.addStep(LOCKED, i, -1, arr, size);
    }
}

#endif
