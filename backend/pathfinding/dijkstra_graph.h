#ifndef DIJKSTRA_GRAPH_H
#define DIJKSTRA_GRAPH_H

#include <iostream>
#include "Graph.h"
#include "dijkstra.h"

struct GraphEdge {
    int u;
    int v;
    int weight;
};

// ─── Explicit Graph Dijkstra ───────────────────────────────────────────────
inline void runDijkstraGraph(int numVertices, int startNode, int endNode, 
                             const GraphEdge* edges, int numEdges, PathfindingHistory& history) {
    
    graph g(numVertices);
    
    // Build the adjacency list from the explicit edges
    for (int i = 0; i < numEdges; i++) {
        g.addEdge(edges[i].u, edges[i].v, edges[i].weight);
        g.addEdge(edges[i].v, edges[i].u, edges[i].weight); // Assuming undirected graph
    }
    
    // We pass cols = 1, so node ID is stored in the 'row' property of the history step.
    executeDijkstraCore(g, startNode, endNode, 1, history);
}

#endif
