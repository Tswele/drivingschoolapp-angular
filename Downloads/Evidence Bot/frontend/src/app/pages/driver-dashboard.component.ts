import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../services/driver.service';
import { ApiService } from '../services/api.service';
import { Booking, Instructor } from '../models/types';

@Component({
  standalone: true,
  selector: 'app-driver-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1">Driver Dashboard</h2>
          <p class="text-muted small mb-0">Manage your bookings and schedule</p>
        </div>
        <select class="form-select w-auto" [(ngModel)]="selectedInstructorId" (change)="loadBookings()">
          <option [value]="null">Select Driver</option>
          <option *ngFor="let inst of instructors" [value]="inst.id">{{ inst.name }}</option>
        </select>
      </div>

      <div *ngIf="selectedInstructorId && bookings.length" class="row g-3">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h5 class="mb-0">Today's Bookings</h5>
            </div>
            <div class="card-body">
              <div *ngFor="let booking of bookings" class="border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <div class="fw-semibold">{{ booking.slot.startTime | date:'medium' }}</div>
                    <div class="text-muted small mt-1">
                      Learner: {{ booking.learner.fullName }}
                      <span *ngIf="booking.learner.email"> • {{ booking.learner.email }}</span>
                      <span *ngIf="booking.learner.phone"> • {{ booking.learner.phone }}</span>
                    </div>
                    <div class="mt-2">
                      <span class="badge" [ngClass]="{
                        'bg-warning': booking.status === 'PENDING',
                        'bg-success': booking.status === 'CONFIRMED',
                        'bg-secondary': booking.status === 'CANCELLED'
                      }">{{ booking.status }}</span>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-semibold">R{{ booking.slot.price }}</div>
                    <div class="text-muted small">{{ booking.slot.durationMinutes }} mins</div>
                    <div *ngIf="booking.status === 'PENDING'" class="mt-2">
                      <button class="btn btn-success btn-sm me-1" (click)="confirmBooking(booking.id)">Confirm</button>
                      <button class="btn btn-danger btn-sm" (click)="rejectBooking(booking.id)">Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <h6 class="mb-0">Calendar View</h6>
            </div>
            <div class="card-body">
              <div class="small text-muted mb-2">Select month to view calendar</div>
              <input type="month" class="form-control mb-3" [(ngModel)]="selectedMonth" (change)="loadCalendar()">
              <div *ngIf="calendarData.length" class="small">
                <div *ngFor="let day of groupedDays" class="mb-2">
                  <strong>{{ day.date | date:'shortDate' }}</strong>
                  <div class="text-muted">
                    Available: {{ day.available }}, Booked: {{ day.booked }}, Locked: {{ day.locked }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="selectedInstructorId && !bookings.length" class="alert alert-info">
        No bookings found for this driver.
      </div>

      <div *ngIf="message" class="alert alert-success mt-3">{{ message }}</div>
      <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>
  `
})
export class DriverDashboardComponent implements OnInit {
  private driverService = inject(DriverService);
  private apiService = inject(ApiService);

  instructors: Instructor[] = [];
  selectedInstructorId: number | null = null;
  bookings: Booking[] = [];
  calendarData: any[] = [];
  selectedMonth: string = new Date().toISOString().slice(0, 7);
  message = '';
  error = '';

  ngOnInit(): void {
    this.apiService.getSchools().subscribe(schools => {
      schools.forEach(school => {
        this.apiService.getInstructorsBySchool(school.id).subscribe(insts => {
          this.instructors = [...this.instructors, ...insts];
        });
      });
    });
  }

  loadBookings(): void {
    if (!this.selectedInstructorId) {
      this.bookings = [];
      return;
    }
    this.error = '';
    this.message = '';
    this.driverService.getBookings(this.selectedInstructorId).subscribe({
      next: (bookings) => {
        this.bookings = bookings.sort((a, b) => 
          new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime()
        );
        if (this.bookings.length === 0) {
          this.message = 'No bookings found for this driver.';
        }
      },
      error: (err) => {
        this.error = 'Failed to load bookings: ' + (err.error?.message || err.message || 'Unknown error');
        this.bookings = [];
      }
    });
  }

  loadCalendar(): void {
    if (!this.selectedInstructorId) return;
    this.driverService.getCalendar(this.selectedInstructorId, this.selectedMonth).subscribe({
      next: (data) => {
        this.calendarData = data;
      },
      error: () => (this.error = 'Failed to load calendar')
    });
  }

  confirmBooking(bookingId: number): void {
    this.driverService.confirmBooking(bookingId).subscribe({
      next: () => {
        this.message = 'Booking confirmed';
        this.loadBookings();
        this.loadCalendar();
      },
      error: () => (this.error = 'Failed to confirm booking')
    });
  }

  rejectBooking(bookingId: number): void {
    this.driverService.rejectBooking(bookingId).subscribe({
      next: () => {
        this.message = 'Booking rejected';
        this.loadBookings();
        this.loadCalendar();
      },
      error: () => (this.error = 'Failed to reject booking')
    });
  }

  get groupedDays(): any[] {
    const grouped: Record<string, { date: string; available: number; booked: number; locked: number }> = {};
    this.calendarData.forEach(av => {
      const key = av.day;
      if (!grouped[key]) {
        grouped[key] = { date: key, available: 0, booked: 0, locked: 0 };
      }
      if (av.status === 'available') grouped[key].available++;
      else if (av.status === 'booked') grouped[key].booked++;
      else if (av.status === 'locked') grouped[key].locked++;
    });
    return Object.values(grouped);
  }
}

