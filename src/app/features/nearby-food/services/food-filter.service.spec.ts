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

  describe('isPlaceOpenNow', () => {
    it('should return undefined for missing opening hours data', () => {
      expect(service.isPlaceOpenNow(null)).toBeUndefined();
      expect(service.isPlaceOpenNow(undefined)).toBeUndefined();
      expect(service.isPlaceOpenNow({})).toBeUndefined();
    });

    it('should call live isOpen method if available', () => {
      const mockOpeningHours = { isOpen: () => true };
      expect(service.isPlaceOpenNow(mockOpeningHours)).toBe(true);

      const mockClosed = { isOpen: () => false };
      expect(service.isPlaceOpenNow(mockClosed)).toBe(false);
    });

    it('should return true for 24-hour places', () => {
      const mock24h = {
        periods: [{ open: { day: 0, hour: 0, minute: 0 } }]
      };
      expect(service.isPlaceOpenNow(mock24h)).toBe(true);
    });

    it('should dynamically evaluate open status against specified date/time', () => {
      // Thursday (day 4), 09:00 - 22:00
      const mockHours = {
        periods: [
          { open: { day: 4, hour: 9, minute: 0 }, close: { day: 4, hour: 22, minute: 0 } }
        ]
      };

      // Thursday 2:00 PM (14:00) -> Open
      const daytime = new Date(2026, 6, 30, 14, 0, 0); // 2026-07-30 is Thursday (day 4)
      expect(service.isPlaceOpenNow(mockHours, daytime)).toBe(true);

      // Thursday 11:00 PM (23:00) -> Closed
      const nighttime = new Date(2026, 6, 30, 23, 0, 0);
      expect(service.isPlaceOpenNow(mockHours, nighttime)).toBe(false);
    });

    it('should handle direct boolean openNow and open_now flags', () => {
      expect(service.isPlaceOpenNow({ openNow: true })).toBe(true);
      expect(service.isPlaceOpenNow({ open_now: false })).toBe(false);
      expect(service.isPlaceOpenNow(true)).toBe(true);
    });

    it('should parse weekday text schedule with Unicode spaces and dashes', () => {
      const Thursday = new Date(2026, 6, 30, 10, 0, 0); // Thursday 10:00 AM
      const weekdayTextData = [
        "Monday: 5:00 AM – 6:00 PM",
        "Tuesday: 5:00 AM – 6:00 PM",
        "Wednesday: 5:00 AM – 6:00 PM",
        "Thursday: 5:00 AM – 6:00 PM",
        "Friday: 5:00 AM – 6:00 PM",
        "Saturday: 5:00 AM – 6:00 PM",
        "Sunday: 5:00 AM – 6:00 PM"
      ];

      expect(service.isPlaceOpenNow(weekdayTextData, Thursday)).toBe(true);

      const ThursdayNight = new Date(2026, 6, 30, 20, 0, 0); // Thursday 8:00 PM
      expect(service.isPlaceOpenNow(weekdayTextData, ThursdayNight)).toBe(false);
    });

    it('should parse closed status from weekday text schedule', () => {
      const Monday = new Date(2026, 6, 27, 10, 0, 0); // Monday 10:00 AM
      const closedMondaySchedule = [
        "Monday: Closed",
        "Tuesday: 7:00 AM – 5:00 PM",
        "Wednesday: 7:00 AM – 5:00 PM"
      ];

      expect(service.isPlaceOpenNow(closedMondaySchedule, Monday)).toBe(false);
    });

    it('should handle raw array Google Places responses with periods and weekday text', () => {
      const Thursday10am = new Date(2026, 6, 30, 10, 0, 0);
      const rawGoogleArray = [
        1,
        [
          [ [0, 5, 0], [0, 18, 0] ],
          [ [1, 5, 0], [1, 18, 0] ],
          [ [2, 5, 0], [2, 18, 0] ],
          [ [3, 5, 0], [3, 18, 0] ],
          [ [4, 5, 0], [4, 18, 0] ],
          [ [5, 5, 0], [5, 18, 0] ],
          [ [6, 5, 0], [6, 18, 0] ]
        ],
        [
          "Monday: 5:00 AM – 6:00 PM",
          "Tuesday: 5:00 AM – 6:00 PM",
          "Wednesday: 5:00 AM – 6:00 PM",
          "Thursday: 5:00 AM – 6:00 PM",
          "Friday: 5:00 AM – 6:00 PM",
          "Saturday: 5:00 AM – 6:00 PM",
          "Sunday: 5:00 AM – 6:00 PM"
        ]
      ];

      expect(service.isPlaceOpenNow(rawGoogleArray, Thursday10am)).toBe(true);
    });
  });
});

