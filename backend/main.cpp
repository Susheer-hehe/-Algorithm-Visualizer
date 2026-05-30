// ═══════════════════════════════════════════════════════════════════
//  Algorithm Visualizer — C++ Backend Engine
//  
//  This server receives an unsorted array from the React frontend,
//  runs Bubble Sort using raw int* arrays (NO std::vector),
//  logs every step (COMPARE, SWAP, LOCKED) into a custom history,
//  and returns the full history as JSON.
// ═══════════════════════════════════════════════════════════════════

#include "include/httplib.h"
#include "include/json.hpp"
#include "sorting/bubble_sort.h"
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
    // Receives: { "array": [5, 3, 8, 1, ...], "algorithm": "bubble" }
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

            // 3. Allocate a raw int* array — NO std::vector
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
            } else {
                // Future: selectionSort, quickSort, etc.
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

    // ─── Start Server ───────────────────────────────────────────────
    std::cout << "===================================================\n";
    std::cout << "  Algorithm Visualizer - C++ Backend Engine\n";
    std::cout << "===================================================\n";
    std::cout << "  Server:    http://localhost:8080\n";
    std::cout << "  Endpoints: POST /api/sort\n";
    std::cout << "             GET  /health\n";
    std::cout << "  Constraints: NO std::vector, raw int* arrays only\n";
    std::cout << "===================================================\n\n";

    svr.listen("localhost", 8080);

    return 0;
}