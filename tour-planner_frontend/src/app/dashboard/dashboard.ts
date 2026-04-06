import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tour } from '../model/tour.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  tours = signal<Tour[]>([
    {
      id: 1,
      name: 'Alpine Mountain Trail',
      description: 'Beautiful alpine hiking route',
      fromLocation: 'Innsbruck',
      toLocation: 'Zillertal',
      transportType: 'hike',
      distance: 350,
      estimatedTime: 7,
      image: 'alpine.jpg',
      popularity: 0,
      childFriendliness: 0,
      averageRating: 0
    },
    {
      id: 2,
      name: 'Danube Cycle Path',
      description: 'Scenic cycling tour along the Danube',
      fromLocation: 'Vienna',
      toLocation: 'Passau',
      transportType: 'bike',
      distance: 320,
      estimatedTime: 5,
      image: 'city.jpg',
      popularity: 0,
      childFriendliness: 0,
      averageRating: 0
    },
    {
      id: 3,
      name: 'City Highlights Tour',
      description: 'Explore the most important city spots',
      fromLocation: 'City Center',
      toLocation: 'Old Town',
      transportType: 'run',
      distance: 25,
      estimatedTime: 4,
      image: '',
      popularity: 0,
      childFriendliness: 0,
      averageRating: 0
    }
  ]);

  recentTours = computed(() => this.tours().slice(0, 3));
  totalDistance = computed(() =>
    this.tours().reduce((acc, tour) => acc + (tour.distance ?? 0), 0)
  );
  totalDuration = computed(() =>
    this.tours().reduce((acc, tour) => acc + (tour.estimatedTime ?? 0), 0)
  );
  totalTours = computed(() => this.tours().length);

  addTour(): void {
    const newTour: Tour = {
      averageRating: 0, childFriendliness: 0, popularity: 0,
      id: this.tours().length + 1,
      name: 'Added Tour',
      description: 'Newly created tour',
      fromLocation: 'Start',
      toLocation: 'Destination',
      transportType: 'hike',
      distance: 100,
      estimatedTime: 2,
      image: ''
    };

    this.tours.update(current => [newTour, ...current]);
  }
}
