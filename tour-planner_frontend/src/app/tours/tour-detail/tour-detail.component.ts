import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, signal, computed, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';

import { Tour, TourLog } from '../../model/tour.model';
import { TourService } from '../../services/tour.service';
import { TourLogService } from '../../services/tour-log.service';
import { TourFormComponent } from '../tour-form/tour-form.component';
import { TourLogFormComponent } from './tour-log-form/tour-log-form.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TourFormComponent, TourLogFormComponent, LucideAngularModule],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  tour = signal<Tour | undefined>(undefined);
  tourLogs = signal<TourLog[]>([]);
  loading = signal(true);
  error = signal<string | undefined>(undefined);
  showEditForm = signal(false);
  showLogForm = signal(false);
  editingLog = signal<TourLog | undefined>(undefined);
  private tourId: number | null = null;
  private map: L.Map | null = null;

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
    if (this.tourId === null) {
      this.error.set('No tour ID provided.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(undefined);

    this.tourService.loadTourById(this.tourId).subscribe({
      next: tour => {
        this.tour.set(tour);
        this.loading.set(false);
        if (tour.routeGeometry && isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initMap(tour.routeGeometry!), 100);
        }
      },
      error: () => { this.error.set('Tour not found.'); this.loading.set(false); }
    });

    this.tourLogService.loadLogsForTour(this.tourId).subscribe({
      next: logs => this.tourLogs.set(logs),
      error: () => {}
    });
  }

  private initMap(geometryJson: string, attempt = 0): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    const el = document.getElementById('tour-map');
    if (!el) {
      if (attempt < 10) setTimeout(() => this.initMap(geometryJson, attempt + 1), 50);
      return;
    }

    const geometry = JSON.parse(geometryJson);
    // ORS returns [lon, lat] — Leaflet needs [lat, lon]
    const latLngs: L.LatLng[] = geometry.coordinates.map(
      (c: [number, number]) => L.latLng(c[1], c[0])
    );

    this.map = L.map(el);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const polyline = L.polyline(latLngs, { color: '#3b82f6', weight: 4 }).addTo(this.map);
    this.map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }



  getIcon(transportType: string): string {
    const icons: Record<string, string> = {
      bike: 'bike',
      hike: 'mountain',
      run: 'footprints',
      vacation: 'plane'
    };
    return icons[transportType] || 'map-pin';
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
    if (updatedTour.routeGeometry && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initMap(updatedTour.routeGeometry!), 0);
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
      this.tourService.deleteTour(this.tour()!.id).subscribe({
        next: () => this.router.navigate(['/tours']),
        error: () => alert('Failed to delete tour. Please try again.')
      });
    }
  }

  deleteLogWithConfirm(log: TourLog): void {
    if (confirm('Delete this log entry?')) {
      this.tourLogService.deleteLog(log.id).subscribe({
        next: () => this.tourLogs.set(this.tourLogs().filter(l => l.id !== log.id)),
        error: () => alert('Failed to delete log. Please try again.')
      });
    }
  }
}
