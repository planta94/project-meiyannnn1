import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../components/map/map.component';
import { FoodCardComponent } from '../../components/food-card/food-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { PandanBgComponent } from '../../components/pandan-bg/pandan-bg.component';
import { LoginCardComponent } from '../../components/login-card/login-card.component';
import { FoodStore } from '../../store/food.store';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { PlacesService } from '../../../../core/services/places.service';
import { FoodFilterService } from '../../services/food-filter.service';
import { CacheService } from '../../../../core/services/cache.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Place } from '../../../../shared/models/place';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MapComponent,
    FoodCardComponent,
    FilterPanelComponent,
    EmptyStateComponent,
    PandanBgComponent,
    LoginCardComponent,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class SearchPageComponent implements OnInit {
  store = inject(FoodStore);
  authService = inject(AuthService);
  private geoService = inject(GeolocationService);
  private placesService = inject(PlacesService);
  private filterService = inject(FoodFilterService);
  private cacheService = inject(CacheService);
  private snackBar = inject(MatSnackBar);

  private activeFilters = {
    sort: 'distance',
    minRating: 0,
    openNow: false,
    keyword: ''
  };

  isModalDismissed = false;

  dismissModal() {
    this.isModalDismissed = true;
  }

  async ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      // Do not load Google Maps API until user is authenticated
      return;
    }

    await this.startApp();
  }

  async startApp() {
    this.store.setLoading(true);
    try {
      await this.placesService.loadGoogleMaps();
      this.placesService.initService();
      await this.initLocationAndSearch();
    } catch (error: any) {
      this.store.setError('Failed to initialize Google Maps API.');
      this.store.setLoading(false);
    }
  }

  onLoginSuccess() {
    this.startApp();
  }

  async initLocationAndSearch() {
    this.isModalDismissed = false;
    this.store.setLoading(true);
    this.store.setError(null);
    try {
      const position = await this.geoService.getCurrentLocation();
      const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
      this.store.setCurrentLocation(loc);
      await this.performSearch();
    } catch (error: any) {
      this.store.setError(error.message || 'Unable to get location.');
      this.store.setLoading(false);
    }
  }

  async performSearch() {
    const loc = this.store.currentLocation();
    if (!loc) return;

    this.isModalDismissed = false;

    const radius = this.store.radius();
    this.store.setLoading(true);
    this.store.setError(null);

    // Single targeted query to drastically reduce Google API calls & save budget
    const searchKeywords = ['pandan food', 'kuih'];
    let allResults: any[] = [];

    try {
      const cacheKey = `search_all_${loc.lat}_${loc.lng}_${radius}`;
      const cached = this.cacheService.get(loc.lat, loc.lng, radius, 'all');

      if (cached) {
        allResults = cached;
      } else {
        const promises = searchKeywords.map(keyword =>
          this.placesService.searchNearby(loc.lat, loc.lng, radius, keyword)
            .catch((err: any) => []) // Ignore individual failures
        );

        const resultsArrays = await Promise.all(promises);
        allResults = resultsArrays.flat();

        if (allResults.length > 0) {
          this.cacheService.set(loc.lat, loc.lng, radius, 'all', allResults);
        }
      }

      const uniqueResults = this.filterService.removeDuplicates(allResults);
      const pandanPlaces = this.filterService.filterPandanPlaces(uniqueResults);

      const mappedPlaces: Place[] = pandanPlaces.map((p: any) => {
        const getLat = () => {
          if (typeof p.lat === 'number') return p.lat;
          if (typeof p.location?.lat === 'function') return p.location.lat();
          if (typeof p.location?.lat === 'number') return p.location.lat;
          if (typeof p.geometry?.location?.lat === 'function') return p.geometry.location.lat();
          if (typeof p.geometry?.location?.lat === 'number') return p.geometry.location.lat;
          return 0;
        };
        const getLng = () => {
          if (typeof p.lng === 'number') return p.lng;
          if (typeof p.location?.lng === 'function') return p.location.lng();
          if (typeof p.location?.lng === 'number') return p.location.lng;
          if (typeof p.geometry?.location?.lng === 'function') return p.geometry.location.lng();
          if (typeof p.geometry?.location?.lng === 'number') return p.geometry.location.lng;
          return 0;
        };
        const latVal = getLat();
        const lngVal = getLng();
        const dist = Math.round(this.placesService.calculateDistance(loc.lat, loc.lng, latVal, lngVal));

        let photosList: string[] = p.photoUrls || [];
        if (photosList.length === 0 && p.photos && Array.isArray(p.photos)) {
          photosList = p.photos.map((photo: any) => {
            if (typeof photo === 'string') return photo;
            if (typeof photo.getUrl === 'function') return photo.getUrl({ maxWidth: 400 });
            if (typeof photo.getURI === 'function') return photo.getURI();
            return photo.uri || '';
          }).filter(Boolean);
        }

        let isOpenNow: boolean | undefined = p.openNow;
        if (isOpenNow === undefined && p.opening_hours) {
          if (typeof p.opening_hours.isOpen === 'function') {
            try { isOpenNow = p.opening_hours.isOpen(); } catch (e) {
              // ignore check failure
            }
          } else if (typeof p.opening_hours.open_now === 'boolean') {
            isOpenNow = p.opening_hours.open_now;
          }
        }

        return {
          id: p.place_id || p.id || Math.random().toString(),
          name: p.name || p.displayName || 'Pandan Food Spot',
          rating: p.rating || 4.2,
          userRatingsTotal: p.user_ratings_total || p.userRatingCount || 0,
          address: p.vicinity || p.formatted_address || p.formattedAddress || 'Nearby',
          location: { lat: latVal, lng: lngVal },
          openNow: isOpenNow,
          distance: dist,
          photos: photosList
        };
      });

      // Filter strictly within selected radius (e.g. 1000m = 1km)
      const radiusFiltered = mappedPlaces.filter(p => (p.distance || 0) <= radius);

      this.store.setPlaces(radiusFiltered);
      this.applyFilters();

    } catch (error: any) {
      this.store.setError('Failed to search for nearby places.');
    } finally {
      this.store.setLoading(false);
    }
  }

  onFilterChange(filters: any) {
    if (this.store.radius() !== filters.radius) {
      this.store.setRadius(filters.radius);
      this.performSearch(); // Radius change needs new API call
    }

    this.activeFilters = {
      sort: filters.sort,
      minRating: filters.minRating,
      openNow: filters.openNow,
      keyword: filters.keyword
    };

    this.applyFilters();
  }

  private applyFilters() {
    let places = [...this.store.places()];

    // 1. Min Rating Filter
    if (this.activeFilters.minRating > 0) {
      places = places.filter(p => (p.rating || 0) >= this.activeFilters.minRating);
    }

    // 2. Open Now Filter
    if (this.activeFilters.openNow) {
      places = places.filter(p => p.openNow === true);
    }

    // 3. Keyword Filter
    if (this.activeFilters.keyword && this.activeFilters.keyword.trim() !== '') {
      const kw = this.activeFilters.keyword.toLowerCase();
      places = places.filter(p => p.name.toLowerCase().includes(kw));
    }

    // 4. Sort
    if (this.activeFilters.sort === 'distance') {
      places.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (this.activeFilters.sort === 'rating') {
      places.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    this.store.setFilteredPlaces(places);

    if (places.length === 0 && this.store.places().length > 0) {
      this.snackBar.open('No places match the current filters', 'Close', { duration: 3000 });
    }
  }

  onPlaceSelect(place: Place) {
    this.store.setSelectedPlace(place);
  }
}
