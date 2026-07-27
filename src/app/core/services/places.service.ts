import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare let google: any;

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesService: any;
  private isApiLoaded = false;
  private mapInstance: any;

  constructor() {}

  async loadGoogleMaps(): Promise<void> {
    if (this.isApiLoaded && typeof google !== 'undefined' && google.maps && typeof google.maps.Map === 'function') return;

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && typeof google.maps.Map === 'function') {
            clearInterval(check);
            this.isApiLoaded = true;
            resolve();
          }
        }, 50);
      });
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places,geometry,marker&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const checkMap = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && typeof google.maps.Map === 'function') {
            clearInterval(checkMap);
            this.isApiLoaded = true;
            resolve();
          }
        }, 50);
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

    if (mapElement && typeof google.maps.Map === 'function') {
      this.mapInstance = new google.maps.Map(mapElement, {
        center: { lat: 0, lng: 0 },
        zoom: 15
      });
    }

    // Only instantiate legacy PlacesService if modern google.maps.places.Place is NOT available
    if (!google.maps.places.Place && google.maps.places.PlacesService) {
      try {
        const target = mapElement ? this.mapInstance : document.createElement('div');
        this.placesService = new google.maps.places.PlacesService(target);
      } catch (e) {
        // Suppress legacy init notice
      }
    }
  }

  async searchNearby(lat: number, lng: number, radius: number, keyword: string): Promise<any[]> {
    // 1. Modern Google Maps New Places API (google.maps.places.Place.searchByText / searchNearby)
    if (typeof google !== 'undefined' && google.maps?.places?.Place?.searchByText) {
      try {
        const request = {
          textQuery: `${keyword} food`,
          locationBias: {
            center: { lat, lng },
            radius: radius
          },
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount', 'photos', 'regularOpeningHours'],
          maxResultCount: 20
        };

        const { places } = await google.maps.places.Place.searchByText(request);
        if (places && places.length > 0) {
          return places.map((p: any) => {
            const latNum = typeof p.location?.lat === 'function' ? p.location.lat() : (p.location?.lat || 0);
            const lngNum = typeof p.location?.lng === 'function' ? p.location.lng() : (p.location?.lng || 0);

            let photoUrls: string[] = [];
            if (p.photos && Array.isArray(p.photos)) {
              photoUrls = p.photos.map((photo: any) => {
                if (typeof photo === 'string') return photo;
                if (typeof photo.getURI === 'function') return photo.getURI();
                return photo.uri || '';
              }).filter(Boolean);
            }

            return {
              place_id: p.id,
              name: p.displayName || p.name,
              rating: p.rating,
              user_ratings_total: p.userRatingCount,
              vicinity: p.formattedAddress,
              lat: latNum,
              lng: lngNum,
              geometry: {
                location: {
                  lat: () => latNum,
                  lng: () => lngNum
                }
              },
              openNow: p.regularOpeningHours?.isOpen?.() ?? true,
              photoUrls: photoUrls
            };
          });
        }
        return [];
      } catch (err) {
        console.warn('New Places API search notice:', err);
      }
    }

    // 2. Legacy fallback to PlacesService ONLY if needed
    return new Promise((resolve) => {
      if (!this.placesService && typeof google !== 'undefined' && google.maps?.places?.PlacesService && !google.maps?.places?.Place) {
        try {
          const div = document.createElement('div');
          this.placesService = new google.maps.places.PlacesService(div);
        } catch (e) {
          // ignore initialization failure
        }
      }

      if (!this.placesService) {
        resolve([]);
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
        if (status === google.maps.places.PlacesServiceStatus?.OK) {
          resolve(results || []);
        } else {
          resolve([]);
        }
      });
    });
  }

  getPlaceDetails(placeId: string): Promise<any> {
    if (typeof google !== 'undefined' && google.maps?.places?.Place) {
      try {
        const place = new google.maps.places.Place({ id: placeId });
        return place.fetchFields({
          fields: ['displayName', 'rating', 'userRatingCount', 'formattedAddress', 'photos', 'regularOpeningHours', 'location']
        });
      } catch (e) {
        // ignore fetch failure
      }
    }

    return new Promise((resolve) => {
      if (!this.placesService) {
        resolve(null);
        return;
      }

      const request = {
        placeId: placeId,
        fields: ['name', 'rating', 'user_ratings_total', 'formatted_address', 'photos', 'opening_hours', 'url', 'geometry']
      };

      this.placesService.getDetails(request, (place: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus?.OK) {
          resolve(place);
        } else {
          resolve(null);
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
