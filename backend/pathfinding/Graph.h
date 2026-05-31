#ifndef GRAPH_H
#define GRAPH_H

#include "common.h"
#include <iostream>

// Array-based queue moved directly into Graph.h to fix IntelliSense issues
class CustomQueue {
private:
    int* arr;
    int front, rear;
    int capacity;
    
public:
    CustomQueue(int size = 2000) {
        capacity = size;
        arr = new int[capacity];
        front = 0;
        rear = 0;
    }
    
    ~CustomQueue() {
        delete[] arr;
    }
    
    bool isEmpty() {
        return front == rear;
    }
    
    void push(int n) {
        if (rear == capacity) return;
        arr[rear++] = n;
    }
    
    int pop() {
        if (isEmpty()) return -1;
        return arr[front++];
    }
    
    CustomQueue(const CustomQueue&) = delete;
    CustomQueue& operator=(const CustomQueue&) = delete;
};

// Array-based stack for DFS
class CustomStack {
private:
    int* arr;
    int topIndex;
    int capacity;
    
public:
    CustomStack(int size = 2000) {
        capacity = size;
        arr = new int[capacity];
        topIndex = -1;
    }
    
    ~CustomStack() {
        delete[] arr;
    }
    
    bool isEmpty() {
        return topIndex == -1;
    }
    
    void push(int n) {
        if (topIndex == capacity - 1) return;
        arr[++topIndex] = n;
    }
    
    int pop() {
        if (isEmpty()) return -1;
        return arr[topIndex--];
    }
    
    CustomStack(const CustomStack&) = delete;
    CustomStack& operator=(const CustomStack&) = delete;
};

struct Node {
    int data;
    Node* next;
};

// Graph class matching the exact adjacency list structure provided
class graph {
private:
    Node** adj;
    int numVertices;
    
public:
    graph(int V) {
        numVertices = V;
        adj = new Node*[numVertices];
        for (int i = 0; i < numVertices; i++) {
            adj[i] = nullptr;
        }
    }
    
    ~graph() {
        for (int i = 0; i < numVertices; i++) {
            Node* temp = adj[i];
            while (temp != nullptr) {
                Node* next = temp->next;
                delete temp;
                temp = next;
            }
        }
        delete[] adj;
    }
    
    // addEdge implementation exactly matching the screenshot style
    void addEdge(int u, int v) {
        // We only add one direction here (we'll call it twice in bfs.h for undirected)
        Node* newNode = new Node{v, adj[u]};
        adj[u] = newNode;
    }
    
    // BFS traversal matching the user's provided logic
    void BFS(int start, int end, int cols, PathfindingHistory& history) {
        bool* visited = new bool[numVertices];
        int*  parent  = new int[numVertices];
        for (int i = 0; i < numVertices; i++) {
            visited[i] = false;
            parent[i]  = -1;
        }

        CustomQueue q(numVertices);          // exact safe size
        visited[start] = true;
        q.push(start);
        history.addStep(ENQUEUE, start / cols, start % cols);

        bool found = false;
        while (!q.isEmpty() && !found) {
            int node = q.pop();
            history.addStep(VISIT, node / cols, node % cols);

            if (node == end) { found = true; break; }

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
            // Collect path then emit start -> end
            int* path    = new int[numVertices];
            int  pathLen = 0;
            int  curr    = end;
            while (curr != -1) {
                path[pathLen++] = curr;
                curr = parent[curr];
            }
            for (int i = pathLen - 1; i >= 0; i--)
                history.addStep(PATH, path[i] / cols, path[i] % cols);
            delete[] path;
        }

        delete[] visited;
        delete[] parent;
    }
    
    // DFS traversal matching the BFS structure
    void DFS(int start, int end, int cols, PathfindingHistory& history) {
        bool* visited = new bool[numVertices];
        int*  parent  = new int[numVertices];
        for (int i = 0; i < numVertices; i++) {
            visited[i] = false;
            parent[i]  = -1;
        }

        CustomStack s(numVertices);
        visited[start] = true;
        s.push(start);
        history.addStep(ENQUEUE, start / cols, start % cols);

        bool found = false;
        while (!s.isEmpty() && !found) {
            int node = s.pop();
            history.addStep(VISIT, node / cols, node % cols);

            if (node == end) { found = true; break; }

            Node* temp = adj[node];
            while (temp) {
                int neigh = temp->data;
                if (!visited[neigh]) {
                    visited[neigh] = true;
                    parent[neigh]  = node;
                    s.push(neigh);
                    history.addStep(ENQUEUE, neigh / cols, neigh % cols);
                }
                temp = temp->next;
            }
        }

        if (found) {
            // Collect path then emit start -> end
            int* path    = new int[numVertices];
            int  pathLen = 0;
            int  curr    = end;
            while (curr != -1) {
                path[pathLen++] = curr;
                curr = parent[curr];
            }
            for (int i = pathLen - 1; i >= 0; i--)
                history.addStep(PATH, path[i] / cols, path[i] % cols);
            delete[] path;
        }

        delete[] visited;
        delete[] parent;
    }
    
    // Prevent copying
    graph(const graph&) = delete;
    graph& operator=(const graph&) = delete;
};

#endif
