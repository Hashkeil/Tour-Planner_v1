import { Injectable, signal } from '@angular/core';
import { Tour, TourLog } from '../model/tour.model';


@Injectable({
  providedIn: 'root'
})
export class TourService {
  private tours = signal<Tour[]>([
    {
      id: 1,
      name: 'Alpine Mountain Trail',
      description: 'Scenic mountain hiking trail with stunning views and moderate difficulty.',
      fromLocation: 'Salzburg, Austria',
      toLocation: 'Hallstatt, Austria',
      transportType: 'hike',
      distance: 25.5,
      estimatedTime: 360,
      popularity: 4,
      childFriendliness: 3,
      averageRating: 4.5,
      image: '/alpine.jpg',
      tourLogs: []
    },
    {
      id: 2,
      name: 'City Cycle Tour',
      description: 'Explore the historic city center on two wheels. Easy and family-friendly.',
      fromLocation: 'Vienna, Austria',
      toLocation: 'Vienna, Austria',
      transportType: 'bike',
      distance: 15.2,
      estimatedTime: 120,
      popularity: 8,
      childFriendliness: 5,
      averageRating: 4.8,
      image: '/City.jpg',
      tourLogs: []
    },
    {
      id: 3,
      name: 'Mountain Trail Run',
      description: 'Challenging trail run for experienced runners with elevation gains.',
      fromLocation: 'Innsbruck, Austria',
      toLocation: 'Stubai Valley, Austria',
      transportType: 'run',
      distance: 12.0,
      estimatedTime: 90,
      popularity: 3,
      childFriendliness: 1,
      averageRating: 4.2,
      tourLogs: []
    },
    {
      id: 4,
      name: 'European Adventure',
      description: 'Multi-day vacation route connecting multiple European cities.',
      fromLocation: 'Prague, Czech Republic',
      toLocation: 'Berlin, Germany',
      transportType: 'vacation',
      distance: 350.0,
      estimatedTime: 480,
      popularity: 2,
      childFriendliness: 4,
      averageRating: 4.9,
      tourLogs: []
    }
  ]);

  constructor() {}


  getTours() {return this.tours();}
  getTourById(id: number): Tour | undefined {return this.tours().find(t => t.id === id);}

  createTour(tour: Omit<Tour, 'id' | 'popularity' | 'tourLogs'>): Tour {
    const newTour: Tour = {
      ...tour,
      id: Math.max(...this.tours().map(t => t.id), 0) + 1,
      popularity: 0,
      tourLogs: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    this.tours.update(tours => [...tours, newTour]);
    return newTour;
  }

  updateTour(id: number, updates: Partial<Tour>): Tour | undefined {
    const index = this.tours().findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const updated: Tour = {
      ...this.tours()[index],
      ...updates,
      modifiedAt: new Date()
    };

    this.tours.update(tours => {
      const newTours = [...tours];
      newTours[index] = updated;
      return newTours;
    });

    return updated;
  }


  deleteTour(id: number): boolean {
    const index = this.tours().findIndex(t => t.id === id);
    if (index === -1) return false;

    this.tours.update(tours => tours.filter(t => t.id !== id));
    return true;
  }


  searchTours(query: string): Tour[] {
    const lower = query.toLowerCase();
    return this.tours().filter(t =>
      t.name.toLowerCase().includes(lower) ||
      t.fromLocation.toLowerCase().includes(lower) ||
      t.toLocation.toLowerCase().includes(lower) ||
      t.description?.toLowerCase().includes(lower)
    );
  }


  filterByTransportType(type: string): Tour[] {
    if (type === 'all') return this.tours();
    return this.tours().filter(t => t.transportType === type);
  }


  exportToursAsJSON(): string {
    return JSON.stringify(this.tours(), null, 2);
  }


  importToursFromJSON(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as Tour[];
      if (!Array.isArray(imported)) return false;

      // Validate structure
      const isValid = imported.every(t =>
        t.id && t.name && t.fromLocation && t.toLocation && t.transportType && t.distance !== undefined
      );

      if (!isValid) return false;

      // Merge without duplicates (by name)
      const existing = this.tours();
      const toAdd = imported.filter(imp => !existing.some(ex => ex.name === imp.name));

      this.tours.update(tours => [...tours, ...toAdd]);
      return true;
    } catch {
      return false;
    }
  }


  exportToursAsCSV(): string {
    const tours = this.tours();
    const headers = ['ID', 'Name', 'From', 'To', 'Type', 'Distance (km)', 'Est. Time (min)', 'Rating'];
    const rows = tours.map(t => [
      t.id,
      t.name,
      t.fromLocation,
      t.toLocation,
      t.transportType,
      t.distance,
      t.estimatedTime,
      t.averageRating
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    return csv;
  }
}

