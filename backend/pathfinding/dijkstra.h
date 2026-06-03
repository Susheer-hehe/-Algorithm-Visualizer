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

#endif
