import { Component, computed, signal } from '@angular/core';
import { Tour } from '../model/tour.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true
})
export class DashboardComponent {
  tours = signal<Tour[]>([
    new Tour(1, 'Alpine Mountain Trail', 350, 7, 'alpine.jpg'),
    new Tour(2, 'Danube Cycle Path', 320, 5, 'City.jpg'),
    new Tour(3, 'City Highlights Tour', 25, 4, ''),
  ]);

  recentTours = computed(() => this.tours().slice(0, 3));

  totalDistnce = computed(() => this.tours().reduce((acc, tour) => acc + tour.distance, 0));
  totalDuration = computed(() => this.tours().reduce((acc, tour) => acc + tour.duration, 0));
  totalTours = computed(() => this.tours().length);

  addTour() {
    this.tours.update(current => [new Tour(current.length + 1, 'Added Tour', 100, 2, ''), ...current]);
  }



}


