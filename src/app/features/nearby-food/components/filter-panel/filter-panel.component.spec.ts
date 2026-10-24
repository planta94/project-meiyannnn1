import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterPanelComponent } from './filter-panel.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with default filter values and collapsed state', () => {
    expect(component).toBeTruthy();
    expect(component.radius).toBe(1000);
    expect(component.sort).toBe('distance');
    expect(component.minRating).toBe(0);
    expect(component.openNow).toBe(false);
    expect(component.keyword).toBe('');
    expect(component.featuredOnly).toBe(false);
    expect(component.isCollapsed).toBe(true);
  });

  it('should toggle collapse state on toggleCollapse', () => {
    expect(component.isCollapsed).toBe(true);
    component.toggleCollapse();
    expect(component.isCollapsed).toBe(false);
    component.toggleCollapse();
    expect(component.isCollapsed).toBe(true);
  });

  it('should toggle featuredOnly and emit updated filter payload', () => {
    const filterSpy = spyOn(component.filterChange, 'emit');

    component.toggleFeaturedOnly();
    expect(component.featuredOnly).toBe(true);
    expect(filterSpy).toHaveBeenCalledWith({
      radius: 1000,
      sort: 'distance',
      minRating: 0,
      openNow: false,
      keyword: '',
      featuredOnly: true
    });

    component.toggleFeaturedOnly();
    expect(component.featuredOnly).toBe(false);
  });

  it('should emit all filter properties on emitChanges', () => {
    const filterSpy = spyOn(component.filterChange, 'emit');

    component.radius = 3000;
    component.sort = 'rating';
    component.minRating = 4;
    component.openNow = true;
    component.keyword = 'chiffon';
    component.featuredOnly = true;

    component.emitChanges();

    expect(filterSpy).toHaveBeenCalledWith({
      radius: 3000,
      sort: 'rating',
      minRating: 4,
      openNow: true,
      keyword: 'chiffon',
      featuredOnly: true
    });
  });
});
