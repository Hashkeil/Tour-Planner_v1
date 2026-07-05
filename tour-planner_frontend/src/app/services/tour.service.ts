import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Tour } from '../model/tour.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TourService {
  private http = inject(HttpClient);
  private _tours = signal<Tour[]>([]);

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<any[]>(`${environment.apiUrl}/tours`).subscribe({
      next: dtos => this._tours.set(dtos.map(d => this.fromDto(d))),
      error: () => {}
    });
  }

  getTours(): Tour[] {
    return this._tours();
  }

  clear(): void {
    this._tours.set([]);
  }

  getTourById(id: number): Tour | undefined {
    return this._tours().find(t => t.id === id);
  }

  loadTourById(id: number): Observable<Tour> {
    return this.http.get<any>(`${environment.apiUrl}/tours/${id}`).pipe(
      tap(dto => {
        const tour = this.fromDto(dto);
        this._tours.update(ts => {
          const idx = ts.findIndex(t => t.id === id);
          return idx >= 0 ? ts.map((t, i) => i === idx ? tour : t) : [...ts, tour];
        });
      }),
      map(dto => this.fromDto(dto))
    );
  }

  createTour(data: any): Observable<Tour> {
    const dto = {
      name: data.name,
      description: data.description ?? '',
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      transportType: data.transportType,
      distance: data.distance,
      estimatedTime: data.estimatedTime,
      routeGeometry: data.routeGeometry ?? null,
      imagePath: data.image ?? null
    };
    return this.http.post<any>(`${environment.apiUrl}/tours`, dto).pipe(
      tap(res => this._tours.update(ts => [this.fromDto(res), ...ts])),
      map(res => this.fromDto(res))
    );
  }

  updateTour(id: number, data: any): Observable<Tour> {
    const dto = {
      name: data.name,
      description: data.description ?? '',
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      transportType: data.transportType,
      distance: data.distance,
      estimatedTime: data.estimatedTime,
      routeGeometry: data.routeGeometry ?? null,
      imagePath: data.image ?? null
    };
    return this.http.put<any>(`${environment.apiUrl}/tours/${id}`, dto).pipe(
      tap(res => {
        const updated = this.fromDto(res);
        this._tours.update(ts => ts.map(t => t.id === id ? updated : t));
      }),
      map(res => this.fromDto(res))
    );
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tours/${id}`).pipe(
      tap(() => this._tours.update(ts => ts.filter(t => t.id !== id)))
    );
  }

  searchTours(query: string): Tour[] {
    const q = query.toLowerCase();
    return this._tours().filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.fromLocation.toLowerCase().includes(q) ||
      t.toLocation.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }

  filterByTransportType(type: string): Tour[] {
    if (type === 'all') return this._tours();
    return this._tours().filter(t => t.transportType === type);
  }

  exportToursAsCSV(): string {
    const headers = ['ID', 'Name', 'From', 'To', 'Type', 'Distance (km)', 'Est. Time (min)', 'Rating'];
    const rows = this._tours().map(t => [
      t.id, t.name, t.fromLocation, t.toLocation,
      t.transportType, t.distance, t.estimatedTime, t.averageRating
    ]);
    return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  }

  importToursFromJSON(jsonString: string): Observable<number> {
    const parsed = JSON.parse(jsonString);
    const dtos = (Array.isArray(parsed) ? parsed : []).map((t: any) => ({
      name: t.name,
      description: t.description ?? '',
      fromLocation: t.fromLocation,
      toLocation: t.toLocation,
      transportType: t.transportType,
      distance: t.distance,
      estimatedTime: t.estimatedTime,
      routeGeometry: t.routeGeometry ?? null
    }));
    return this.http.post<{ imported: number }>(`${environment.apiUrl}/tours/import`, dtos).pipe(
      tap(() => this.loadAll()),
      map(r => r.imported)
    );
  }

  fromDto(d: any): Tour {
    return {
      id: d.id,
      name: d.name,
      description: d.description ?? '',
      fromLocation: d.fromLocation,
      toLocation: d.toLocation,
      transportType: d.transportType,
      distance: d.distance ?? 0,
      estimatedTime: d.estimatedTime ?? 0,
      popularity: d.popularity ?? 0,
      childFriendliness: d.childFriendliness ?? 3,
      averageRating: d.avgRating ?? 0,
      image: d.imagePath ?? undefined,
      routeGeometry: d.routeGeometry ?? undefined,
      tourLogs: [],
      createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
      modifiedAt: d.modifiedAt ? new Date(d.modifiedAt) : undefined
    };
  }
}