#ifndef BFS_H
#define BFS_H

#include <iostream>
#include "Graph.h"

// ─── Adjacency List BFS ───────────────────────────────────────────────
// grid: flat array where 0 = empty, 1 = wall
inline void runBFS(int rows, int cols, int startR, int startC, int endR, int endC, 
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
            
            // Note: We only check Right and Down because checking Left and Up 
            // is inherently handled by the reverse edges added above, avoiding duplicates.
        }
    }
    
    int startNode = startR * cols + startC;
    int endNode = endR * cols + endC;
    
    // Run BFS traversal
    int numVertices = g.getNumVertices();
    Node** adj = g.getAdj();
    
    bool* visited = new bool[numVertices];
    int*  parent  = new int[numVertices];
    for (int i = 0; i < numVertices; i++) {
        visited[i] = false;
        parent[i]  = -1;
    }

    CustomQueue q(numVertices);          // exact safe size
    visited[startNode] = true;
    q.push(startNode);
    history.addStep(ENQUEUE, startNode / cols, startNode % cols);

    bool found = false;
    while (!q.isEmpty() && !found) {
        int node = q.pop();
        history.addStep(VISIT, node / cols, node % cols);

        if (node == endNode) { found = true; break; }

        Node* temp = adj[node];
        while (temp) {
            int neigh = temp->data;
            if (!visited[neigh]) {
                visited[neigh] = true;
                parent[neigh]  = node;
                q.push(neigh);
                history.addStep(ENQUEUE, neigh / cols, neigh % cols);
            }
            temp = temp->next;
        }
    }

    if (found) {
        emitPath(parent, startNode, endNode, cols, numVertices, history);
    }

    delete[] visited;
    delete[] parent;
}

#endif
