import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, { timestamp: number; data: any }>();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  private generateKey(lat: number, lng: number, radius: number, keyword: string): string {
    return `${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}_${keyword.toLowerCase()}`;
  }

  set(lat: number, lng: number, radius: number, keyword: string, data: any): void {
    const key = this.generateKey(lat, lng, radius, keyword);
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  get(lat: number, lng: number, radius: number, keyword: string): any | null {
    const key = this.generateKey(lat, lng, radius, keyword);
    const cachedItem = this.cache.get(key);

    if (cachedItem) {
      if (Date.now() - cachedItem.timestamp < this.CACHE_DURATION_MS) {
        return cachedItem.data;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  clear(): void {
    this.cache.clear();
  }
}
