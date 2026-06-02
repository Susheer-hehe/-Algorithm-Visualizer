// ═══════════════════════════════════════════════════════════════════
//  Algorithm Visualizer — C++ Backend Engine
//  
//  This server receives requests from the React frontend, processes
//  them using completely custom data structures (NO standard library 
//  containers like std::vector or std::queue for core logic), and 
//  returns an exact step-by-step history payload for visualization.
// ═══════════════════════════════════════════════════════════════════

#include "include/httplib.h"
#include "include/json.hpp"
#include "sorting/bubble_sort.h"
#include "sorting/insertion_sort.h"
#include "sorting/selection_sort.h"
#include "pathfinding/bfs.h"
#include "pathfinding/dfs.h"
#include "pathfinding/dijkstra.h"
#include "pathfinding/dijkstra_graph.h"
#include <iostream>
#include <string>

using json = nlohmann::json;

// ─── CORS Helper ────────────────────────────────────────────────────
// Sets all required CORS headers so the React frontend can connect.
void setCORSHeaders(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

int main() {
    httplib::Server svr;

    // ─── POST /api/sort ─────────────────────────────────────────────
    // Receives: { "array": [5, 3, 8, 1, ...], "algorithm": "bubble" | "selection" | "insertion" }
    // Returns:  { "history": [ { action, indices, array }, ... ] }
    svr.Post("/api/sort", [](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);

        try {
            // 1. Parse the incoming JSON
            json requestBody = json::parse(req.body);

            // 2. Extract the array from the request
            //    We use nlohmann/json ONLY for parsing the input.
            //    The sorting and history use raw arrays exclusively.
            auto jsonArray = requestBody["array"];
            int size = static_cast<int>(jsonArray.size());

            if (size <= 0 || size > 200) {
                res.status = 400;
                res.set_content("{\"error\":\"Array size must be between 1 and 200\"}", "application/json");
                return;
            }

            // 3. Allocate a raw int* array
            int* arr = new int[size];
            for (int i = 0; i < size; i++) {
                arr[i] = jsonArray[i].get<int>();
            }

            // 4. Determine which algorithm to run
            std::string algorithm = "bubble"; // default
            if (requestBody.contains("algorithm")) {
                algorithm = requestBody["algorithm"].get<std::string>();
            }

            // 5. Run the algorithm and capture history
            StepHistory history;

            if (algorithm == "bubble") {
                bubbleSort(arr, size, history);
            } else if (algorithm == "insertion") {
                insertionSort(arr, size, history);
            } else if (algorithm == "selection") {
                selectionSort(arr, size, history);
            } else {
                res.status = 400;
                res.set_content("{\"error\":\"Unknown algorithm: " + algorithm + "\"}", "application/json");
                delete[] arr;
                return;
            }

            // 6. Build the response JSON
            //    The history serializes itself using manual string
            //    construction — no std::vector anywhere.
            std::string responseJSON = "{";
            responseJSON += "\"status\":\"success\",";
            responseJSON += "\"algorithm\":\"" + algorithm + "\",";
            responseJSON += "\"size\":" + std::to_string(size) + ",";
            responseJSON += "\"totalSteps\":" + std::to_string(history.count) + ",";
            responseJSON += "\"history\":" + history.toJSON();
            responseJSON += "}";

            // 7. Send the response
            res.set_content(responseJSON, "application/json");

            std::cout << "[OK] " << algorithm << " sort completed | "
                      << "size=" << size << " | "
                      << "steps=" << history.count << std::endl;

            // 8. Clean up — no memory leaks!
            delete[] arr;

        } catch (const std::exception& e) {
            std::cerr << "[ERROR] " << e.what() << std::endl;
            res.status = 500;
            std::string errorJSON = "{\"error\":\"";
            errorJSON += e.what();
            errorJSON += "\"}";
            res.set_content(errorJSON, "application/json");
        }
    });

    // ─── OPTIONS /api/sort (CORS Preflight) ─────────────────────────
    svr.Options("/api/sort", [](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        res.status = 204; // No content
    });

    // ─── GET /health ────────────────────────────────────────────────
    svr.Get("/health", [](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        res.set_content("{\"status\":\"running\",\"engine\":\"C++ Algorithm Visualizer\"}", "application/json");
    });

    // ─── POST /api/pathfind ──────────────────────────────────────────────
    // Handles all Pathfinding algorithms.
    // Supports two distinct data formats based on the requested algorithm:
    // 1. Explicit Graph (dijkstra_graph): numNodes, startNode, endNode, edges array
    // 2. 2D Grid Matrix (bfs, dfs, dijkstra): gridRows, gridCols, start, end, walls array
    svr.Post("/api/pathfind", [](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        try {
            auto requestBody = json::parse(req.body);
            std::string algorithm = requestBody.value("algorithm", "bfs");
            
            // ─── Format 1: Node-and-Edge Graph (Dijkstra) ───
            // Payload: { "algorithm": "dijkstra_graph", "numNodes": 6, "edges": [{"u":0, "v":1, "weight":4}] }
            if (algorithm == "dijkstra_graph") {
                int numNodes = requestBody.value("numNodes", 0);
                int startNode = requestBody.value("startNode", 0);
                int endNode = requestBody.value("endNode", 0);
                auto edgesArray = requestBody["edges"];
                int numEdges = static_cast<int>(edgesArray.size());
                GraphEdge* edges = new GraphEdge[numEdges];
                
                for (int i = 0; i < numEdges; i++) {
                    edges[i].u = edgesArray[i]["u"].get<int>();
                    edges[i].v = edgesArray[i]["v"].get<int>();
                    edges[i].weight = edgesArray[i]["weight"].get<int>();
                }
                
                PathfindingHistory history;
                runDijkstraGraph(numNodes, startNode, endNode, edges, numEdges, history);
                
                std::string jsonStr = history.toJSON();
                std::string responseBody = "{\"history\":" + jsonStr + "}";
                std::cout << "[POST /api/pathfind] dijkstra_graph -> " << numNodes << " nodes, " << numEdges << " edges. steps=" << history.count << std::endl;
                res.set_content(responseBody, "application/json");
                
                delete[] edges;
                return;
            }

            // ─── Format 2: 2D Grid Pathfinding (BFS, DFS, Dijkstra) ───
            // Payload: { "algorithm": "bfs" | "dfs" | "dijkstra", "gridRows": 20, "gridCols": 40, "start": { "r": 9, "c": 8 }, "end": { "r": 9, "c": 31 }, "walls": [0,1,0...] }
            int rows = requestBody.value("gridRows", 20);
            int cols = requestBody.value("gridCols", 40);
            
            auto startNode = requestBody["start"];
            int startR = startNode["r"];
            int startC = startNode["c"];

            auto endNode = requestBody["end"];
            int endR = endNode["r"];
            int endC = endNode["c"];

            auto wallsArray = requestBody["walls"]; // flat array of 1s and 0s
            int totalNodes = rows * cols;
            int* grid = new int[totalNodes];
            
            for (int i = 0; i < totalNodes; i++) {
                grid[i] = wallsArray[i].get<int>();
            }

            PathfindingHistory history;

            if (algorithm == "bfs") {
                runBFS(rows, cols, startR, startC, endR, endC, grid, history);
            } else if (algorithm == "dfs") {
                runDFS(rows, cols, startR, startC, endR, endC, grid, history);
            } else if (algorithm == "dijkstra") {
                runDijkstra(rows, cols, startR, startC, endR, endC, grid, history);
            } else {
                res.status = 400;
                res.set_content("{\"error\":\"Unknown algorithm: " + algorithm + "\"}", "application/json");
                delete[] grid;
                return;
            }

            std::string responseJSON = "{";
            responseJSON += "\"status\":\"success\",";
            responseJSON += "\"history\":";
            responseJSON += history.toJSON();
            responseJSON += "}";

            res.set_content(responseJSON, "application/json");
            delete[] grid;

        } catch (const std::exception& e) {
            res.status = 500;
            std::string errorJSON = "{\"error\":\"";
            errorJSON += e.what();
            errorJSON += "\"}";
            res.set_content(errorJSON, "application/json");
        }
    });

    // ─── OPTIONS /api/pathfind (CORS Preflight) ─────────────────────────
    svr.Options("/api/pathfind", [](const httplib::Request& req, httplib::Response& res) {
        setCORSHeaders(res);
        res.status = 204; // No content
    });

    // ─── Start Server ───────────────────────────────────────────────
    std::cout << "Starting Algorithm Visualizer API..." << std::endl;
    std::cout << "===================================================\n";
    std::cout << "  Algorithm Visualizer - C++ Backend Engine\n";
    std::cout << "===================================================\n";
    std::cout << "  Server:    http://localhost:8080\n";
    std::cout << "  Endpoints: POST /api/sort      (Bubble, Insertion, Selection)\n";
    std::cout << "             POST /api/pathfind  (BFS, DFS, Dijkstra)\n";
    std::cout << "             GET  /health\n";
    std::cout << "  Constraints: NO std::vector, raw int* arrays only\n";
    std::cout << "===================================================\n\n";

    svr.listen("localhost", 8080);

    return 0;
}