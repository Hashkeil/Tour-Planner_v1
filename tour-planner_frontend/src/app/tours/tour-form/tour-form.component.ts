// CORRECTED FILE — all 3 bugs fixed (see comments below)
import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tour } from '../../model/tour.model';
import { TourService } from '../../services/tour.service';


@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-form.component.html',
  styleUrl: './tour-form.component.css'
})
export class TourFormComponent implements OnInit {
  @Input() tour: Tour | undefined;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Tour>();

  // State
  formData: any = {};
  error = signal('');
  saving = signal(false);
  fetchingRoute = signal(false);
  routeFetched = signal(false);
  fieldErrors: Record<string, string> = {};

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    if (this.tour) {
      this.formData = { ...this.tour };
    } else {
      this.formData = {
        name: '',
        description: '',
        fromLocation: '',
        toLocation: '',
        transportType: '',
        distance: 0,
        estimatedTime: 0,
        image: '',
        childFriendliness: 3,
        popularity: 0,
        averageRating: 0
      };
    }
    this.error.set('');
    this.routeFetched.set(false);
  }

  validateField(field: string): void {

    delete this.fieldErrors[field];

    switch (field) {
      case 'name':
        if (!this.formData.name?.trim()) {
          this.fieldErrors[field] = 'Tour name is required';
        } else if (this.formData.name.length < 3) {
          this.fieldErrors[field] = 'Tour name must be at least 3 characters';
        } else if (this.formData.name.length > 100) {
          this.fieldErrors[field] = 'Tour name must be at most 100 characters';
        }
        break;

      case 'fromLocation':
        if (!this.formData.fromLocation?.trim()) {
          this.fieldErrors[field] = 'Start location is required';
        } else if (this.formData.fromLocation.length < 2) {
          this.fieldErrors[field] = 'Location must be at least 2 characters';
        }
        break;

      case 'toLocation':
        if (!this.formData.toLocation?.trim()) {
          this.fieldErrors[field] = 'End location is required';
        } else if (this.formData.toLocation.length < 2) {
          this.fieldErrors[field] = 'Location must be at least 2 characters';
        }
        break;

      case 'transportType':
        if (!this.formData.transportType) {
          this.fieldErrors[field] = 'Please select a transport type';
        }
        break;
    }
  }

  private validateForm(): boolean {
    this.fieldErrors = {};
    ['name', 'fromLocation', 'toLocation', 'transportType'].forEach(field => {
      this.validateField(field);
    });
    // return false immediately without overwriting error with the same-location message
    if (Object.keys(this.fieldErrors).length > 0) {
      return false;
    }
    // Check if locations are the same (only for non-vacation tours)
    if (
      this.formData.transportType !== 'vacation' &&
      this.formData.fromLocation?.toLowerCase() === this.formData.toLocation?.toLowerCase()
    ) {
      this.error.set('Start and end location cannot be the same');
      return false;
    }

    return true;
  }

  fetchRoute(): void {
    if (!this.formData.fromLocation || !this.formData.toLocation) {
      this.error.set('Please enter both start and end location');
      return;
    }

    this.fetchingRoute.set(true);
    this.error.set('');

    setTimeout(() => {
      const distance = Math.random() * 100 + 5;
      const estimatedTime = Math.round(distance * 8 + Math.random() * 60);

      this.formData.distance = parseFloat(distance.toFixed(1));
      this.formData.estimatedTime = estimatedTime;
      this.routeFetched.set(true);
      this.fetchingRoute.set(false);

      setTimeout(() => this.routeFetched.set(false), 3000);
    }, 1000);
  }

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image must be smaller than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.formData.image = e.target?.result as string;
    };
    reader.onerror = () => {
      this.error.set('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.formData.image = '';
  }

  save(): void {
    if (!this.validateForm()) {
      if (!this.error()) {
        this.error.set('Please fix the errors above');
      }
      return;
    }

    this.saving.set(true);
    this.error.set('');

    setTimeout(() => {
      try {
        let savedTour: Tour;

        if (this.tour) {
          savedTour = this.tourService.updateTour(this.tour.id, this.formData) || this.formData;
        } else {
          savedTour = this.tourService.createTour(this.formData);
        }

        this.saved.emit(savedTour);
        this.saving.set(false);
      } catch (err: any) {
        this.error.set(err.message || 'Failed to save tour');
        this.saving.set(false);
      }
    }, 800);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
