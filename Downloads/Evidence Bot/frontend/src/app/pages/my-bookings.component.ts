import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Observable, of } from 'rxjs';
import { Booking } from '../models/types';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-my-bookings',
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="h4 mb-1">My bookings</h2>
          <p class="text-muted small mb-0">Showing upcoming and past bookings.</p>
        </div>
        <div *ngIf="currentUser">
          <button class="btn btn-outline-secondary btn-sm me-2" (click)="refresh()">Refresh</button>
          <button class="btn btn-outline-danger btn-sm" (click)="logout()">Logout</button>
        </div>
      </div>

      <ng-container *ngIf="bookings$ | async as bookings; else loading">
        <div *ngIf="bookings.length; else empty">
          <div *ngFor="let booking of bookings" class="card mb-3 shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-semibold">{{ booking.slot.startTime | date:'medium' }}</div>
                <div class="text-muted small">
                  {{ booking.slot.instructor?.name }} • {{ booking.slot.instructor?.school?.name }}
                </div>
                <div class="text-muted small mt-1">
                  Learner: {{ booking.learner.fullName }}
                  <span *ngIf="booking.learner.email"> • {{ booking.learner.email }}</span>
                  <span *ngIf="booking.learner.phone"> • {{ booking.learner.phone }}</span>
                </div>
                <div class="badge bg-light text-dark mt-2">{{ booking.status }}</div>
                <div class="small mt-1">
                  Payment: {{ booking.paymentMethod || 'n/a' }}
                  <span *ngIf="booking.cardLast4"> • card •••• {{ booking.cardLast4 }}</span>
                </div>
              </div>
              <div class="text-end">
                <div class="fw-semibold">R{{ booking.slot.price }}</div>
                <div class="text-muted small">{{ booking.slot.durationMinutes }} mins</div>
                <button
                  class="btn btn-outline-danger btn-sm mt-2"
                  [disabled]="booking.status !== 'CONFIRMED' || cancelling()"
                  (click)="cancel(booking)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="text-muted">Loading bookings...</div>
      </ng-template>

      <ng-template #empty>
        <div class="alert alert-info mb-0">No bookings yet. Find a school and book a slot to see it here.</div>
      </ng-template>
    </div>
  `
})
export class MyBookingsComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  currentUser = this.auth.currentUser();
  bookings$: Observable<Booking[]> = this.loadBookings();
  cancelling = signal(false);

  constructor() {
    this.auth.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.refresh();
    });
  }

  private loadBookings(): Observable<Booking[]> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return of([]);
    }
    return this.api.getBookingsForUser(userId);
  }

  cancel(booking: Booking): void {
    if (booking.status !== 'CONFIRMED') return;
    this.cancelling.set(true);
    // Optimistic UI update
    booking.status = 'CANCELLED';
    booking.slot.available = true;
    this.api.cancelBooking(booking.id).subscribe({
      next: () => {
        this.refresh();
      },
      error: () => {
        // rollback in case of failure
        booking.status = 'CONFIRMED';
        booking.slot.available = false;
      },
      complete: () => this.cancelling.set(false)
    });
  }

  refresh(): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.bookings$ = this.api.getBookingsForUser(userId);
    } else {
      this.bookings$ = of([]);
    }
  }

  logout(): void {
    this.auth.setUser(null);
    this.currentUser = null;
    this.refresh();
  }
}

