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
    };

    it('should return location when permission granted', async () => {
      // Mock global navigator properly
      Object.defineProperty(window, 'navigator', {
        value: {
          geolocation: {
             getCurrentPosition: jest.fn().mockImplementationOnce((success) => success(mockPosition))
          }
        },
        writable: true
      });

      const result = await service.getCurrentLocation();
      expect(result).toEqual(mockPosition);
    });

    it('should reject when permission denied', async () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          geolocation: {
             // Mock GeolocationPositionError constants
             getCurrentPosition: jest.fn().mockImplementationOnce((success, error) => error({
                 code: 1,
                 PERMISSION_DENIED: 1,
                 POSITION_UNAVAILABLE: 2,
                 TIMEOUT: 3
             }))
          }
        },
        writable: true
      });

      await expect(service.getCurrentLocation()).rejects.toThrow('Location permission denied. Please enable location.');
    });

    it('should reject when geolocation is not supported', async () => {
        Object.defineProperty(window, 'navigator', {
            value: {},
            writable: true
        });
        await expect(service.getCurrentLocation()).rejects.toThrow('Geolocation is not supported by your browser.');
    });
  });
});
