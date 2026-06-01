#ifndef BUBBLE_SORT_H
#define BUBBLE_SORT_H

#include <iostream>
#include "common.h"

// ─── Bubble Sort ──────────────────────────────────────────────────────
// Repeatedly swaps adjacent elements if they are in the wrong order.
// Time: O(n²)   Space: O(1)
inline void bubbleSort(int* arr, int size, StepHistory& history) {
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - 1 - i; j++) {
            history.addStep(COMPARE, j, j + 1, arr, size);
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = tmp;
                history.addStep(SWAP, j, j + 1, arr, size);
            }
        }
        history.addStep(LOCKED, size - 1 - i, -1, arr, size);
    }
    history.addStep(LOCKED, 0, -1, arr, size);
}

#endif
