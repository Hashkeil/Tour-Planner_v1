import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { TourLog } from '../model/tour.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TourLogService {
  private http = inject(HttpClient);
  private _logsByTour = signal<Map<number, TourLog[]>>(new Map());

  loadLogsForTour(tourId: number): Observable<TourLog[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/tours/${tourId}/logs`).pipe(
      map(dtos => dtos.map(d => this.fromDto(d))),
      tap(logs => this._logsByTour.update(m => new Map(m).set(tourId, logs)))
    );
  }

  getLogsByTourId(tourId: number): TourLog[] {
    return this._logsByTour().get(tourId) ?? [];
  }

  getLogsForTour(tourId: number): TourLog[] {
    return this.getLogsByTourId(tourId);
  }

  clear(): void {
    this._logsByTour.set(new Map());
  }

  getLogById(id: number): TourLog | undefined {
    for (const logs of this._logsByTour().values()) {
      const found = logs.find(l => l.id === id);
      if (found) return found;
    }
    return undefined;
  }

  createLog(data: any): Observable<TourLog> {
    const dto = {
      tourId: data.tourId,
      dateTime: data.dateTime instanceof Date ? data.dateTime.toISOString() : data.dateTime,
      comment: data.comment ?? '',
      difficulty: Number(data.difficulty),
      distance: Number(data.distance),
      totalTime: Number(data.totalTime),
      rating: Number(data.rating)
    };
    return this.http.post<any>(`${environment.apiUrl}/tourlogs`, dto).pipe(
      tap(res => {
        const log = this.fromDto(res);
        this._logsByTour.update(m => {
          const updated = new Map(m);
          updated.set(log.tourId, [...(updated.get(log.tourId) ?? []), log]);
          return updated;
        });
      }),
      map(res => this.fromDto(res))
    );
  }

  updateLog(id: number, data: any): Observable<TourLog> {
    const dto = {
      dateTime: data.dateTime instanceof Date ? data.dateTime.toISOString() : data.dateTime,
      comment: data.comment ?? '',
      difficulty: Number(data.difficulty),
      distance: Number(data.distance),
      totalTime: Number(data.totalTime),
      rating: Number(data.rating)
    };
    return this.http.put<any>(`${environment.apiUrl}/tourlogs/${id}`, dto).pipe(
      tap(res => {
        const updated = this.fromDto(res);
        this._logsByTour.update(m => {
          const newMap = new Map(m);
          const logs = newMap.get(updated.tourId) ?? [];
          newMap.set(updated.tourId, logs.map(l => l.id === id ? updated : l));
          return newMap;
        });
      }),
      map(res => this.fromDto(res))
    );
  }

  deleteLog(id: number): Observable<void> {
    const log = this.getLogById(id);
    return this.http.delete<void>(`${environment.apiUrl}/tourlogs/${id}`).pipe(
      tap(() => {
        if (log) {
          this._logsByTour.update(m => {
            const newMap = new Map(m);
            newMap.set(log.tourId, (newMap.get(log.tourId) ?? []).filter(l => l.id !== id));
            return newMap;
          });
        }
      })
    );
  }

  calculateTourStats(tourId: number) {
    const logs = this.getLogsByTourId(tourId);
    if (logs.length === 0) {
      return { totalLogs: 0, avgRating: 0, avgDifficulty: 0, totalDistance: 0, totalTime: 0 };
    }
    return {
      totalLogs: logs.length,
      avgRating: logs.reduce((s, l) => s + l.rating, 0) / logs.length,
      avgDifficulty: logs.reduce((s, l) => s + l.difficulty, 0) / logs.length,
      totalDistance: logs.reduce((s, l) => s + l.distance, 0),
      totalTime: logs.reduce((s, l) => s + l.totalTime, 0)
    };
  }

  private fromDto(d: any): TourLog {
    return {
      id: d.id,
      tourId: d.tourId,
      dateTime: d.dateTime ? new Date(d.dateTime) : new Date(),
      comment: d.comment ?? '',
      difficulty: d.difficulty,
      distance: d.distance,
      totalTime: d.totalTime,
      rating: d.rating,
      createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
      modifiedAt: d.modifiedAt ? new Date(d.modifiedAt) : undefined
    };
  }
}