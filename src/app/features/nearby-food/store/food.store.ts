import { Injectable, computed, signal } from '@angular/core';
import { Place } from '../../../shared/models/place';

export interface FoodState {
  currentLocation: { lat: number; lng: number } | null;
  radius: number;
  places: Place[];
  filteredPlaces: Place[];
  selectedPlace: Place | null;
  loading: boolean;
  error: string | null;
}

const initialState: FoodState = {
  currentLocation: null,
  radius: 1000,
  places: [],
  filteredPlaces: [],
  selectedPlace: null,
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class FoodStore {
  private state = signal<FoodState>(initialState);

  readonly currentLocation = computed(() => this.state().currentLocation);
  readonly radius = computed(() => this.state().radius);
  readonly places = computed(() => this.state().places);
  readonly filteredPlaces = computed(() => this.state().filteredPlaces);
  readonly selectedPlace = computed(() => this.state().selectedPlace);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Return the filtered places directly. The actual sorting will be handled and
  // set into filteredPlaces from the component
  readonly sortedPlaces = computed(() => {
     return this.filteredPlaces();
  });

  setCurrentLocation(location: { lat: number; lng: number } | null) {
    this.state.update((s: FoodState) => ({ ...s, currentLocation: location }));
  }

  setRadius(radius: number) {
    this.state.update((s: FoodState) => ({ ...s, radius }));
  }

  setPlaces(places: Place[]) {
    this.state.update((s: FoodState) => ({ ...s, places }));
  }

  setFilteredPlaces(places: Place[]) {
    this.state.update((s: FoodState) => ({ ...s, filteredPlaces: places }));
  }

  setSelectedPlace(place: Place | null) {
    this.state.update((s: FoodState) => ({ ...s, selectedPlace: place }));
  }

  setLoading(loading: boolean) {
    this.state.update((s: FoodState) => ({ ...s, loading }));
  }

  setError(error: string | null) {
    this.state.update((s: FoodState) => ({ ...s, error }));
  }

  resetState() {
     this.state.set(initialState);
  }
}
