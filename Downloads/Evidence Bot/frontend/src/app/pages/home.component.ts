import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Booking, School } from '../models/types';
import { SchoolCardComponent } from '../components/school-card.component';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, SchoolCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private api = inject(ApiService);

  loading = signal(false);
  searchTerm = '';
  city = '';

  schools$: Observable<School[]> = this.api.getSchools();
  bookings$: Observable<Booking[]> = this.api.getBookingsForUser(1);

  onSearch(): void {
    this.loading.set(true);
    const city = this.city.trim() || undefined;
    const q = this.searchTerm.trim() || undefined;
    this.schools$ = this.api.getSchools(city, q);
    this.loading.set(false);
  }
}

