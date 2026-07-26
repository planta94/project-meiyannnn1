import { Component, ElementRef, Input, ViewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Place } from '../../../../shared/models/place';

declare var google: any;

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

  private map: any;
  private markers: any[] = [];
  private currentLocMarker: any;

  constructor() {}

  ngAfterViewInit(): void {
     this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (!this.map) return;

      if (changes['currentLocation'] && this.currentLocation) {
          this.updateCurrentLocation();
      }

      if (changes['places'] && this.places) {
          this.updateMarkers();
      }

      if (changes['selectedPlace'] && this.selectedPlace) {
          this.highlightSelectedPlace();
      }
  }

  private initMap(): void {
    if (typeof google === 'undefined' || !google.maps) return;

    const center = this.currentLocation || { lat: 3.140853, lng: 101.693207 };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });

    if (this.currentLocation) {
        this.updateCurrentLocation();
    }

    if (this.places && this.places.length > 0) {
        this.updateMarkers();
    }
  }

  private updateCurrentLocation(): void {
      if (!this.map || !this.currentLocation) return;

      if (this.currentLocMarker) {
          this.currentLocMarker.setPosition(this.currentLocation);
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
      this.map.panTo(this.currentLocation);
  }

  private updateMarkers(): void {
      if (!this.map) return;

      this.clearMarkers();

      const bounds = new google.maps.LatLngBounds();

      if (this.currentLocation) {
          bounds.extend(this.currentLocation);
      }

      this.places.forEach(place => {
          const marker = new google.maps.Marker({
              position: place.location,
              map: this.map,
              title: place.name
          });

          bounds.extend(place.location);
          this.markers.push(marker);

          marker.addListener('click', () => {
          });
      });

      if (this.places.length > 0 || this.currentLocation) {
          this.map.fitBounds(bounds);
      }
  }

  private clearMarkers(): void {
      this.markers.forEach(m => m.setMap(null));
      this.markers = [];
  }

  private highlightSelectedPlace(): void {
      if (!this.map || !this.selectedPlace) return;
      this.map.panTo(this.selectedPlace.location);
  }
}
