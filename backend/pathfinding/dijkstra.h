#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include <iostream>
#include "Graph.h"

inline void executeDijkstraCore(graph& g, int start, int end, int cols, PathfindingHistory& history) {
    int numVertices = g.getNumVertices();
    Node** adj = g.getAdj();

    bool* visited = new bool[numVertices];
    int*  parent  = new int[numVertices];
    int*  dist    = new int[numVertices];
    
    for (int i = 0; i < numVertices; i++) {
        visited[i] = false;
        parent[i]  = -1;
        dist[i]    = 2147483647; // Max int for infinity
    }

    PriorityQueue pq(numVertices * 4); // safely sized
    dist[start] = 0;
    pq.push(start, 0);
    history.addStep(ENQUEUE, start / cols, start % cols);

    bool found = false;
    while (!pq.isEmpty() && !found) {
        PQNode curr = pq.pop();
        int node = curr.vertex;
        int d = curr.distance;

        if (visited[node]) continue;
        visited[node] = true;
        history.addStep(VISIT, node / cols, node % cols);

        if (node == end) { found = true; break; }

        Node* temp = adj[node];
        while (temp) {
            int neigh = temp->data;
            int weight = temp->weight;
            
            if (!visited[neigh] && dist[node] + weight < dist[neigh]) {
                dist[neigh] = dist[node] + weight;
                parent[neigh] = node;
                pq.push(neigh, dist[neigh]);
                history.addStep(ENQUEUE, neigh / cols, neigh % cols);
            }
            temp = temp->next;
        }
    }

    if (found) {
        emitPath(parent, start, end, cols, numVertices, history);
    }

    delete[] visited;
    delete[] parent;
    delete[] dist;
}

// ─── Adjacency List Dijkstra ───────────────────────────────────────────────
inline void runDijkstra(int rows, int cols, int startR, int startC, int endR, int endC, 
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
                if (grid[v] != 1) {
                    // Cost is based on the destination node's weight. 
                    // Normal = 1, Mud/Weight = 5 (grid == 2)
                    int weightRight = (grid[v] == 2) ? 5 : 1;
                    int weightHere = (grid[u] == 2) ? 5 : 1;
                    
                    g.addEdge(u, v, weightRight);
                    g.addEdge(v, u, weightHere); 
                }
            }
            // Check down neighbor
            if (r + 1 < rows) {
                int v = (r + 1) * cols + c;
                if (grid[v] != 1) {
                    int weightDown = (grid[v] == 2) ? 5 : 1;
                    int weightHere = (grid[u] == 2) ? 5 : 1;
                    
                    g.addEdge(u, v, weightDown);
                    g.addEdge(v, u, weightHere); 
                }
            }
        }
    }
    
    int startNode = startR * cols + startC;
    int endNode = endR * cols + endC;
    
    executeDijkstraCore(g, startNode, endNode, cols, history);
}

#endif
