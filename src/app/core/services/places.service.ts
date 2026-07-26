import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesService: any;
  private isApiLoaded = false;
  private mapInstance: any;

  constructor() {}

  async loadGoogleMaps(): Promise<void> {
    if (this.isApiLoaded) return;

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            clearInterval(check);
            this.isApiLoaded = true;
            resolve();
          }
        }, 100);
      });
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isApiLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.body.appendChild(script);
    });
  }

  initService(mapElement?: HTMLElement): void {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
       throw new Error('Google Maps API not loaded');
    }

    if (mapElement) {
        this.mapInstance = new google.maps.Map(mapElement, {
            center: { lat: 0, lng: 0 },
            zoom: 15
        });
        this.placesService = new google.maps.places.PlacesService(this.mapInstance);
    } else {
        const div = document.createElement('div');
        this.placesService = new google.maps.places.PlacesService(div);
    }
  }

  searchNearby(lat: number, lng: number, radius: number, keyword: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('PlacesService not initialized'));
        return;
      }

      const location = new google.maps.LatLng(lat, lng);

      const request = {
        location: location,
        radius: radius,
        keyword: keyword,
        type: ['restaurant', 'cafe', 'bakery']
      };

      this.placesService.nearbySearch(request, (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Places API failed with status: ${status}`));
        }
      });
    });
  }

  getPlaceDetails(placeId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('PlacesService not initialized'));
        return;
      }

      const request = {
        placeId: placeId,
        fields: ['name', 'rating', 'user_ratings_total', 'formatted_address', 'photos', 'opening_hours', 'url', 'geometry']
      };

      this.placesService.getDetails(request, (place: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place Details API failed with status: ${status}`));
        }
      });
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
     if (typeof google !== 'undefined' && google.maps && google.maps.geometry) {
         const p1 = new google.maps.LatLng(lat1, lng1);
         const p2 = new google.maps.LatLng(lat2, lng2);
         return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
     } else {
         const R = 6371e3; // metres
         const φ1 = lat1 * Math.PI/180;
         const φ2 = lat2 * Math.PI/180;
         const Δφ = (lat2-lat1) * Math.PI/180;
         const Δλ = (lng2-lng1) * Math.PI/180;

         const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                   Math.cos(φ1) * Math.cos(φ2) *
                   Math.sin(Δλ/2) * Math.sin(Δλ/2);
         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

         return R * c;
     }
  }
}
