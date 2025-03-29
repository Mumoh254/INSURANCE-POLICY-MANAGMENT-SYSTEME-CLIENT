// src/db.js (updated for user data)
export function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("AppDB", 3);
  
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains("policies")) {
          const policyStore = db.createObjectStore("policies", { keyPath: "id" });
          policyStore.createIndex("by_status", "status");
        }
        
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" });
          userStore.createIndex("by_email", "email", { unique: true });
        }
      };
  
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
  
  // Generic save function
  export async function saveData(storeName, data) {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    await store.put(data);
    return new Promise(resolve => transaction.oncomplete = resolve);
  }
  
  // Generic get all function
  export async function getAllData(storeName) {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }