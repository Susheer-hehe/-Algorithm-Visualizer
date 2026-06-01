#ifndef PRIORITY_QUEUE_H
#define PRIORITY_QUEUE_H

#include <iostream>

struct PQNode {
    int vertex;
    int distance;
};

// Custom Min-Heap based Priority Queue for Dijkstra's
class PriorityQueue {
private:
    PQNode* heap;
    int capacity;
    int size;

    void swap(PQNode& a, PQNode& b) {
        PQNode temp = a;
        a = b;
        b = temp;
    }

    void heapifyUp(int index) {
        if (index == 0) return;
        int parent = (index - 1) / 2;
        if (heap[index].distance < heap[parent].distance) {
            swap(heap[index], heap[parent]);
            heapifyUp(parent);
        }
    }

    void heapifyDown(int index) {
        int smallest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;

        if (left < size && heap[left].distance < heap[smallest].distance) {
            smallest = left;
        }
        if (right < size && heap[right].distance < heap[smallest].distance) {
            smallest = right;
        }

        if (smallest != index) {
            swap(heap[index], heap[smallest]);
            heapifyDown(smallest);
        }
    }

public:
    PriorityQueue(int cap = 10000) {
        capacity = cap;
        size = 0;
        heap = new PQNode[capacity];
    }

    ~PriorityQueue() {
        delete[] heap;
    }

    bool isEmpty() {
        return size == 0;
    }

    void push(int v, int dist) {
        if (size == capacity) return;
        heap[size] = {v, dist};
        heapifyUp(size);
        size++;
    }

    PQNode pop() {
        if (isEmpty()) return {-1, -1};
        PQNode root = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapifyDown(0);
        return root;
    }
    
    PriorityQueue(const PriorityQueue&) = delete;
    PriorityQueue& operator=(const PriorityQueue&) = delete;
};

#endif
