#ifndef COMMON_H
#define COMMON_H

#include <string>

// ─── Action Types (shared across all sorting algorithms) ─────────────
enum ActionType {
    COMPARE,    // comparing two elements
    SWAP,       // swapping two elements
    LOCKED,     // element is in its final sorted position
    SHIFT,      // shifting an element one position right (insertion sort)
    INSERT      // inserting the key into its correct position
};

inline const char* actionToString(ActionType a) {
    switch (a) {
        case COMPARE: return "COMPARE";
        case SWAP:    return "SWAP";
        case LOCKED:  return "LOCKED";
        case SHIFT:   return "SHIFT";
        case INSERT:  return "INSERT";
    }
    return "UNKNOWN";
}

// ─── Step ────────────────────────────────────────────────────────────
// indexB == -1 means single-index action (LOCKED, INSERT).
struct Step {
    ActionType  action;
    int         indexA;
    int         indexB;
    int*        arraySnapshot;
    int         arraySize;

    Step() : action(COMPARE), indexA(-1), indexB(-1),
             arraySnapshot(nullptr), arraySize(0) {}

    ~Step() { delete[] arraySnapshot; }

    Step(const Step&)            = delete;
    Step& operator=(const Step&) = delete;
};

// ─── StepHistory ─────────────────────────────────────────────────────
// Stores Step* pointers so resizing never touches Step internals.
struct StepHistory {
    Step** steps;
    int    count;
    int    capacity;

    StepHistory() : count(0), capacity(64) {
        steps = new Step*[capacity];
    }

    ~StepHistory() {
        for (int i = 0; i < count; i++) delete steps[i];
        delete[] steps;
    }

    void addStep(ActionType action, int a, int b,
                 const int* arr, int size) {
        if (count == capacity) {
            int    newCap  = capacity * 2;
            Step** newBuf  = new Step*[newCap];
            for (int i = 0; i < count; i++) newBuf[i] = steps[i];
            delete[] steps;
            steps    = newBuf;
            capacity = newCap;
        }

        Step* s          = new Step();
        s->action        = action;
        s->indexA        = a;
        s->indexB        = b;
        s->arraySize     = size;
        s->arraySnapshot = new int[size];
        for (int i = 0; i < size; i++) s->arraySnapshot[i] = arr[i];

        steps[count++] = s;
    }

    // Output JSON with "indices" array for frontend compatibility
    std::string toJSON() const {
        std::string json = "[";
        for (int i = 0; i < count; i++) {
            if (i > 0) json += ",";
            const Step* s = steps[i];
            json += "{\"action\":\"";
            json += actionToString(s->action);
            json += "\",\"indices\":[";
            json += std::to_string(s->indexA);
            if (s->indexB != -1) {
                json += ",";
                json += std::to_string(s->indexB);
            }
            json += "],\"array\":[";
            for (int j = 0; j < s->arraySize; j++) {
                if (j > 0) json += ",";
                json += std::to_string(s->arraySnapshot[j]);
            }
            json += "]}";
        }
        return json + "]";
    }

    StepHistory(const StepHistory&)            = delete;
    StepHistory& operator=(const StepHistory&) = delete;
};

#endif
