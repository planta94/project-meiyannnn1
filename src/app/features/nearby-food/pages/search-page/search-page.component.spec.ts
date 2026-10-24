import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchPageComponent } from './search-page.component';
import { AuthService } from '../../../../core/services/auth.service';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { PlacesService } from '../../../../core/services/places.service';
import { FoodFilterService } from '../../services/food-filter.service';
import { CacheService } from '../../../../core/services/cache.service';
import { FoodStore } from '../../store/food.store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Place } from '../../../../shared/models/place';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;
  let store: FoodStore;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let geoServiceSpy: jasmine.SpyObj<GeolocationService>;
  let placesServiceSpy: jasmine.SpyObj<PlacesService>;
  let filterServiceSpy: jasmine.SpyObj<FoodFilterService>;
  let cacheServiceSpy: jasmine.SpyObj<CacheService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout'], {
      PRESET_USERNAME: 'pandan',
      PRESET_PASSWORD: 'pandanpassword'
    });
    geoServiceSpy = jasmine.createSpyObj('GeolocationService', ['getCurrentLocation']);
    placesServiceSpy = jasmine.createSpyObj('PlacesService', ['loadGoogleMaps', 'initService', 'searchNearby', 'calculateDistance']);
    filterServiceSpy = jasmine.createSpyObj('FoodFilterService', ['removeDuplicates', 'filterPandanPlaces', 'isPlaceOpenNow', 'extractWeekdayText', 'isFeaturedSpot']);
    cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent, NoopAnimationsModule],
      providers: [
        FoodStore,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: GeolocationService, useValue: geoServiceSpy },
        { provide: PlacesService, useValue: placesServiceSpy },
        { provide: FoodFilterService, useValue: filterServiceSpy },
        { provide: CacheService, useValue: cacheServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(FoodStore);
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
  });

  it('should create SearchPageComponent', () => {
    expect(component).toBeTruthy();
    expect(component.isModalDismissed).toBe(false);
  });

  it('should not initialize Google Maps on ngOnInit if unauthenticated', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    await component.ngOnInit();

    expect(placesServiceSpy.loadGoogleMaps).not.toHaveBeenCalled();
  });

  it('should start app on ngOnInit if authenticated', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    placesServiceSpy.loadGoogleMaps.and.resolveTo();
    geoServiceSpy.getCurrentLocation.and.resolveTo({
      coords: { latitude: 3.14, longitude: 101.69 }
    } as any);
    cacheServiceSpy.get.and.returnValue([]);
    filterServiceSpy.removeDuplicates.and.returnValue([]);
    filterServiceSpy.filterPandanPlaces.and.returnValue([]);

    await component.ngOnInit();

    expect(placesServiceSpy.loadGoogleMaps).toHaveBeenCalled();
    expect(placesServiceSpy.initService).toHaveBeenCalled();
  });

  it('should handle Google Maps loading failure gracefully', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    placesServiceSpy.loadGoogleMaps.and.rejectWith(new Error('Network offline'));

    await component.startApp();

    expect(store.error()).toBe('Failed to initialize Google Maps API.');
    expect(store.loading()).toBe(false);
  });

  it('should update selectedPlace in store on onPlaceSelect', () => {
    const dummyPlace: Place = {
      id: 'p1',
      name: 'Pandan Chiffon Place',
      location: { lat: 3.14, lng: 101.69 }
    };

    component.onPlaceSelect(dummyPlace);
    expect(store.selectedPlace()).toBe(dummyPlace);
  });

  it('should handle logout and display snackBar notice', () => {
    const openSpy = spyOn((component as any).snackBar, 'open');
    component.onLogout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith('Logged out successfully', 'Close', { duration: 3000 });
  });

  it('should dismiss modal when dismissModal is called', () => {
    expect(component.isModalDismissed).toBe(false);
    component.dismissModal();
    expect(component.isModalDismissed).toBe(true);
  });

  it('should apply filters (rating, openNow, keyword, sort) to places in store', () => {
    const mockList: Place[] = [
      { id: '1', name: 'Alpha Pandan Cafe', rating: 4.8, distance: 500, openNow: true, isFeaturedSpot: true, location: { lat: 3.14, lng: 101.69 } },
      { id: '2', name: 'Beta Bakery', rating: 3.5, distance: 200, openNow: false, isFeaturedSpot: false, location: { lat: 3.15, lng: 101.70 } },
      { id: '3', name: 'Gamma Pandan Kuih', rating: 4.2, distance: 800, openNow: true, isFeaturedSpot: false, location: { lat: 3.16, lng: 101.71 } }
    ];

    store.setPlaces(mockList);

    // Filter by rating >= 4.0 and openNow = true
    component.onFilterChange({
      radius: 1000,
      sort: 'rating',
      minRating: 4.0,
      openNow: true,
      keyword: 'Pandan',
      featuredOnly: false
    });

    const filtered = store.filteredPlaces();
    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe('1'); // rating 4.8 comes first
    expect(filtered[1].id).toBe('3'); // rating 4.2 comes second
  });
});
