import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Tour, TourLog } from '../../model/tour.model';
import { TourService } from '../../services/tour.service';
import { TourLogService } from '../../services/tour-log.service';
import { TourFormComponent } from '../tour-form/tour-form.component';
import { TourLogFormComponent } from './tour-log-form/tour-log-form.component';
import { TourMapComponent } from './tour-map/tour-map.component';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TourFormComponent,
    TourLogFormComponent,
    TourMapComponent
  ],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  tour = signal<Tour | undefined>(undefined);
  tourLogs = signal<TourLog[]>([]);
  loading = signal(true);
  error = signal<string | undefined>(undefined);
  showEditForm = signal(false);
  showLogForm = signal(false);
  editingLog = signal<TourLog | undefined>(undefined);
  private tourId: number | null = null;


  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService,
    private tourLogService: TourLogService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.tourId = parseInt(id, 10);
        this.loadTour();
      } else {
        this.loading.set(false);
        this.error.set('No tour ID provided.');
      }
    });
  }

  private loadTour(): void {
    this.loading.set(true);
    this.error.set(undefined);

    try {
      if (this.tourId !== null) {
        const loadedTour = this.tourService.getTourById(this.tourId);
        this.tour.set(loadedTour);

        if (loadedTour) {
          this.tourLogs.set(this.tourLogService.getLogsByTourId(this.tourId));

          // only initialize map in browser
          if (isPlatformBrowser(this.platformId)) {
          }
        }
      }
    } catch (err) {
      this.error.set('Failed to load tour. Please try again.');
      console.error('Error loading tour:', err);
    } finally {
      this.loading.set(false);
    }
  }



  getIcon(transportType: string): string {
    const icons: Record<string, string> = {
      bike: '🚴',
      hike: '🥾',
      run: '🏃',
      vacation: '✈️'
    };
    return icons[transportType] || '📍';
  }

  getIconBg(transportType: string): string {
    const colors: Record<string, string> = {
      bike: '#FFE5B4',
      hike: '#B4D7FF',
      run: '#FFB4D7',
      vacation: '#D7FFB4',
    };
    return colors[transportType] || '#E0E0E0';
  }

  capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  formatTime(minutes: number): string {
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  getStars(rating: number): string {
    if (!rating) return '☆☆☆☆☆';
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }

  openEdit(): void { this.showEditForm.set(true); }
  closeEditForm(): void { this.showEditForm.set(false); }

  onTourSaved(updatedTour: Tour): void {
    this.tour.set(updatedTour);
    this.closeEditForm();

    if (isPlatformBrowser(this.platformId)) {
    }
  }

  openAddLog(): void {
    this.editingLog.set(undefined);
    this.showLogForm.set(true);
  }

  openEditLog(log: TourLog): void {
    this.editingLog.set(log);
    this.showLogForm.set(true);
  }

  closeLogForm(): void {
    this.showLogForm.set(false);
    this.editingLog.set(undefined);
  }

  logCount = computed(() => this.tourLogs().length);

  averageRating = computed(() => {
    const logs = this.tourLogs();
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + log.rating, 0);
    return total / logs.length;
  });

  averageDifficulty = computed(() => {
    const logs = this.tourLogs();
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + log.difficulty, 0);
    return total / logs.length;
  });

  onLogSaved(savedLog: TourLog): void {
    const currentLogs = this.tourLogs();
    const index = currentLogs.findIndex(log => log.id === savedLog.id);
    const updated =
      index > -1
        ? currentLogs.map((log, i) => (i === index ? savedLog : log))
        : [...currentLogs, savedLog];
    this.tourLogs.set(updated);
    this.closeLogForm();
  }

  deleteWithConfirm(): void {
    if (this.tour() && confirm(`Delete tour "${this.tour()!.name}"?`)) {
      try {
        this.tourService.deleteTour(this.tour()!.id);
        this.router.navigate(['/tours']);
      } catch (err) {
        console.error('Error deleting tour:', err);
        alert('Failed to delete tour. Please try again.');
      }
    }
  }

  deleteLogWithConfirm(log: TourLog): void {
    if (confirm('Delete this log entry?')) {
      try {
        this.tourLogService.deleteLog(log.id);
        this.tourLogs.set(this.tourLogs().filter(l => l.id !== log.id));
      } catch (err) {
        console.error('Error deleting log:', err);
        alert('Failed to delete log. Please try again.');
      }
    }
  }
}
