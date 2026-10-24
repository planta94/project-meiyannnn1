import { TestBed } from '@angular/core/testing';
import { PlacesService } from './places.service';

declare let window: any;

describe('PlacesService', () => {
  let service: PlacesService;
  let originalGoogle: any;

  beforeEach(() => {
    originalGoogle = (window as any).google;
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlacesService);
  });

  afterEach(() => {
    (window as any).google = originalGoogle;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateDistance', () => {
    it('should use Haversine fallback formula when google.maps.geometry is absent', () => {
      (window as any).google = undefined;

      // Two points ~1.11km apart (0.01 deg latitude delta)
      const distance = service.calculateDistance(3.139, 101.686, 3.149, 101.686);
      expect(Math.round(distance)).toBeCloseTo(1112, -2);
    });

    it('should use google.maps.geometry.spherical.computeDistanceBetween when available', () => {
      const mockComputeDistance = jasmine.createSpy('computeDistanceBetween').and.returnValue(850);
      (window as any).google = {
        maps: {
          LatLng: function (this: any, lat: number, lng: number) {
            this.lat = lat;
            this.lng = lng;
          },
          geometry: {
            spherical: {
              computeDistanceBetween: mockComputeDistance
            }
          }
        }
      };

      const distance = service.calculateDistance(3.139, 101.686, 3.145, 101.690);
      expect(distance).toBe(850);
      expect(mockComputeDistance).toHaveBeenCalled();
    });
  });

  describe('initService', () => {
    it('should throw an error if Google Maps API is not loaded', () => {
      (window as any).google = undefined;
      expect(() => service.initService()).toThrowError('Google Maps API not loaded');
    });

    it('should instantiate Map when mapElement is provided', () => {
      const mockMap = jasmine.createSpy('Map');
      (window as any).google = {
        maps: {
          Map: mockMap,
          places: {
            Place: {}
          }
        }
      };

      const dummyEl = document.createElement('div');
      service.initService(dummyEl);
      expect(mockMap).toHaveBeenCalled();
    });

    it('should initialize legacy PlacesService when Place class is absent', () => {
      const mockPlacesService = jasmine.createSpy('PlacesService');
      (window as any).google = {
        maps: {
          places: {
            PlacesService: mockPlacesService
          }
        }
      };

      service.initService();
      expect(mockPlacesService).toHaveBeenCalled();
    });
  });

  describe('searchNearby', () => {
    it('should use modern google.maps.places.Place.searchByText when available', async () => {
      const mockResults = [
        {
          id: 'place_modern_1',
          displayName: 'Pandan Garden Cafe',
          formattedAddress: '123 Pandan Street',
          rating: 4.8,
          userRatingCount: 120,
          location: {
            lat: () => 3.14,
            lng: () => 101.69
          },
          photos: [
            { getURI: () => 'https://example.com/photo1.jpg' }
          ],
          regularOpeningHours: {
            isOpen: () => true
          }
        }
      ];

      (window as any).google = {
        maps: {
          places: {
            Place: {
              searchByText: jasmine.createSpy('searchByText').and.resolveTo({ places: mockResults })
            }
          }
        }
      };

      const results = await service.searchNearby(3.14, 101.69, 1000, 'pandan');
      expect(results.length).toBe(1);
      expect(results[0].place_id).toBe('place_modern_1');
      expect(results[0].name).toBe('Pandan Garden Cafe');
      expect(results[0].openNow).toBe(true);
      expect(results[0].photoUrls).toEqual(['https://example.com/photo1.jpg']);
      expect(results[0].lat).toBe(3.14);
      expect(results[0].lng).toBe(101.69);
    });

    it('should fallback to legacy PlacesService.nearbySearch if Place is absent', async () => {
      const mockLegacyResults = [
        {
          place_id: 'legacy_1',
          name: 'Old Town Pandan'
        }
      ];

      const mockLegacyService = {
        nearbySearch: jasmine.createSpy('nearbySearch').and.callFake((_req: any, cb: any) => {
          cb(mockLegacyResults, 'OK');
        })
      };

      (window as any).google = {
        maps: {
          LatLng: function (this: any, lat: number, lng: number) {
            this.lat = lat;
            this.lng = lng;
          },
          places: {
            PlacesServiceStatus: { OK: 'OK' }
          }
        }
      };

      (service as any).placesService = mockLegacyService;

      const results = await service.searchNearby(3.14, 101.69, 1000, 'pandan');
      expect(results).toEqual(mockLegacyResults);
      expect(mockLegacyService.nearbySearch).toHaveBeenCalled();
    });

    it('should return empty array if no service is available', async () => {
      (window as any).google = undefined;
      (service as any).placesService = null;

      const results = await service.searchNearby(3.14, 101.69, 1000, 'pandan');
      expect(results).toEqual([]);
    });
  });

  describe('getPlaceDetails', () => {
    it('should use modern Place.fetchFields when Place is defined', async () => {
      const mockDetails = {
        displayName: 'Pandan Chiffon Specialist',
        rating: 4.9
      };

      const mockFetchFields = jasmine.createSpy('fetchFields').and.resolveTo(mockDetails);
      (window as any).google = {
        maps: {
          places: {
            Place: function (this: any, { id }: any) {
              this.id = id;
              this.fetchFields = mockFetchFields;
            }
          }
        }
      };

      const details = await service.getPlaceDetails('p123');
      expect(details).toEqual(mockDetails);
      expect(mockFetchFields).toHaveBeenCalled();
    });

    it('should return null when legacy service fails or returns null', async () => {
      (window as any).google = {
        maps: {
          places: {
            PlacesServiceStatus: { OK: 'OK' }
          }
        }
      };

      (service as any).placesService = {
        getDetails: jasmine.createSpy('getDetails').and.callFake((_req: any, cb: any) => {
          cb(null, 'ERROR');
        })
      };

      const result = await service.getPlaceDetails('bad_id');
      expect(result).toBeNull();
    });
  });

  describe('loadGoogleMaps', () => {
    it('should resolve immediately if Google Maps is already loaded', async () => {
      (service as any).isApiLoaded = true;
      (window as any).google = {
        maps: {
          Map: function () {}
        }
      };

      await expectAsync(service.loadGoogleMaps()).toBeResolved();
    });
  });
});
