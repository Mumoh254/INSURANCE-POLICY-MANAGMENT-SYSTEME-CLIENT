import { savePolicy, getPolicies } from "./db.js";

async function fetchPoliciesFromServer() {
    if (navigator.onLine) {
        try {
            let response = await fetch("https://api.example.com/policies");
            let policies = await response.json();
            for (let policy of policies) {
                await savePolicy(policy);
            }
        } catch (error) {
            console.error("Failed to fetch policies:", error);
        }
    }
}

async function loadPolicies() {
    await fetchPoliciesFromServer();
    let policies = await getPolicies();
    console.log("Loaded Policies:", policies);
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadPolicies);
