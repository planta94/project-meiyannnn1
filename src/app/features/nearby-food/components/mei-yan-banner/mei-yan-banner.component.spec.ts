import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MeiYanBannerComponent } from './mei-yan-banner.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MeiYanBannerComponent', () => {
  let component: MeiYanBannerComponent;
  let fixture: ComponentFixture<MeiYanBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeiYanBannerComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MeiYanBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create and initialize 4 quotes with collapsed state true', () => {
    expect(component).toBeTruthy();
    expect(component.quotes.length).toBe(4);
    expect(component.isCollapsed()).toBe(true);
    expect(component.currentIndex()).toBe(0);
  });

  it('should navigate through quotes with nextQuote, prevQuote, and setIndex', () => {
    component.nextQuote();
    expect(component.currentIndex()).toBe(1);

    component.nextQuote();
    expect(component.currentIndex()).toBe(2);

    component.prevQuote();
    expect(component.currentIndex()).toBe(1);

    component.prevQuote();
    expect(component.currentIndex()).toBe(0);

    // Underflow wrap
    component.prevQuote();
    expect(component.currentIndex()).toBe(3);

    // Direct index
    component.setIndex(2);
    expect(component.currentIndex()).toBe(2);

    // Out-of-bounds index should be ignored
    component.setIndex(99);
    expect(component.currentIndex()).toBe(2);
  });

  it('should expand and collapse banner state', () => {
    expect(component.isCollapsed()).toBe(true);

    component.expand();
    expect(component.isCollapsed()).toBe(false);

    component.collapse();
    expect(component.isCollapsed()).toBe(true);
  });

  it('should auto-cycle quotes using timer and clear on destroy', () => {
    expect((component as any).timerId).not.toBeNull();
    component.ngOnDestroy();
    expect((component as any).timerId).toBeNull();
  });

  it('should handle dragging state and expand on disc click if not dragging', fakeAsync(() => {
    component.collapse();
    component.onDiscClick();
    expect(component.isCollapsed()).toBe(false);

    component.collapse();
    component.onDragStarted();
    component.onDiscClick();
    expect(component.isCollapsed()).toBe(true); // Was dragging, so not expanded

    component.onDragEnded();
    tick(200);
    component.onDiscClick();
    expect(component.isCollapsed()).toBe(false); // Drag ended and timeout elapsed
  }));
});
