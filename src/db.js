// src/db.js
export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("PolicyDB", 2); // Incremented version

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("policies")) {
                const store = db.createObjectStore("policies", { keyPath: "id" });
                store.createIndex("by_status", "status", { unique: false });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject(`IndexedDB error: ${event.target.error}`);
        };
    });
}

export function savePolicy(policy) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction("policies", "readwrite");
            const store = transaction.objectStore("policies");
            
            const request = store.put(policy);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
}

export function getPolicies() {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction("policies", "readonly");
            const store = transaction.objectStore("policies");
            const index = store.index("by_status");
            
            const request = index.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
}