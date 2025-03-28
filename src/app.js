// src/app.js
import { savePolicy, getPolicies } from './db.js';

// Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .then(registration => {
                console.log("SW registered:", registration);
            })
            .catch(error => {
                console.log("SW registration failed:", error);
            });
    });
}

async function fetchPoliciesFromServer() {
    try {
        const response = await fetch("/api/policies");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const policies = await response.json();
        const savePromises = policies.map(policy => savePolicy(policy));
        
        await Promise.all(savePromises);
        return policies;
    } catch (error) {
        console.error("Fetch error:", error);
        return getPolicies(); // Fallback to cached data
    }
}

async function loadPolicies() {
    try {
        const policies = await fetchPoliciesFromServer();
        renderPolicies(policies);
        setupSync();
    } catch (error) {
        console.error("Load error:", error);
        renderError();
    }
}

function renderPolicies(policies) {
    // Implementation depends on your UI framework
    console.log("Rendering policies:", policies);
}

function setupSync() {
    if ("sync" in navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(registration => {
            registration.sync.register("sync-policies");
        });
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadPolicies();
    setupNetworkListeners();
});

function setupNetworkListeners() {
    window.addEventListener("online", () => {
        loadPolicies();
        showNetworkStatus("Connected");
    });

    window.addEventListener("offline", () => {
        showNetworkStatus("Offline - using cached data");
    });
}

function showNetworkStatus(message) {
    // Update your UI with network status
    console.log(message);
}