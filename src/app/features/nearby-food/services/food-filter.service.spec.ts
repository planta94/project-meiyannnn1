import { TestBed } from '@angular/core/testing';
import { FoodFilterService } from './food-filter.service';

describe('FoodFilterService', () => {
  let service: FoodFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isPandanRelated', () => {
    it('should return true for exact matches', () => {
      expect(service.isPandanRelated('pandan')).toBe(true);
      expect(service.isPandanRelated('onde onde')).toBe(true);
      expect(service.isPandanRelated('kuih')).toBe(true);
    });

    it('should return true for case-insensitive matches', () => {
      expect(service.isPandanRelated('PANDAN CAKE')).toBe(true);
      expect(service.isPandanRelated('Onde-Onde')).toBe(true);
    });

    it('should return false for unrelated text', () => {
      expect(service.isPandanRelated('chocolate cake')).toBe(false);
      expect(service.isPandanRelated('fried rice')).toBe(false);
    });

    it('should return false for empty or null text', () => {
      expect(service.isPandanRelated('')).toBe(false);
      expect(service.isPandanRelated(null as any)).toBe(false);
    });
  });

  describe('filterPandanPlaces', () => {
    it('should filter places containing pandan keywords', () => {
      const places = [
        { name: 'Pandan Chiffon Bakery' },
        { name: 'Joe Coffee Shop' },
        { name: 'Nyonya Kuih Corner' }
      ];

      const filtered = service.filterPandanPlaces(places);
      expect(filtered.length).toBe(2);
      expect(filtered[0].name).toBe('Pandan Chiffon Bakery');
      expect(filtered[1].name).toBe('Nyonya Kuih Corner');
    });

    it('should return empty array for empty input', () => {
        expect(service.filterPandanPlaces([])).toEqual([]);
        expect(service.filterPandanPlaces(null as any)).toEqual([]);
    });
  });

  describe('removeDuplicates', () => {
     it('should remove places with duplicate IDs', () => {
         const places = [
             { id: '1', name: 'Place 1' },
             { place_id: '1', name: 'Place 1 (duplicate)' },
             { id: '2', name: 'Place 2' }
         ];

         const unique = service.removeDuplicates(places);
         expect(unique.length).toBe(2);
         expect(unique[0].name).toBe('Place 1');
         expect(unique[1].name).toBe('Place 2');
     });
  });
});
