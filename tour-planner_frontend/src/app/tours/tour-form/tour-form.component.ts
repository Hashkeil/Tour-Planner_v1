import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Tour } from '../../model/tour.model';
import { TourService } from '../../services/tour.service';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tour-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './tour-form.component.html',
  styleUrl: './tour-form.component.css'
})
export class TourFormComponent implements OnInit {
  @Input() tour: Tour | undefined;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Tour>();

  private tourService = inject(TourService);
  private http = inject(HttpClient);

  // State
  formData: any = {};
  error = signal('');
  saving = signal(false);
  fetchingRoute = signal(false);
  routeFetched = signal(false);
  fieldErrors: Record<string, string> = {};

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

    const orsType = this.toOrsType(this.formData.transportType);
    const params = new HttpParams()
      .set('from', this.formData.fromLocation)
      .set('to', this.formData.toLocation)
      .set('type', orsType);

    this.http.get<{ distanceKm: number; durationMin: number; geometry: string }>(
      `${environment.apiUrl}/route`, { params }
    ).subscribe({
      next: (result) => {
        this.formData.distance = parseFloat(result.distanceKm.toFixed(1));
        this.formData.estimatedTime = Math.round(result.durationMin);
        this.formData.routeGeometry = result.geometry;
        this.routeFetched.set(true);
        this.fetchingRoute.set(false);
        setTimeout(() => this.routeFetched.set(false), 4000);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? err.error?.message ?? 'Could not fetch route. Check the location names and try again.');
        this.fetchingRoute.set(false);
      }
    });
  }

  private toOrsType(transportType: string): string {
    const map: Record<string, string> = {
      bike: 'bicycle',
      hike: 'foot',
      run: 'foot',
      vacation: 'car'
    };
    return map[transportType] ?? 'foot';
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

    const operation = this.tour
      ? this.tourService.updateTour(this.tour.id, this.formData)
      : this.tourService.createTour(this.formData);

    operation.subscribe({
      next: (savedTour) => {
        this.saved.emit(savedTour);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? err.error?.message ?? 'Failed to save tour');
        this.saving.set(false);
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
