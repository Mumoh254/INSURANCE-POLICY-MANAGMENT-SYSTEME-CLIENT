export function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("PolicyDB", 1);

        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("policies")) {
                db.createObjectStore("policies", { keyPath: "id" });
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

export async function savePolicy(policy) {
    let db = await openDB();
    let transaction = db.transaction("policies", "readwrite");
    let store = transaction.objectStore("policies");
    store.put(policy);
}

export async function getPolicies() {
    let db = await openDB();
    let transaction = db.transaction("policies", "readonly");
    let store = transaction.objectStore("policies");
    return new Promise((resolve, reject) => {
        let request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
