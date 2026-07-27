import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Place } from '../../../../shared/models/place';

declare let google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class MapComponent implements AfterViewInit, OnChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  @Input() currentLocation: { lat: number; lng: number } | null = null;
  @Input() places: Place[] = [];
  @Input() selectedPlace: Place | null = null;
  @Input() radius = 1000;

  @Output() select = new EventEmitter<Place>();

  private map: any;
  private markers: any[] = [];
  private currentLocMarker: any;
  private radiusCircle: any;
  private infoWindow: any;

  constructor() {}

  ngAfterViewInit(): void {
     this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (!this.map) {
        this.initMap();
        return;
      }

      if (changes['currentLocation'] && this.currentLocation) {
          this.updateCurrentLocation();
          this.updateRadiusCircle();
      }

      if (changes['radius'] && this.radius) {
          this.updateRadiusCircle();
      }

      if (changes['places'] && this.places) {
          this.updateMarkers();
      }

      if (changes['selectedPlace'] && this.selectedPlace) {
          this.highlightSelectedPlace();
      }
  }

  private initMap(): void {
    if (this.map) return;

    if (typeof google === 'undefined' || !google.maps || typeof google.maps.Map !== 'function' || !this.mapContainer?.nativeElement) {
      setTimeout(() => {
        if (!this.map) this.initMap();
      }, 150);
      return;
    }

    const center = this.currentLocation || { lat: 3.140853, lng: 101.693207 };

    try {
      // Modern AdvancedMarkerElement requires a mapId
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: center,
        zoom: 14,
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: false,
        streetViewControl: false,
      });
    } catch (e) {
      setTimeout(() => {
        if (!this.map) this.initMap();
      }, 200);
      return;
    }

    this.infoWindow = new google.maps.InfoWindow();

    if (this.currentLocation) {
        this.updateCurrentLocation();
        this.updateRadiusCircle();
    }

    if (this.places && this.places.length > 0) {
        this.updateMarkers();
    }
  }

  private updateRadiusCircle(): void {
    if (!this.map || !this.currentLocation) return;

    if (this.radiusCircle) {
      this.radiusCircle.setMap(null);
    }

    // Draw clear visual radius circle around user location (e.g. 1km = 1000m)
    this.radiusCircle = new google.maps.Circle({
      strokeColor: '#277a62',
      strokeOpacity: 0.85,
      strokeWeight: 2,
      fillColor: '#81c784',
      fillOpacity: 0.15,
      map: this.map,
      center: this.currentLocation,
      radius: this.radius || 1000
    });
  }

  private updateCurrentLocation(): void {
    if (!this.map || !this.currentLocation) return;

    if (this.currentLocMarker) {
      if (typeof this.currentLocMarker.setPosition === 'function') {
        this.currentLocMarker.setPosition(this.currentLocation);
      } else {
        this.currentLocMarker.position = this.currentLocation;
      }
    } else {
      if (typeof google !== 'undefined' && google.maps?.marker?.AdvancedMarkerElement) {
        const pin = document.createElement('div');
        pin.className = 'current-location-pin';
        pin.style.cssText = 'width: 18px; height: 18px; background: #4285F4; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(66,133,244,0.7);';

        this.currentLocMarker = new google.maps.marker.AdvancedMarkerElement({
          position: this.currentLocation,
          map: this.map,
          title: 'Your Location',
          content: pin
        });
      } else {
        this.currentLocMarker = new google.maps.Marker({
          position: this.currentLocation,
          map: this.map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          }
        });
      }
    }
    this.map.panTo(this.currentLocation);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.clearMarkers();
    const bounds = new google.maps.LatLngBounds();

    if (this.currentLocation) {
      bounds.extend(this.currentLocation);
    }

    const hasAdvancedMarkers = typeof google !== 'undefined' && google.maps?.marker?.AdvancedMarkerElement;

    this.places.forEach(place => {
      let marker: any;

      // Compact, sleek badge pin so map markers remain 100% readable and never overlap into clutter
      const pinBadge = document.createElement('div');
      pinBadge.className = 'pandan-map-badge';
      pinBadge.style.cssText = `
        background: #277a62;
        color: #ffffff;
        padding: 5px 9px;
        border-radius: 16px;
        font-weight: 700;
        font-size: 11px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 3px;
        border: 2px solid #ffffff;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
        white-space: nowrap;
      `;
      pinBadge.innerHTML = `<span style="font-size:12px;">🌿</span><span>${place.rating ? place.rating + '★' : 'Pandan'}</span>`;

      pinBadge.addEventListener('mouseenter', () => {
        pinBadge.style.transform = 'scale(1.18)';
        pinBadge.style.zIndex = '9999';
      });
      pinBadge.addEventListener('mouseleave', () => {
        pinBadge.style.transform = 'scale(1)';
        pinBadge.style.zIndex = '1';
      });

      if (hasAdvancedMarkers) {
        marker = new google.maps.marker.AdvancedMarkerElement({
          position: place.location,
          map: this.map,
          title: place.name,
          content: pinBadge
        });

        marker.addListener('gmp-click', () => {
          this.select.emit(place);
        });
      } else {
        marker = new google.maps.Marker({
          position: place.location,
          map: this.map,
          title: place.name
        });

        marker.addListener('click', () => {
          this.select.emit(place);
        });
      }

      bounds.extend(place.location);
      this.markers.push(marker);
    });

    if (this.radiusCircle && this.map) {
      this.map.fitBounds(this.radiusCircle.getBounds());
    } else if (this.places.length > 0 || this.currentLocation) {
      this.map.fitBounds(bounds);
    }
  }

  private showInfoWindow(place: Place, marker: any): void {
    if (!this.infoWindow || !this.map) return;

    const content = `
      <div style="padding: 6px 10px; font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; max-width: 220px;">
        <strong style="color: #1b5e20; font-size: 14px; display: block; margin-bottom: 4px;">${place.name}</strong>
        <div style="font-size: 12px; color: #333; margin-bottom: 2px;">
          ⭐ <strong>${place.rating || '4.2'}</strong> <span style="color: #777;">(${place.userRatingsTotal || 0} reviews)</span>
        </div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">
          📍 ${place.distance ? place.distance + 'm away' : 'Nearby'}
        </div>
      </div>
    `;

    this.infoWindow.setContent(content);
    if (marker.position) {
      this.infoWindow.open({
        anchor: marker,
        map: this.map
      });
    }
  }

  private clearMarkers(): void {
    this.markers.forEach(m => {
      if (typeof m.setMap === 'function') {
        m.setMap(null);
      } else {
        m.map = null;
      }
    });
    this.markers = [];
  }

  private highlightSelectedPlace(): void {
    if (!this.map || !this.selectedPlace) return;
    this.map.panTo(this.selectedPlace.location);
  }
}
