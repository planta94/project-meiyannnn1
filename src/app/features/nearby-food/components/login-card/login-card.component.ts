import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss']
})
export class LoginCardComponent {
  authService = inject(AuthService);

  username = '';
  password = '';
  hidePassword = true;
  errorMessage = '';

  @Output() loginSuccess = new EventEmitter<void>();

  autoFillPreset() {
    this.username = this.authService.PRESET_USERNAME;
    this.password = this.authService.PRESET_PASSWORD;
    this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    const result = this.authService.login(this.username, this.password);

    if (result.success) {
      this.loginSuccess.emit();
    } else {
      this.errorMessage = result.message || 'Login failed';
    }
  }
}
