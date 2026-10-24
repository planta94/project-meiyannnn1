import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginCardComponent } from './login-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginCardComponent', () => {
  let component: LoginCardComponent;
  let fixture: ComponentFixture<LoginCardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login'], {
      PRESET_USERNAME: 'pandan',
      PRESET_PASSWORD: 'pandanpassword'
    });

    await TestBed.configureTestingModule({
      imports: [LoginCardComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and default hidePassword to true', () => {
    expect(component).toBeTruthy();
    expect(component.hidePassword).toBe(true);
    expect(component.errorMessage).toBe('');
  });

  it('should autofill preset credentials from AuthService', () => {
    component.errorMessage = 'previous error';
    component.autoFillPreset();

    expect(component.username).toBe('pandan');
    expect(component.password).toBe('pandanpassword');
    expect(component.errorMessage).toBe('');
  });

  it('should emit loginSuccess on successful authentication', () => {
    authServiceSpy.login.and.returnValue({ success: true });
    const emitSpy = spyOn(component.loginSuccess, 'emit');

    component.username = 'pandan';
    component.password = 'pandanpassword';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('pandan', 'pandanpassword');
    expect(emitSpy).toHaveBeenCalled();
    expect(component.errorMessage).toBe('');
  });

  it('should display error message on failed authentication', () => {
    authServiceSpy.login.and.returnValue({
      success: false,
      message: 'Invalid credentials'
    });
    const emitSpy = spyOn(component.loginSuccess, 'emit');

    component.username = 'wrong';
    component.password = 'wrong';
    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Invalid credentials');

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const errorEl = compiled.querySelector('.error-notice');
    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toContain('Invalid credentials');
  });

  it('should toggle password visibility flag', () => {
    expect(component.hidePassword).toBe(true);
    component.hidePassword = !component.hidePassword;
    expect(component.hidePassword).toBe(false);
  });
});
