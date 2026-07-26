import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../components/map/map.component';
import { FoodCardComponent } from '../../components/food-card/food-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { FoodStore } from '../../store/food.store';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { PlacesService } from '../../../../core/services/places.service';
import { FoodFilterService } from '../../services/food-filter.service';
import { CacheService } from '../../../../core/services/cache.service';
import { Place } from '../../../../shared/models/place';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

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
    LoadingComponent,
    EmptyStateComponent,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class SearchPageComponent implements OnInit {
  store = inject(FoodStore);
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

  async ngOnInit() {
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

  async initLocationAndSearch() {
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

    const radius = this.store.radius();
    this.store.setLoading(true);
    this.store.setError(null);

    const searchKeywords = ['pandan', 'kuih', 'dessert', 'cake', 'onde onde'];
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

        const mappedPlaces: Place[] = pandanPlaces.map((p: any) => ({
            id: p.place_id,
            name: p.name,
            rating: p.rating,
            userRatingsTotal: p.user_ratings_total,
            address: p.vicinity,
            location: { lat: p.geometry.location.lat(), lng: p.geometry.location.lng() },
            openNow: p.opening_hours?.isOpen(),
            distance: this.placesService.calculateDistance(loc.lat, loc.lng, p.geometry.location.lat(), p.geometry.location.lng()),
            photos: p.photos ? p.photos.map((photo: any) => photo.getUrl({maxWidth: 400})) : []
        }));

        this.store.setPlaces(mappedPlaces);
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
