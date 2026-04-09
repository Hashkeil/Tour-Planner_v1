import { Component, Input, PLATFORM_ID, AfterViewInit,
  inject, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-tour-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapEl class="tour-map"></div>`,
  styles: [`:host { display: block; } .tour-map { height: 400px; width: 100%; }`]
})
export class TourMapComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  @Input() fromLocation: string = '';
  @Input() toLocation: string = '';
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    try {
      const L = await import('leaflet');

      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.Marker.prototype.options.icon = icon;

      const from = L.latLng(48.2082, 16.3738);
      const to = L.latLng(48.22, 16.4);

      this.zone.runOutsideAngular(() => {
        const map = L.map(this.mapEl.nativeElement).setView(from, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker(from).bindPopup(`Start: ${this.fromLocation}`).addTo(map);
        L.marker(to).bindPopup(`End: ${this.toLocation}`).addTo(map);
        L.polyline([from, to], { color: '#4f7bff', weight: 5 }).addTo(map);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
    }
  }
}
