import { Injectable, signal, inject } from '@angular/core';
import { TourLog } from '../model/tour.model';
import { TourService } from './tour.service';


@Injectable({
  providedIn: 'root'
})
export class TourLogService {
  private tourLogs = signal<TourLog[]>([
    {
      id: 1,
      tourId: 1,
      dateTime: new Date('2025-10-15T09:00:00'),
      comment: 'Beautiful weather, perfect for hiking!',
      difficulty: 3,
      distance: 26.0,
      totalTime: 365,
      rating: 5,
      createdAt: new Date('2025-10-15T14:30:00')
    },
    {
      id: 2,
      tourId: 1,
      dateTime: new Date('2025-09-20T08:30:00'),
      comment: 'Challenging ascent, but worth the views.',
      difficulty: 4,
      distance: 25.2,
      totalTime: 380,
      rating: 4.5
    },
    {
      id: 3,
      tourId: 2,
      dateTime: new Date('2025-10-20T14:00:00'),
      comment: 'Great city tour, saw all major landmarks.',
      difficulty: 1,
      distance: 15.5,
      totalTime: 115,
      rating: 5
    },
    {
      id: 4,
      tourId: 2,
      dateTime: new Date('2025-10-10T10:00:00'),
      comment: 'Nice weather, perfect cycling conditions.',
      difficulty: 1,
      distance: 15.0,
      totalTime: 120,
      rating: 4.8
    },
    {
      id: 5,
      tourId: 3,
      dateTime: new Date('2025-08-15T06:30:00'),
      comment: 'Hard run, great cardio workout!',
      difficulty: 5,
      distance: 12.1,
      totalTime: 88,
      rating: 4
    }
  ]);


  private tourService = inject(TourService);

  constructor() {
    // Sync stats for all seed data tours on startup
    this.syncTourStats(1);
    this.syncTourStats(2);
    this.syncTourStats(3);
  }


  private syncTourStats(tourId: number): void {
    const logs = this.getLogsForTour(tourId);
    const popularity = logs.length;
    const averageRating =
      logs.length > 0
        ? logs.reduce((sum, log) => sum + log.rating, 0) / logs.length
        : 0;

    this.tourService.updateTour(tourId, { popularity, averageRating });
  }

  getLogsForTour(tourId: number): TourLog[] {
    return this.tourLogs().filter(log => log.tourId === tourId);
  }

  getLogById(id: number): TourLog | undefined {
    return this.tourLogs().find(log => log.id === id);
  }

  getLogsByTourId(tourId: number): TourLog[] {
    return this.tourLogs().filter(log => log.tourId === tourId);
  }

  createLog(log: Omit<TourLog, 'id'>): TourLog {
    const newLog: TourLog = {
      ...log,
      id: Math.max(...this.tourLogs().map(l => l.id), 0) + 1,
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    this.tourLogs.update(logs => [...logs, newLog]);
    this.syncTourStats(newLog.tourId);
    return newLog;
  }

  updateLog(id: number, updates: Partial<TourLog>): TourLog | undefined {
    const index = this.tourLogs().findIndex(log => log.id === id);
    if (index === -1) return undefined;

    const updated: TourLog = {
      ...this.tourLogs()[index],
      ...updates,
      modifiedAt: new Date()
    };

    this.tourLogs.update(logs => {
      const newLogs = [...logs];
      newLogs[index] = updated;
      return newLogs;
    });

    this.syncTourStats(updated.tourId);
    return updated;
  }

  deleteLog(id: number): boolean {
    const log = this.tourLogs().find(l => l.id === id);
    if (!log) return false;

    this.tourLogs.update(logs => logs.filter(l => l.id !== id));
    this.syncTourStats(log.tourId);
    return true;
  }

  calculateTourStats(tourId: number) {
    const logs = this.getLogsForTour(tourId);
    if (logs.length === 0) {
      return { totalLogs: 0, avgRating: 0, avgDifficulty: 0, totalDistance: 0, totalTime: 0 };
    }

    return {
      totalLogs: logs.length,
      avgRating: logs.reduce((sum, log) => sum + log.rating, 0) / logs.length,
      avgDifficulty: logs.reduce((sum, log) => sum + log.difficulty, 0) / logs.length,
      totalDistance: logs.reduce((sum, log) => sum + log.distance, 0),
      totalTime: logs.reduce((sum, log) => sum + log.totalTime, 0)
    };
  }
}
