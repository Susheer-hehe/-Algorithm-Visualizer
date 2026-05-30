#ifndef BUBBLE_SORT_H
#define BUBBLE_SORT_H

#include <string>

// ─── Action Types ───────────────────────────────────────────────────
// These match the frontend's ACTION_TYPES exactly.
enum ActionType {
    COMPARE,
    SWAP,
    LOCKED
};

// Returns string representation for JSON serialization
inline const char* actionToString(ActionType action) {
    switch (action) {
        case COMPARE: return "COMPARE";
        case SWAP:    return "SWAP";
        case LOCKED:  return "LOCKED";
    }
    return "UNKNOWN";
}

// ─── Step Struct ────────────────────────────────────────────────────
// Represents a single step in the algorithm's history.
// Each step captures the action, the indices involved, and a full
// snapshot of the array at that moment.
struct Step {
    ActionType action;
    int* indices;       // dynamically allocated raw array of involved indices
    int indicesCount;   // how many indices in this step
    int* arraySnapshot; // dynamically allocated copy of the full array
    int arraySize;      // size of the array snapshot

    Step() : action(COMPARE), indices(nullptr), indicesCount(0),
             arraySnapshot(nullptr), arraySize(0) {}

    // Deep copy constructor (needed for raw pointer management)
    Step(const Step& other) {
        action = other.action;
        indicesCount = other.indicesCount;
        arraySize = other.arraySize;

        indices = new int[indicesCount];
        for (int i = 0; i < indicesCount; i++) {
            indices[i] = other.indices[i];
        }

        arraySnapshot = new int[arraySize];
        for (int i = 0; i < arraySize; i++) {
            arraySnapshot[i] = other.arraySnapshot[i];
        }
    }

    // Assignment operator
    Step& operator=(const Step& other) {
        if (this != &other) {
            // Free existing memory
            delete[] indices;
            delete[] arraySnapshot;

            action = other.action;
            indicesCount = other.indicesCount;
            arraySize = other.arraySize;

            indices = new int[indicesCount];
            for (int i = 0; i < indicesCount; i++) {
                indices[i] = other.indices[i];
            }

            arraySnapshot = new int[arraySize];
            for (int i = 0; i < arraySize; i++) {
                arraySnapshot[i] = other.arraySnapshot[i];
            }
        }
        return *this;
    }

    // Destructor — clean up raw arrays
    ~Step() {
        delete[] indices;
        delete[] arraySnapshot;
    }
};

// ─── History Container ──────────────────────────────────────────────
// A manually managed dynamic array of Steps (NO std::vector).
struct StepHistory {
    Step* steps;    // raw array of Step objects
    int count;      // current number of steps
    int capacity;   // total allocated capacity

    StepHistory() : steps(nullptr), count(0), capacity(0) {
        capacity = 64; // initial capacity
        steps = new Step[capacity];
    }

    ~StepHistory() {
        delete[] steps;
    }

    // Add a step, doubling capacity if needed
    void addStep(ActionType action, const int* involvedIndices, int numIndices,
                 const int* currentArray, int arrSize) {
        // Grow if needed (double the capacity — amortized O(1))
        if (count >= capacity) {
            int newCapacity = capacity * 2;
            Step* newSteps = new Step[newCapacity];
            for (int i = 0; i < count; i++) {
                newSteps[i] = steps[i];
            }
            delete[] steps;
            steps = newSteps;
            capacity = newCapacity;
        }

        // Build the new step
        steps[count].action = action;

        // Copy indices
        steps[count].indicesCount = numIndices;
        delete[] steps[count].indices; // clear any default-constructed memory
        steps[count].indices = new int[numIndices];
        for (int i = 0; i < numIndices; i++) {
            steps[count].indices[i] = involvedIndices[i];
        }

        // Copy array snapshot
        steps[count].arraySize = arrSize;
        delete[] steps[count].arraySnapshot; // clear any default-constructed memory
        steps[count].arraySnapshot = new int[arrSize];
        for (int i = 0; i < arrSize; i++) {
            steps[count].arraySnapshot[i] = currentArray[i];
        }

        count++;
    }

    // Serialize the entire history to a JSON string (manual construction)
    std::string toJSON() const {
        std::string json = "[";
        for (int i = 0; i < count; i++) {
            if (i > 0) json += ",";
            json += "{";

            // "action": "COMPARE"
            json += "\"action\":\"";
            json += actionToString(steps[i].action);
            json += "\",";

            // "indices": [0, 1]
            json += "\"indices\":[";
            for (int j = 0; j < steps[i].indicesCount; j++) {
                if (j > 0) json += ",";
                json += std::to_string(steps[i].indices[j]);
            }
            json += "],";

            // "array": [5, 3, 8, ...]
            json += "\"array\":[";
            for (int j = 0; j < steps[i].arraySize; j++) {
                if (j > 0) json += ",";
                json += std::to_string(steps[i].arraySnapshot[j]);
            }
            json += "]";

            json += "}";
        }
        json += "]";
        return json;
    }

    // Prevent copying the whole history (it's expensive)
    StepHistory(const StepHistory&) = delete;
    StepHistory& operator=(const StepHistory&) = delete;
};

// ─── Bubble Sort Algorithm ──────────────────────────────────────────
// Operates on a raw int* array. Logs every COMPARE, SWAP, and LOCKED
// action into the StepHistory.
//
// @param arr     - dynamically allocated raw array (int*)
// @param size    - number of elements
// @param history - output parameter, filled with all steps
inline void bubbleSort(int* arr, int size, StepHistory& history) {
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - 1 - i; j++) {
            // ── COMPARE ──
            int compareIndices[2] = { j, j + 1 };
            history.addStep(COMPARE, compareIndices, 2, arr, size);

            // ── SWAP (if needed) ──
            if (arr[j] > arr[j + 1]) {
                // Manual swap — no std::swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;

                int swapIndices[2] = { j, j + 1 };
                history.addStep(SWAP, swapIndices, 2, arr, size);
            }
        }
        // ── LOCKED — this element is in its final position ──
        int lockedIndex[1] = { size - 1 - i };
        history.addStep(LOCKED, lockedIndex, 1, arr, size);
    }

    // Lock the very first element (sorted by default after all passes)
    int lastLocked[1] = { 0 };
    history.addStep(LOCKED, lastLocked, 1, arr, size);
}

#endif // BUBBLE_SORT_H
