import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { Theme, ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  private authService = inject(AuthService);
  themeService = inject(ThemeService);

  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  profile = {
    username: this.authService.getCurrentUser()?.username ?? '',
    email: this.authService.getCurrentUser()?.email ?? ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  private clearMessages(delay = 3000): void {
    setTimeout(() => {
      this.successMessage.set('');
      this.errorMessage.set('');
    }, delay);
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  saveProfile(): void {
    if (!this.profile.username || this.profile.username.trim().length < 3) {
      this.errorMessage.set('Username must be at least 3 characters');
      this.clearMessages();
      return;
    }

    this.authService.updateProfile(this.profile.username.trim()).subscribe({
      next: () => {
        this.successMessage.set('Profile settings saved successfully!');
        this.clearMessages();
      },
      error: () => {
        this.errorMessage.set('Failed to save profile. Please try again.');
        this.clearMessages();
      }
    });
  }

  changePassword(): void {
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      this.errorMessage.set('Please fill in all password fields');
      this.clearMessages();
      return;
    }

    if (newPassword.length < 6) {
      this.errorMessage.set('New password must be at least 6 characters');
      this.clearMessages();
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.errorMessage.set('New passwords do not match');
      this.clearMessages();
      return;
    }

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordForm = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
        this.successMessage.set('Password changed successfully!');
        this.clearMessages();
      },
      error: () => {
        this.errorMessage.set('Current password is incorrect.');
        this.clearMessages();
      }
    });
  }
}
