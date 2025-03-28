// src/app.js
class OfflineUI {
    constructor() {
      this.offlineBanner = document.createElement('div');
      this.offlineBanner.className = 'offline-banner';
      this.offlineBanner.textContent = 'You are offline - using cached data';
      document.body.prepend(this.offlineBanner);
      
      window.addEventListener('online', () => this.updateStatus());
      window.addEventListener('offline', () => this.updateStatus());
      this.updateStatus();
    }
  
    updateStatus() {
      this.offlineBanner.style.display = navigator.onLine ? 'none' : 'block';
    }
  }
  
  // Initialize early in your app
  const offlineUI = new OfflineUI();
  
  async function fetchPoliciesFromServer() {
    try {
      if (!navigator.onLine) {
        throw new Error('Offline - using cached data');
      }
  
      const response = await fetch('/api/policies');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const policies = await response.json();
      await savePolicies(policies);
      return policies;
    } catch (error) {
      console.error(error.message);
      return getPolicies(); // Fallback to cached data
    }
  }
  
  async function loadPageData() {
    try {
      const policies = await fetchPoliciesFromServer();
      renderPolicies(policies);
    } catch (error) {
      showErrorPage();
    }
  }
  
  function showErrorPage() {
    if (!navigator.onLine) {
      window.location.href = '/offline.html';
    }
  }
  
  // Handle page navigation
  document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && !navigator.onLine) {
      event.preventDefault();
      alert('You are offline - please stay on this page');
    }
  });
  
  // Initialize app
  document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.error('SW registration failed:', err));
    }
  
    loadPageData();
  });