import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  settings = {
    username: 'Admin_admin',
    email: 'admin@example.com',
    fullName: 'Admin admin',
    theme: 'light',
    distanceUnit: 'km',
    speedUnit: 'kmh',
    notifications: true,
    publicProfile: false
  };

  private clearMessages(delay = 3000): void {
    setTimeout(() => {
      this.successMessage.set('');
      this.errorMessage.set('');
    }, delay);
  }

  saveProfile(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.settings.email)) {
      this.errorMessage.set('Please enter a valid email address');
      this.clearMessages();
      return;
    }

    if (!this.settings.username || this.settings.username.trim().length < 3) {
      this.errorMessage.set('Username must be at least 3 characters');
      this.clearMessages();
      return;
    }

    this.successMessage.set('Profile settings saved successfully!');
    this.clearMessages();
  }

  savePreferences(): void {
    this.successMessage.set('Preferences saved successfully!');
    this.clearMessages();
  }

  changePassword(): void {
    this.successMessage.set('Password changed successfully!');
    this.clearMessages();
  }

  resetData(): void {
    if (confirm('Are you sure? All your tours and logs will be deleted permanently.')) {
      this.successMessage.set('All data has been reset!');
      this.clearMessages();
    }
  }

  deleteAccount(): void {
    if (confirm('This action cannot be undone. Type "DELETE" to confirm.')) {
      this.successMessage.set('Account deleted successfully!');
      this.clearMessages();
    }
  }
}
