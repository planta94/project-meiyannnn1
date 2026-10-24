import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render empty search state by default', () => {
    expect(component).toBeTruthy();
    expect(component.error).toBeNull();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-title')?.textContent).toContain('No Pandan Treats Found');
    expect(compiled.querySelector('.retry-btn')).toBeNull();
  });

  it('should render error state and message when error input is provided', () => {
    fixture.componentRef.setInput('error', 'Location access denied by user');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-title')?.textContent).toContain('Search Encountered an Issue');
    expect(compiled.querySelector('.error-text')?.textContent).toContain('Location access denied by user');
    expect(compiled.querySelector('.retry-btn')).not.toBeNull();
  });

  it('should emit retry event when retry button is clicked', () => {
    fixture.componentRef.setInput('error', 'Network failure');
    fixture.detectChanges();

    const retrySpy = spyOn(component.retry, 'emit');
    const retryBtn = fixture.nativeElement.querySelector('.retry-btn') as HTMLButtonElement;
    expect(retryBtn).not.toBeNull();
    retryBtn.click();

    expect(retrySpy).toHaveBeenCalled();
  });
});
