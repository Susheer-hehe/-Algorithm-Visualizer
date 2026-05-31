#ifndef DFS_H
#define DFS_H

#include "Graph.h"

// ─── Adjacency List DFS ───────────────────────────────────────────────
inline void runDFS(int rows, int cols, int startR, int startC, int endR, int endC, 
                   const int* grid, PathfindingHistory& history) {
    
    int totalNodes = rows * cols;
    graph g(totalNodes);
    
    // Build the adjacency list graph based on the grid
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            int u = r * cols + c;
            
            if (grid[u] == 1) continue; // Skip walls
            
            // Check right neighbor
            if (c + 1 < cols) {
                int v = r * cols + (c + 1);
                if (grid[v] == 0) {
                    g.addEdge(u, v);
                    g.addEdge(v, u); // Undirected connection
                }
            }
            // Check down neighbor
            if (r + 1 < rows) {
                int v = (r + 1) * cols + c;
                if (grid[v] == 0) {
                    g.addEdge(u, v);
                    g.addEdge(v, u); // Undirected connection
                }
            }
        }
    }
    
    int startNode = startR * cols + startC;
    int endNode = endR * cols + endC;
    
    // Run DFS traversal using the adjacency list
    g.DFS(startNode, endNode, cols, history);
}

#endif
