import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() {}

  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Location permission denied. Please enable location.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable.'));
                break;
              case error.TIMEOUT:
                reject(new Error('The request to get user location timed out.'));
                break;
              default:
                reject(new Error('An unknown error occurred.'));
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    });
  }

  watchLocation(successCallback: PositionCallback, errorCallback?: PositionErrorCallback): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported.');
    }
    return navigator.geolocation.watchPosition(successCallback, errorCallback);
  }

  stopWatching(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}
