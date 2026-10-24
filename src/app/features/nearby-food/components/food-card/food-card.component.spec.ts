import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodCardComponent } from './food-card.component';
import { Place } from '../../../../shared/models/place';

describe('FoodCardComponent', () => {
  let component: FoodCardComponent;
  let fixture: ComponentFixture<FoodCardComponent>;

  const mockPlace: Place = {
    id: 'place-123',
    name: 'Pandan Chiffon Special',
    rating: 4.8,
    userRatingsTotal: 340,
    address: '123 Bakery Lane, KL',
    location: {
      lat: 3.139,
      lng: 101.686
    },
    distance: 450,
    openNow: true,
    isFeaturedSpot: true,
    photos: ['https://example.com/chiffon.jpg']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FoodCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('place', { ...mockPlace });
    fixture.detectChanges();
  });

  it('should render place card with name, rating, address and distance chip', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.place-name')?.textContent).toContain('Pandan Chiffon Special');
    expect(compiled.querySelector('.rating-val')?.textContent).toContain('4.8');
    expect(compiled.querySelector('.rating-count')?.textContent).toContain('(340)');
    expect(compiled.querySelector('.address-line')?.textContent).toContain('123 Bakery Lane, KL');
    expect(compiled.querySelector('.distance-chip')?.textContent).toContain('450m');
    expect(compiled.querySelector('.featured-chip')).not.toBeNull();
    expect(compiled.querySelector('.status-badge')?.textContent).toContain('Open • 营业中');
  });

  it('should format distance in kilometers when distance >= 1000m', () => {
    fixture.componentRef.setInput('place', { ...mockPlace, distance: 2450 });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.distance-chip')?.textContent).toContain('2.5km');
  });

  it('should render placeholder hero when no photos are available', () => {
    fixture.componentRef.setInput('place', { ...mockPlace, photos: [] });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.placeholder-hero')).not.toBeNull();
    expect(compiled.querySelector('.card-img')).toBeNull();
  });

  it('should render Closed badge when openNow is false', () => {
    fixture.componentRef.setInput('place', { ...mockPlace, openNow: false });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.status-badge')?.textContent).toContain('Closed • 已打烊');
  });

  it('should emit select event on onSelect', () => {
    const selectSpy = spyOn(component.select, 'emit');
    component.onSelect();
    expect(selectSpy).toHaveBeenCalledWith(component.place);
  });

  describe('getGoogleMapsLink', () => {
    it('should open existing googleMapsLink if defined', () => {
      const openSpy = spyOn(window, 'open');
      fixture.componentRef.setInput('place', { ...mockPlace, googleMapsLink: 'https://maps.google.com/?cid=123' });
      fixture.detectChanges();

      component.getGoogleMapsLink();
      expect(openSpy).toHaveBeenCalledWith('https://maps.google.com/?cid=123', '_blank');
    });

    it('should construct fallback maps search URL when googleMapsLink is undefined', () => {
      const openSpy = spyOn(window, 'open');
      const placeWithoutLink = { ...mockPlace };
      delete placeWithoutLink.googleMapsLink;
      fixture.componentRef.setInput('place', placeWithoutLink);
      fixture.detectChanges();

      component.getGoogleMapsLink();
      expect(openSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/),
        '_blank'
      );
    });
  });
});
