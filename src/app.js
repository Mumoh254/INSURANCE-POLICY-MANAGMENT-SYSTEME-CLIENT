class OfflineNotifier {
  constructor() {
    this.toast = document.createElement('div');
    this.toast.className = 'offline-toast hidden';
    document.body.appendChild(this.toast);
    
    window.addEventListener('online', () => this.hide());
    window.addEventListener('offline', () => this.show());
    this.checkStatus();
  }

  checkStatus() {
    navigator.onLine ? this.hide() : this.show();
  }

  show() {
    this.toast.textContent = 'You are currently offline';
    this.toast.classList.remove('hidden');
    setTimeout(() => this.hide(), 3000);
  }

  hide() {
    this.toast.classList.add('hidden');
  }
}

// Initialize
new OfflineNotifier();