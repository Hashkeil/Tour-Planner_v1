import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tour } from '../../model/tour.model';
import { TourService } from '../../services/tour.service';
import { TourFormComponent } from '../tour-form/tour-form.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TourFormComponent, LucideAngularModule],
  templateUrl: './tour-list.component.html',
  styleUrl: './tour-list.component.css'
})
export class TourListComponent {
  private tourService = inject(TourService);
  private router = inject(Router);

  loading = signal(false);
  searchQuery = signal('');
  activeFilter = signal<string>('all');
  showForm = signal(false);
  editingTour = signal<Tour | undefined>(undefined);

  tours = computed(() => this.tourService.getTours());

  filteredTours = computed(() => {
    let result = this.tours();

    if (this.activeFilter() !== 'all') {
      result = result.filter(
        t => t.transportType.toLowerCase() === this.activeFilter()
      );
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.fromLocation.toLowerCase().includes(query) ||
          t.toLocation.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return result;
  });

  setFilter(type: string): void {
    this.activeFilter.set(type);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  openCreate(): void {
    this.editingTour.set(undefined);
    this.showForm.set(true);
  }

  openEdit(tour: Tour): void {
    this.editingTour.set(tour);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingTour.set(undefined);
  }

  onTourSaved(tour: Tour): void {
    this.closeForm();
  }

  deleteWithConfirm(tour: Tour): void {
    if (confirm(`Are you sure you want to delete "${tour.name}"?`)) {
      this.tourService.deleteTour(tour.id).subscribe({
        error: () => alert('Failed to delete tour. Please try again.')
      });
    }
  }

  goToDetail(tourId: number): void {
    this.router.navigate(['/tours', tourId]);
  }

  getIcon(transportType: string): string {
    const icons: Record<string, string> = {
      'bike': 'bike',
      'run': 'footprints',
      'hike': 'mountain',
      'vacation': 'plane'
    };
    return icons[transportType.toLowerCase()] || 'map-pin';
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
    if (!rating) return '—';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '⭐';
    stars += '☆'.repeat(emptyStars);
    return `${stars} ${rating.toFixed(1)}`;
  }
}
