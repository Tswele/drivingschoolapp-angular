import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AdminService } from '../services/admin.service';
import { DriverAvailability, Instructor } from '../models/types';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-book-driver',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <h2 class="h4 mb-4">Book a Driver</h2>

      <!-- Step 1: Select Driver -->
      <div class="card mb-3" *ngIf="step === 1">
        <div class="card-body">
          <h5 class="card-title">Step 1: Choose a Driver</h5>
          <div class="row g-3">
            <div class="col-md-4" *ngFor="let inst of instructors">
              <div class="card" [class.border-primary]="selectedInstructor?.id === inst.id" 
                   (click)="selectInstructor(inst)" style="cursor: pointer;">
                <div class="card-body">
                  <h6>{{ inst.name }}</h6>
                  <p class="small text-muted">{{ inst.bio }}</p>
                  <span class="badge bg-warning">{{ inst.rating }} ★</span>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-primary mt-3" [disabled]="!selectedInstructor" (click)="nextStep()">Next</button>
        </div>
      </div>

      <!-- Step 2: Select Month -->
      <div class="card mb-3" *ngIf="step === 2">
        <div class="card-body">
          <h5 class="card-title">Step 2: Select Month</h5>
          <div class="row g-2">
            <div class="col-md-3" *ngFor="let month of availableMonths">
              <button class="btn btn-outline-primary w-100" (click)="selectMonth(month)">
                {{ formatMonth(month) }}
              </button>
            </div>
          </div>
          <button class="btn btn-secondary mt-3" (click)="prevStep()">Back</button>
        </div>
      </div>

      <!-- Step 3: Select Day -->
      <div class="card mb-3" *ngIf="step === 3">
        <div class="card-body">
          <h5 class="card-title">Step 3: Select Day</h5>
          <div class="row g-2">
            <div class="col-md-2" *ngFor="let day of availableDays">
              <button class="btn w-100" 
                      [class.btn-primary]="selectedDay === day"
                      [class.btn-secondary]="isPastDay(day) || isFullyBooked(day)"
                      [disabled]="isPastDay(day) || isFullyBooked(day)"
                      (click)="selectDay(day)">
                {{ day | date:'d' }}<br>
                <small>{{ day | date:'EEE' }}</small>
              </button>
            </div>
          </div>
          <button class="btn btn-secondary mt-3" (click)="prevStep()">Back</button>
        </div>
      </div>

      <!-- Step 4: Select Time Slot -->
      <div class="card mb-3" *ngIf="step === 4">
        <div class="card-body">
          <h5 class="card-title">Step 4: Select Time Slot</h5>
          <div class="row g-2">
            <div class="col-md-3" *ngFor="let slot of availableTimeSlots">
              <button class="btn w-100"
                      [class.btn-success]="slot.status === 'available'"
                      [class.btn-secondary]="slot.status === 'booked'"
                      [class.btn-danger]="slot.status === 'unavailable'"
                      [class.text-decoration-line-through]="slot.status === 'unavailable'"
                      [disabled]="slot.status !== 'available'"
                      (click)="selectTimeSlot(slot)"
                      [title]="slot.status === 'unavailable' ? 'This time slot is unavailable' : (slot.status === 'booked' ? 'This time slot is already booked' : 'Available for booking')">
                {{ slot.timeSlot }}
                <small *ngIf="slot.status === 'booked'">(Booked)</small>
                <small *ngIf="slot.status === 'unavailable'">(Unavailable)</small>
              </button>
            </div>
          </div>
          <button class="btn btn-secondary mt-3" (click)="prevStep()">Back</button>
          <button class="btn btn-primary mt-3 ms-2" [disabled]="!selectedTimeSlot" (click)="nextStep()">Next</button>
        </div>
      </div>

      <!-- Step 5: Confirm Booking -->
      <div class="card mb-3" *ngIf="step === 5">
        <div class="card-body">
          <h5 class="card-title">Step 5: Confirm Booking</h5>
          <div class="mb-3">
            <strong>Driver:</strong> {{ selectedInstructor?.name }}<br>
            <strong>Date:</strong> {{ selectedDay | date:'fullDate' }}<br>
            <strong>Time:</strong> {{ selectedTimeSlot?.timeSlot }}
          </div>
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input class="form-control" [(ngModel)]="learnerDetails.fullName" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="learnerDetails.email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input class="form-control" [(ngModel)]="learnerDetails.phone" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Payment Method</label>
            <div>
              <input type="radio" id="cash" value="CASH" [(ngModel)]="learnerDetails.paymentMethod" name="payment" required>
              <label for="cash" class="ms-2">Cash</label>
              <input type="radio" id="card" value="CARD" [(ngModel)]="learnerDetails.paymentMethod" name="payment" class="ms-3" required>
              <label for="card">Card</label>
            </div>
          </div>
          <div class="mb-3" *ngIf="learnerDetails.paymentMethod === 'CARD'">
            <label class="form-label">Card Number (last 4 digits)</label>
            <input class="form-control" [(ngModel)]="learnerDetails.cardLast4" name="cardLast4" maxlength="4" placeholder="1234" required>
          </div>
          <button class="btn btn-secondary" (click)="prevStep()">Back</button>
          <button class="btn btn-primary ms-2" (click)="confirmBooking()" [disabled]="bookingInProgress">
            {{ bookingInProgress ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>

      <div *ngIf="message" class="alert alert-success">{{ message }}</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
    </div>
  `
})
export class BookDriverComponent implements OnInit {
  private apiService = inject(ApiService);
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  step = 1;
  instructors: Instructor[] = [];
  selectedInstructor: Instructor | null = null;
  availableMonths: string[] = [];
  selectedMonth: string = '';
  availableDays: Date[] = [];
  selectedDay: Date | null = null;
  availableTimeSlots: any[] = [];
  selectedTimeSlot: any = null;
  learnerDetails = { fullName: '', email: '', phone: '', paymentMethod: 'CASH', cardLast4: '' };
  bookingInProgress = false;
  message = '';
  error = '';

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.learnerDetails.fullName = user.fullName;
      this.learnerDetails.email = user.email;
      this.learnerDetails.phone = user.phone || '';
    }
    
    // Check if instructor ID is provided in route
    this.route.params.subscribe(params => {
      const instructorId = params['instructorId'];
      if (instructorId) {
        const id = Number(instructorId);
        // Load instructors and then select the one with matching ID
        this.loadInstructors(() => {
          const instructor = this.instructors.find(inst => inst.id === id);
          if (instructor) {
            this.selectInstructor(instructor);
            this.nextStep(); // Skip to step 2 (month selection)
          }
        });
      } else {
        this.loadInstructors();
      }
    });
  }

  loadInstructors(callback?: () => void): void {
    this.apiService.getSchools().subscribe(schools => {
      this.instructors = [];
      let remaining = schools.length;
      if (remaining === 0 && callback) {
        callback();
        return;
      }
      schools.forEach(school => {
        this.apiService.getInstructorsBySchool(school.id).subscribe(insts => {
          this.instructors = [...this.instructors, ...insts];
          remaining--;
          if (remaining === 0 && callback) {
            callback();
          }
        });
      });
    });
  }

  selectInstructor(inst: Instructor): void {
    this.selectedInstructor = inst;
  }

  nextStep(): void {
    if (this.step === 1 && this.selectedInstructor) {
      this.loadAvailableMonths();
      this.step = 2;
    } else if (this.step === 2 && this.selectedMonth) {
      this.loadAvailableDays();
      this.step = 3;
    } else if (this.step === 3 && this.selectedDay) {
      this.loadTimeSlots();
      this.step = 4;
    } else if (this.step === 4 && this.selectedTimeSlot) {
      this.step = 5;
    }
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  loadAvailableMonths(): void {
    if (!this.selectedInstructor) return;
    this.adminService.getDriverAvailability(this.selectedInstructor.id).subscribe({
      next: (availabilities) => {
        const months = [...new Set(availabilities.map(a => a.month))];
        this.availableMonths = months.sort();
      },
      error: () => (this.error = 'Failed to load available months')
    });
  }

  selectMonth(month: string): void {
    this.selectedMonth = month;
    this.nextStep();
  }

  formatMonth(monthStr: string): string {
    // monthStr is in format "YYYY-MM"
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  loadAvailableDays(): void {
    if (!this.selectedInstructor || !this.selectedMonth) return;
    this.adminService.getDriverAvailability(this.selectedInstructor.id).subscribe({
      next: (availabilities) => {
        const monthAvail = availabilities.filter(a => a.month === this.selectedMonth && !a.isUnavailableDay);
        const days = [...new Set(monthAvail.map(a => a.day))].map(d => new Date(d));
        this.availableDays = days.sort((a, b) => a.getTime() - b.getTime());
      },
      error: () => (this.error = 'Failed to load available days')
    });
  }

  selectDay(day: Date): void {
    if (this.isPastDay(day) || this.isFullyBooked(day)) return;
    this.selectedDay = day;
    this.nextStep();
  }

  isPastDay(day: Date): boolean {
    return day < new Date(new Date().setHours(0, 0, 0, 0));
  }

  isFullyBooked(day: Date): boolean {
    // Simplified check - would need to check all slots for the day
    return false;
  }

  loadTimeSlots(): void {
    if (!this.selectedInstructor || !this.selectedDay) return;
    const dayStr = this.selectedDay.toISOString().split('T')[0];
    this.adminService.getDriverAvailability(this.selectedInstructor.id).subscribe({
      next: (availabilities) => {
        const dayAvail = availabilities.filter(a => a.day === dayStr);
        const slots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        this.availableTimeSlots = slots.map(time => {
          const av = dayAvail.find(a => a.timeSlot === time);
          return {
            timeSlot: time,
            status: av ? av.status : 'unavailable',
            availabilityId: av?.id
          };
        });
      },
      error: () => (this.error = 'Failed to load time slots')
    });
  }

  selectTimeSlot(slot: any): void {
    if (slot.status === 'available') {
      this.selectedTimeSlot = slot;
    }
  }

  confirmBooking(): void {
    if (!this.selectedInstructor || !this.selectedDay || !this.selectedTimeSlot) return;
    if (!this.learnerDetails.fullName || !this.learnerDetails.email || !this.learnerDetails.phone || !this.learnerDetails.paymentMethod) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    this.bookingInProgress = true;
    this.error = '';
    this.message = '';
    
    const user = this.authService.currentUser();
    const dateStr = this.selectedDay.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const cardLast4 = this.learnerDetails.paymentMethod === 'CARD' && this.learnerDetails.cardLast4
      ? this.learnerDetails.cardLast4.slice(-4)
      : null;
    
    this.apiService.createBookingFromDriverAvailability({
      userId: user?.id,
      instructorId: this.selectedInstructor.id,
      date: dateStr,
      timeSlot: this.selectedTimeSlot.timeSlot,
      fullName: this.learnerDetails.fullName,
      email: this.learnerDetails.email,
      phone: this.learnerDetails.phone,
      paymentMethod: this.learnerDetails.paymentMethod,
      cardLast4: cardLast4
    }).subscribe({
      next: (booking) => {
        this.message = `Booking created successfully! Status: ${booking.status}. Waiting for driver confirmation.`;
        this.bookingInProgress = false;
        // Reset form after 3 seconds
        setTimeout(() => {
          this.step = 1;
          this.selectedInstructor = null;
          this.selectedMonth = '';
          this.selectedDay = null;
          this.selectedTimeSlot = null;
          this.learnerDetails = { fullName: '', email: '', phone: '', paymentMethod: 'CASH', cardLast4: '' };
          const user = this.authService.currentUser();
          if (user) {
            this.learnerDetails.fullName = user.fullName;
            this.learnerDetails.email = user.email;
            this.learnerDetails.phone = user.phone || '';
          }
        }, 3000);
      },
      error: (err) => {
        let errorMessage = 'Failed to create booking';
        if (err.error) {
          if (typeof err.error === 'string') {
            try {
              const errorObj = JSON.parse(err.error);
              errorMessage = errorObj.error || errorMessage;
            } catch {
              errorMessage = err.error;
            }
          } else if (err.error.error) {
            errorMessage = err.error.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.error = errorMessage;
        this.bookingInProgress = false;
        console.error('Booking error:', err);
      }
    });
  }
}

