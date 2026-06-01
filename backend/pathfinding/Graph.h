#ifndef GRAPH_H
#define GRAPH_H

#include "common.h"
#include "PriorityQueue.h"
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
    int weight;
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
    
    // addEdge implementation exactly matching the screenshot style, but extended for weights
    void addEdge(int u, int v, int weight = 1) {
        Node* newNode = new Node{v, weight, adj[u]};
        adj[u] = newNode;
    }
    
    Node** getAdj() const { return adj; }
    int getNumVertices() const { return numVertices; }
    
    // Prevent copying
    graph(const graph&) = delete;
    graph& operator=(const graph&) = delete;
};

#endif
