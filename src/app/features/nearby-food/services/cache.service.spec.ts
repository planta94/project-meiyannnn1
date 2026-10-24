import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  const STORAGE_PREFIX = 'pandan_cache_v2_';

  const mockPlaces = [
    {
      id: 'place_1',
      name: 'Pandan Bakery',
      lat: 3.139,
      lng: 101.686
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set and get', () => {
    it('should store and retrieve places using 3-decimal grid precision', () => {
      service.set(3.13912, 101.68645, 1000, 'Pandan', mockPlaces);

      // Same coordinates rounded to 3 decimals
      const cached = service.get(3.13949, 101.68611, 1000, 'pandan');
      expect(cached).toEqual(mockPlaces);
    });

    it('should return null for cache miss', () => {
      const result = service.get(1.0, 1.0, 500, 'cake');
      expect(result).toBeNull();
    });

    it('should ignore setting null, empty or non-array data', () => {
      service.set(3.139, 101.686, 1000, 'empty', []);
      expect(service.get(3.139, 101.686, 1000, 'empty')).toBeNull();

      service.set(3.139, 101.686, 1000, 'null', null as any);
      expect(service.get(3.139, 101.686, 1000, 'null')).toBeNull();
    });

    it('should expire and remove items older than 24 hours', () => {
      const lat = 3.14;
      const lng = 101.69;
      const radius = 1000;
      const keyword = 'pandan';

      service.set(lat, lng, radius, keyword, mockPlaces);

      // Artificially age the timestamp in memory
      const key = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}_${keyword.toLowerCase()}`;
      const item = (service as any).cache.get(key);
      item.timestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago

      const result = service.get(lat, lng, radius, keyword);
      expect(result).toBeNull();
      expect(localStorage.getItem(STORAGE_PREFIX + key)).toBeNull();
    });

    it('should handle localStorage setItem quota exception gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceeded');
      expect(() => {
        service.set(3.139, 101.686, 1000, 'pandan', mockPlaces);
      }).not.toThrow();

      // Memory cache should still work
      expect(service.get(3.139, 101.686, 1000, 'pandan')).toEqual(mockPlaces);
    });
  });

  describe('restoreFromStorage and invalidation', () => {
    it('should restore valid cache items from localStorage on initialization', () => {
      const lat = 3.123;
      const lng = 101.456;
      const radius = 1000;
      const keyword = 'kuih';
      const key = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}_${keyword}`;

      const validPayload = {
        timestamp: Date.now(),
        data: [{ id: 'p1', lat: 3.123, lng: 101.456 }]
      };

      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(validPayload));

      const restoredService = new CacheService();
      expect(restoredService.get(lat, lng, radius, keyword)).toEqual(validPayload.data);
    });

    it('should clean up legacy v1 cache keys on initialization', () => {
      localStorage.setItem('pandan_cache_v1_legacy_key', 'legacy_data');
      const restoredService = new CacheService();
      expect(restoredService).toBeTruthy();
      expect(localStorage.getItem('pandan_cache_v1_legacy_key')).toBeNull();
    });

    it('should remove malformed or zero-coordinate items on initialization', () => {
      const key = `${(3.0).toFixed(3)}_${(101.0).toFixed(3)}_1000_bad`;
      const badPayload = {
        timestamp: Date.now(),
        data: [{ id: 'bad', lat: 0, lng: 0 }]
      };
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(badPayload));

      const restoredService = new CacheService();
      expect(restoredService.get(3.0, 101.0, 1000, 'bad')).toBeNull();
      expect(localStorage.getItem(STORAGE_PREFIX + key)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should wipe memory cache and localStorage entries', () => {
      service.set(3.139, 101.686, 1000, 'pandan', mockPlaces);
      localStorage.setItem('pandan_cache_v1_old', 'old');

      service.clear();

      expect(service.get(3.139, 101.686, 1000, 'pandan')).toBeNull();
      expect(localStorage.getItem('pandan_cache_v1_old')).toBeNull();
    });
  });
});
