#ifndef PATHFINDING_COMMON_H
#define PATHFINDING_COMMON_H

#include <iostream>
#include <string>

// Actions during pathfinding
enum PathActionType {
    VISIT,      // Node has been dequeued and visited
    ENQUEUE,    // Neighbor has been discovered and queued
    PATH        // Node is part of the final shortest path
};

inline const char* pathActionToString(PathActionType a) {
    switch (a) {
        case VISIT:   return "VISIT";
        case ENQUEUE: return "ENQUEUE";
        case PATH:    return "PATH";
    }
    return "UNKNOWN";
}

// A single step in the pathfinding process
struct PathfindingStep {
    PathActionType action;
    int row;
    int col;
    
    PathfindingStep(PathActionType a, int r, int c) 
        : action(a), row(r), col(c) {}
};

// Custom dynamic array list for storing the history (No std::vector)
struct PathfindingHistory {
    PathfindingStep** steps;
    int count;
    int capacity;

    PathfindingHistory() : count(0), capacity(128) {
        steps = new PathfindingStep*[capacity];
    }

    ~PathfindingHistory() {
        for (int i = 0; i < count; i++) {
            delete steps[i];
        }
        delete[] steps;
    }

    void addStep(PathActionType action, int row, int col) {
        if (count == capacity) {
            int newCap = capacity * 2;
            PathfindingStep** newBuf = new PathfindingStep*[newCap];
            for (int i = 0; i < count; i++) newBuf[i] = steps[i];
            delete[] steps;
            steps = newBuf;
            capacity = newCap;
        }
        steps[count++] = new PathfindingStep(action, row, col);
    }

    // Convert to JSON for React frontend
    std::string toJSON() const {
        std::string json = "[";
        for (int i = 0; i < count; i++) {
            if (i > 0) json += ",";
            const PathfindingStep* s = steps[i];
            json += "{\"action\":\"";
            json += pathActionToString(s->action);
            json += "\",\"row\":";
            json += std::to_string(s->row);
            json += ",\"col\":";
            json += std::to_string(s->col);
            json += "}";
        }
        return json + "]";
    }
    
    // Prevent copies
    PathfindingHistory(const PathfindingHistory&) = delete;
    PathfindingHistory& operator=(const PathfindingHistory&) = delete;
};

// ─── Path Reconstruction Helper ──────────────────────────────────────────────
inline void emitPath(int* parent, int start, int end, int cols, int numVertices, PathfindingHistory& history) {
    int* path    = new int[numVertices];
    int  pathLen = 0;
    int  curr    = end;
    while (curr != -1) {
        path[pathLen++] = curr;
        curr = parent[curr];
    }
    // Emit in reverse order (start -> end)
    for (int i = pathLen - 1; i >= 0; i--) {
        history.addStep(PATH, path[i] / cols, path[i] % cols);
    }
    delete[] path;
}

#endif
