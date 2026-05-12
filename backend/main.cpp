#include "include/httplib.h"
#include "include/json.hpp"
#include <iostream>

// For convenience
using json = nlohmann::json;

int main() {
    httplib::Server svr;

    // Route to handle the sorting request from React
    svr.Post("/api/sort", [](const httplib::Request& req, httplib::Response& res) {
        
        // 1. Set CORS headers so React doesn't block the connection
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");

        // 2. Create dummy response data (We will replace this with your actual sorting logic later)
        json responseData = {
            {"status", "success"},
            {"message", "Hello from C++!"},
            {"steps", {
                {{"action", "COMPARE"}, {"index1", 0}, {"index2", 1}},
                {{"action", "SWAP"}, {"index1", 0}, {"index2", 1}}
            }}
        };

        // 3. Send JSON back to the frontend
        res.set_content(responseData.dump(), "application/json");
    });

    // Handle Preflight OPTIONS request for CORS (Crucial for web browsers)
    svr.Options("/api/sort", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
    });

    std::cout << "Starting C++ Engine...\n";
    std::cout << "Backend API running on http://localhost:8080\n";
    
    // Start listening on port 8080
    svr.listen("localhost", 8080);

    return 0;
}