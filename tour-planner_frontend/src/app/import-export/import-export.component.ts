import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../services/tour.service';
import { Tour } from '../model/tour.model';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.css'],
  imports: [CommonModule, LucideAngularModule]
})
export class ImportExportComponent implements OnInit {
  private tourService = inject(TourService);

  selectedFile: File | null = null;
  isDragover = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {}

  exportCSV(): void {
    try {
      const csv = this.tourService.exportToursAsCSV();
      this.downloadFile(csv, 'tours.csv', 'text/csv');
    } catch {
      this.errorMessage = 'Failed to export tours';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.validateFile();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateFile();
    }
  }

  validateFile(): void {
    if (!this.selectedFile) return;

    if (!this.selectedFile.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage = 'Invalid file type. Please select a CSV file.';
      this.selectedFile = null;
      return;
    }

    if (this.selectedFile.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size exceeds 5MB limit.';
      this.selectedFile = null;
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
  }

  importFile(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const tours = this.parseCSV(content);

        this.tourService.importToursFromJSON(JSON.stringify(tours)).subscribe({
          next: (count) => {
            this.successMessage = `Successfully imported ${count} tours`;
            this.selectedFile = null;
            this.isLoading = false;
            setTimeout(() => (this.successMessage = ''), 5000);
          },
          error: (err) => {
            this.errorMessage = err.error?.error ?? 'Import failed: invalid tour data';
            this.isLoading = false;
          }
        });
      } catch (err) {
        this.errorMessage = err instanceof Error ? err.message : 'Invalid file format';
        this.isLoading = false;
      }
    };

    reader.readAsText(this.selectedFile);
  }

  private parseCSV(csv: string): Tour[] {
    const lines = csv.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    const headers = lines[0].split(',').map(h =>
      h.trim().replace(/^"|"$/g, '').toLowerCase()
    );

    const tours: Tour[] = [];
    let nextId = Date.now();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim().replace(/^"|"$/g, '') ?? '';
      });

      // Map CSV columns exported by exportToursAsCSV() to Tour model fields
      const name          = row['name'] ?? '';
      const from          = row['from'] || row['fromlocation'] || '';
      const to            = row['to'] || row['tolocation'] || '';
      const type          = row['type'] || row['transporttype'] || 'hike';
      const distance      = parseFloat(row['distance (km)'] || row['distance'] || '0');
      const estimatedTime = parseInt(row['est. time (min)'] || row['estimatedtime'] || '0', 10);
      const averageRating = parseFloat(row['rating'] || row['averagerating'] || '0');

      if (!name || !distance) continue;

      tours.push({
        id: nextId++,
        name,
        fromLocation: from,
        toLocation: to,
        transportType: type as Tour['transportType'],
        distance,
        estimatedTime,
        averageRating,
        popularity: 0,
        childFriendliness: 0,
        tourLogs: []
      });
    }

    if (tours.length === 0) {
      throw new Error('No valid tours found. CSV must include "Name" and "Distance (km)" columns.');
    }

    return tours;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
