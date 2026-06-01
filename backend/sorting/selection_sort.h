#ifndef SELECTION_SORT_H
#define SELECTION_SORT_H

#include <iostream>
#include "common.h"

// ─── Selection Sort ───────────────────────────────────────────────────
// Finds the minimum element in the unsorted portion and swaps it with 
// the first unsorted element.
// Time: O(n²)   Space: O(1)
inline void selectionSort(int* arr, int size, StepHistory& history) {
    for (int i = 0; i < size - 1; i++) {
        int minIndex = i;
        
        // Find the minimum element in the remaining unsorted array
        for (int j = i + 1; j < size; j++) {
            // Log comparison between current element and current minimum
            history.addStep(COMPARE, j, minIndex, arr, size);
            
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // Swap the found minimum element with the first unsorted element
        if (minIndex != i) {
            int tmp = arr[i]; 
            arr[i] = arr[minIndex]; 
            arr[minIndex] = tmp;
            history.addStep(SWAP, i, minIndex, arr, size);
        }
        
        // The element at index i is now in its final sorted position
        history.addStep(LOCKED, i, -1, arr, size);
    }
    
    // The last element is inherently sorted
    history.addStep(LOCKED, size - 1, -1, arr, size);
}

#endif
