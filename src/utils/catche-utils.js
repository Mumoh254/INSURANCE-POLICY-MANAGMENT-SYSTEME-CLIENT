// src/utils/cache-utils.js
export const cache = {
    set: (key, data) => {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    },
    
    get: (key, maxAge = 3600000) => {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { data, timestamp } = JSON.parse(item);
      return (Date.now() - timestamp < maxAge) ? data : null;
    }
  };
  
  export async function getCachedData(url) {
    const cached = cache.get(url);
    if (cached) return cached;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      cache.set(url, data);
      return data;
    } catch (error) {
      return cached || null;
    }
  }