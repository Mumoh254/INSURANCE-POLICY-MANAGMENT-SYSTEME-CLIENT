// src/app.js
class OfflineUI {
  constructor() {
    this.modalTimeout = null;
    this.setupOfflineDetection();
  }

  setupOfflineDetection() {
    window.addEventListener('online', () => this.hideModal());
    window.addEventListener('offline', () => this.showModal());
    if (!navigator.onLine) this.showModal();
  }

  showModal() {
    const modal = document.createElement('div');
    modal.className = 'offline-modal';
    modal.textContent = 'You are offline - using cached data';
    document.body.appendChild(modal);
    
    this.modalTimeout = setTimeout(() => {
      modal.remove();
    }, 3000);
  }

  hideModal() {
    clearTimeout(this.modalTimeout);
    document.querySelectorAll('.offline-modal').forEach(el => el.remove());
  }
}

// Initialize early
const offlineUI = new OfflineUI();

async function fetchAllData() {
  try {
    if (!navigator.onLine) {
      return {
        policies: await getAllData('policies'),
        users: await getAllData('users')
      };
    }

    const [policiesRes, usersRes] = await Promise.all([
      fetch('/api/policies'),
      fetch('/api/users')
    ]);

    const [policies, users] = await Promise.all([
      policiesRes.json(),
      usersRes.json()
    ]);

    await Promise.all([
      saveData('policies', policies),
      saveData('users', users)
    ]);

    return { policies, users };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      policies: await getAllData('policies'),
      users: await getAllData('users')
    };
  }
}

async function loadPageData() {
  try {
    const { policies, users } = await fetchAllData();
    renderContent(policies, users);
  } catch (error) {
    if (!navigator.onLine) {
      window.location.href = '/offline.html';
    } else {
      showError('Failed to load data');
    }
  }
}

// Handle navigation
window.addEventListener('popstate', loadPageData);
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    e.preventDefault();
    window.history.pushState(null, '', e.target.href);
    loadPageData();
  }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  }

  // Initial load
  loadPageData();
});