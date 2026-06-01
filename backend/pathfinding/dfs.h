#ifndef DFS_H
#define DFS_H

#include <iostream>
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
    
    // Run DFS traversal
    int numVertices = g.getNumVertices();
    Node** adj = g.getAdj();
    
    bool* visited = new bool[numVertices];
    int*  parent  = new int[numVertices];
    for (int i = 0; i < numVertices; i++) {
        visited[i] = false;
        parent[i]  = -1;
    }

    CustomStack s(numVertices);
    // Do NOT set visited[startNode] = true here.
    s.push(startNode);
    history.addStep(ENQUEUE, startNode / cols, startNode % cols);

    bool found = false;
    while (!s.isEmpty() && !found) {
        int node = s.pop();
        if (visited[node]) continue; // already processed via a shorter push
        visited[node] = true;
        history.addStep(VISIT, node / cols, node % cols);

        if (node == endNode) { found = true; break; }

        Node* temp = adj[node];
        while (temp) {
            int neigh = temp->data;
            if (!visited[neigh]) {
                if (parent[neigh] == -1) {
                    parent[neigh] = node;
                }
                s.push(neigh);
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
