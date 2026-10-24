import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render spinner with pandan leaf icon and loading text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.loading-container');
    const spinner = compiled.querySelector('mat-spinner');
    const iconText = compiled.querySelector('.leaf-center mat-icon')?.textContent?.trim();
    const loadingText = compiled.querySelector('.loading-text')?.textContent;

    expect(component).toBeTruthy();
    expect(container !== null).toBe(true);
    expect(spinner !== null).toBe(true);
    expect(iconText).toBe('eco');
    expect(loadingText).toContain('Searching for fresh Pandan food nearby...');
  });
});
