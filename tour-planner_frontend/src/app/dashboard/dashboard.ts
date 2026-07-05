import { Component, OnInit, computed, inject, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TourService } from '../services/tour.service';
import { TourLogService } from '../services/tour-log.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private tourService = inject(TourService);
  private tourLogService = inject(TourLogService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const tours = this.tourService.getTours();
      if (tours.length > 0) {
        untracked(() => tours.forEach(t => this.tourLogService.loadLogsForTour(t.id).subscribe()));
      }
    });
  }

  ngOnInit(): void {}

  tours = computed(() => this.tourService.getTours());
  recentTours = computed(() => this.tours().slice(0, 6));

  totalTours = computed(() => this.tours().length);
  totalDistance = computed(() =>
    this.tours().reduce((acc, t) => acc + (t.distance ?? 0), 0)
  );
  totalDuration = computed(() => {
    const mins = this.tours().reduce((acc, t) => acc + (t.estimatedTime ?? 0), 0);
    return Math.round(mins / 60);
  });

  allLogs = computed(() => {
    const logs = this.tours().flatMap(t =>
      this.tourLogService.getLogsForTour(t.id).map(log => ({
        ...log,
        tourName: t.name,
        tourId: t.id
      }))
    );
    return logs.sort((a, b) =>
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
  });

  recentLogs = computed(() => this.allLogs().slice(0, 5));
  totalLogs = computed(() => this.allLogs().length);

  goToTour(id: number): void {
    this.router.navigate(['/tours', id]);
  }

  goToNewTour(): void {
    this.router.navigate(['/tours']);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      bike: 'bike',
      hike: 'mountain',
      run: 'footprints',
      vacation: 'plane'
    };
    return icons[type] ?? 'map-pin';
  }

  formatTime(minutes: number): string {
    if (!minutes) return '0h';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getStars(rating: number): string {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}
