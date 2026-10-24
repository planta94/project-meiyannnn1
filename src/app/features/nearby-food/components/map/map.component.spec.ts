import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import { SimpleChange } from '@angular/core';

declare let window: any;

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let originalGoogle: any;

  beforeEach(async () => {
    originalGoogle = window.google;

    await TestBed.configureTestingModule({
      imports: [MapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.google = originalGoogle;
  });

  it('should create and render map container element', () => {
    expect(component).toBeTruthy();
    expect(component.mapContainer).toBeDefined();
    expect(component.radius).toBe(1000);
    expect(component.places).toEqual([]);
    expect(component.currentLocation).toBeNull();
  });

  it('should initialize map instance when google.maps is available', () => {
    const mockMapInstance = {
      setCenter: jasmine.createSpy('setCenter'),
      setZoom: jasmine.createSpy('setZoom'),
      panTo: jasmine.createSpy('panTo')
    };

    window.google = {
      maps: {
        Map: jasmine.createSpy('Map').and.returnValue(mockMapInstance),
        InfoWindow: jasmine.createSpy('InfoWindow').and.returnValue({
          open: jasmine.createSpy('open'),
          close: jasmine.createSpy('close'),
          setContent: jasmine.createSpy('setContent')
        }),
        Circle: jasmine.createSpy('Circle').and.returnValue({
          setMap: jasmine.createSpy('setMap'),
          setCenter: jasmine.createSpy('setCenter'),
          setRadius: jasmine.createSpy('setRadius')
        }),
        marker: {
          AdvancedMarkerElement: jasmine.createSpy('AdvancedMarkerElement').and.returnValue({
            setMap: jasmine.createSpy('setMap'),
            addListener: jasmine.createSpy('addListener')
          })
        }
      }
    };

    (component as any).map = null;
    (component as any).initMap();

    expect((component as any).map).toBe(mockMapInstance);
  });

  it('should react to ngOnChanges updates', () => {
    const mockMapInstance = {
      setCenter: jasmine.createSpy('setCenter'),
      setZoom: jasmine.createSpy('setZoom'),
      panTo: jasmine.createSpy('panTo')
    };

    (component as any).map = mockMapInstance;
    (component as any).infoWindow = { close: jasmine.createSpy('close') };

    const updateLocSpy = spyOn(component as any, 'updateCurrentLocation');
    const updateCircleSpy = spyOn(component as any, 'updateRadiusCircle');
    const updateMarkersSpy = spyOn(component as any, 'updateMarkers');
    const highlightSpy = spyOn(component as any, 'highlightSelectedPlace');

    component.currentLocation = { lat: 3.14, lng: 101.69 };
    component.radius = 2000;
    component.places = [{ id: 'p1', name: 'Place 1', lat: 3.14, lng: 101.69 } as any];
    component.selectedPlace = component.places[0];

    component.ngOnChanges({
      currentLocation: new SimpleChange(null, component.currentLocation, false),
      radius: new SimpleChange(1000, 2000, false),
      places: new SimpleChange([], component.places, false),
      selectedPlace: new SimpleChange(null, component.selectedPlace, false)
    });

    expect(updateLocSpy).toHaveBeenCalled();
    expect(updateCircleSpy).toHaveBeenCalled();
    expect(updateMarkersSpy).toHaveBeenCalled();
    expect(highlightSpy).toHaveBeenCalled();
  });
});
