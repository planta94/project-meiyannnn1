import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PandanBgComponent } from './pandan-bg.component';

describe('PandanBgComponent', () => {
  let component: PandanBgComponent;
  let fixture: ComponentFixture<PandanBgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PandanBgComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PandanBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create and render canvas element', () => {
    expect(component).toBeTruthy();
    expect(component.canvasRef).toBeDefined();
    expect(component.canvasRef.nativeElement).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should update mouse targets on mousemove', () => {
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });

    component.onMouseMove(mouseEvent);
    expect((component as any).targetMouseX).toBeCloseTo(0, 1);
    expect((component as any).targetMouseY).toBeCloseTo(0, 1);
  });

  it('should handle window resize without error', () => {
    expect(() => component.onResize()).not.toThrow();
  });

  it('should cancel animation frame and dispose renderer on destroy', () => {
    const renderer = (component as any).renderer;
    const disposeSpy = spyOn(renderer, 'dispose').and.callThrough();

    component.ngOnDestroy();
    expect(disposeSpy).toHaveBeenCalled();
  });
});
