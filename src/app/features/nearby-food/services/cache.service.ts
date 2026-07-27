import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, { timestamp: number; data: any }>();
  // 24 hours persistent cache (24 * 60 * 60 * 1000 ms) to minimize API quota costs
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
  // Versioned storage prefix to automatically invalidate old malformed cache entries
  private readonly STORAGE_PREFIX = 'pandan_cache_v2_';

  constructor() {
    this.restoreFromStorage();
  }

  private generateKey(lat: number, lng: number, radius: number, keyword: string): string {
    // Round to 3 decimal places (~100m grid precision) to maximize cache hits
    return `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}_${keyword.toLowerCase()}`;
  }

  private restoreFromStorage(): void {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Clean up old v1 cache keys
          if (key.startsWith('pandan_cache_v1_')) {
            keysToRemove.push(key);
            continue;
          }

          if (key.startsWith(this.STORAGE_PREFIX)) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const item = JSON.parse(raw);
              if (Date.now() - item.timestamp < this.CACHE_DURATION_MS) {
                // Verify cached places have valid non-zero coordinates
                const isValidData = Array.isArray(item.data) && item.data.length > 0 &&
                  item.data.some((p: any) => (p.lat && p.lat !== 0) || (typeof p.geometry?.location?.lat === 'function'));

                if (isValidData) {
                  const memoryKey = key.replace(this.STORAGE_PREFIX, '');
                  this.cache.set(memoryKey, item);
                } else {
                  keysToRemove.push(key);
                }
              } else {
                keysToRemove.push(key);
              }
            }
          }
        }
      }

      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      // Ignore storage errors
    }
  }

  set(lat: number, lng: number, radius: number, keyword: string, data: any): void {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    const key = this.generateKey(lat, lng, radius, keyword);
    const item = {
      timestamp: Date.now(),
      data
    };

    this.cache.set(key, item);

    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      // Storage quota or restriction
    }
  }

  get(lat: number, lng: number, radius: number, keyword: string): any | null {
    const key = this.generateKey(lat, lng, radius, keyword);
    const cachedItem = this.cache.get(key);

    if (cachedItem) {
      if (Date.now() - cachedItem.timestamp < this.CACHE_DURATION_MS) {
        return cachedItem.data;
      } else {
        this.cache.delete(key);
        try {
          localStorage.removeItem(this.STORAGE_PREFIX + key);
        } catch (e) {
          // ignore storage error
        }
      }
    }
    return null;
  }

  clear(): void {
    this.cache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(this.STORAGE_PREFIX) || key.startsWith('pandan_cache_v1_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      // ignore storage error
    }
  }
}
