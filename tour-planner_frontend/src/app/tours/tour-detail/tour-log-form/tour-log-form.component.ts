import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourLog } from '../../../model/tour.model';
import { TourLogService } from '../../../services/tour-log.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tour-log-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './tour-log-form.component.html',
  styleUrl: './tour-log-form.component.css'
})
export class TourLogFormComponent implements OnInit {
  @Input() tourId!: number;
  @Input() log: TourLog | undefined;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<TourLog>();

  private tourLogService = inject(TourLogService);

  formData: any = {};
  error = signal('');
  saving = signal(false);
  fieldErrors: Record<string, string> = {};

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    if (this.log) {
      this.formData = { ...this.log };
    } else {
      this.formData = {
        tourId: this.tourId,
        dateTime: new Date().toISOString().slice(0, 16),
        comment: '',
        difficulty: 3,
        distance: 0,
        totalTime: 0,
        rating: 4
      };
    }
    this.error.set('');
  }

  validateField(field: string): void {
    delete this.fieldErrors[field];

    switch (field) {
      case 'dateTime':
        if (!this.formData.dateTime) {
          this.fieldErrors[field] = 'Date and time is required';
        }
        break;

      case 'difficulty':
        if (!this.formData.difficulty || this.formData.difficulty < 1 || this.formData.difficulty > 5) {
          this.fieldErrors[field] = 'Please select a difficulty level';
        }
        break;

      case 'distance':
        if (this.formData.distance === undefined || this.formData.distance === null || this.formData.distance === '') {
          this.fieldErrors[field] = 'Distance is required';
        } else if (this.formData.distance < 0) {
          this.fieldErrors[field] = 'Distance must be positive';
        }
        break;

      case 'totalTime':
        if (this.formData.totalTime === undefined || this.formData.totalTime === null || this.formData.totalTime === '') {
          this.fieldErrors[field] = 'Total time is required';
        } else if (this.formData.totalTime < 0) {
          this.fieldErrors[field] = 'Time must be positive';
        }
        break;

      case 'rating':
        if (!this.formData.rating || this.formData.rating < 1 || this.formData.rating > 5) {
          this.fieldErrors[field] = 'Please select a rating';
        }
        break;
    }
  }

  private validateForm(): boolean {
    this.fieldErrors = {};
    ['dateTime', 'difficulty', 'distance', 'totalTime', 'rating'].forEach(field => {
      this.validateField(field);
    });

    return Object.keys(this.fieldErrors).length === 0;
  }

  getStarDisplay(count: number): string {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  save(): void {
    if (!this.validateForm()) {
      this.error.set('Please fix the errors above');
      return;
    }

    this.saving.set(true);
    this.error.set('');


    const payload = {
      ...this.formData,
      dateTime: typeof this.formData.dateTime === 'string'
        ? new Date(this.formData.dateTime)
        : this.formData.dateTime
    };

    const operation = this.log
      ? this.tourLogService.updateLog(this.log.id, payload)
      : this.tourLogService.createLog(payload);

    operation.subscribe({
      next: (savedLog) => {
        this.saved.emit(savedLog);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? err.error?.message ?? 'Failed to save log');
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
