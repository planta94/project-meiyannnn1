import { TestBed } from '@angular/core/testing';
import { GeolocationService } from './geolocation.service';

describe('GeolocationService', () => {
  let service: GeolocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentLocation', () => {
    const mockPosition = {
      coords: {
        latitude: 3.14,
        longitude: 101.69,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 1234567890,
    } as unknown as GeolocationPosition;

    it('should return location when permission granted', async () => {
      const mockGeolocation = {
        getCurrentPosition: (success: PositionCallback) => success(mockPosition)
      };

      Object.defineProperty(window.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
        writable: true
      });

      const result = await service.getCurrentLocation();
      expect(result).toEqual(mockPosition);
    });

    it('should reject when permission denied', async () => {
      const mockError = {
        code: 1,
        message: 'User denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      const mockGeolocation = {
        getCurrentPosition: (_success: PositionCallback, errorCallback?: PositionErrorCallback) => {
          if (errorCallback) errorCallback(mockError as unknown as GeolocationPositionError);
        }
      };

      Object.defineProperty(window.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
        writable: true
      });

      try {
        await service.getCurrentLocation();
        fail('Should have rejected');
      } catch (err: any) {
        expect(err.message).toBe('Location permission denied. Please enable location.');
      }
    });

    it('should reject when geolocation is not supported', async () => {
      Object.defineProperty(window.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
        writable: true
      });

      try {
        await service.getCurrentLocation();
        fail('Should have rejected');
      } catch (err: any) {
        expect(err.message).toBe('Geolocation is not supported by your browser.');
      }
    });
  });
});
