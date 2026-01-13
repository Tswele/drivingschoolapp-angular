import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AdminService } from '../services/admin.service';
import { Booking, Instructor, LessonSlot, School } from '../models/types';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
    .modal-card {
      background: #fff;
      border-radius: 12px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 12px 32px rgba(0,0,0,0.18);
    }
  `],
  template: `
    <div *ngIf="!isAuthed" class="backdrop">
      <div class="modal-card">
        <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Admin sign-in</h5>
        </div>
        <form class="p-3" (ngSubmit)="login()">
          <div class="alert alert-info py-2 mb-3">
            <small><strong>Admin Login:</strong> Use username <code>admin</code> and password <code>admin</code><br>
            Or login as admin user: <code>admin&#64;example.com</code> / <code>admin</code></small>
          </div>
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input class="form-control" [(ngModel)]="loginForm.username" name="username" placeholder="admin" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" [(ngModel)]="loginForm.password" name="password" placeholder="admin" required>
          </div>
          <div *ngIf="loginError" class="alert alert-danger py-2">{{ loginError }}</div>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-primary" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="isAuthed" class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="h4 mb-1">Admin dashboard</h2>
          <p class="text-muted small mb-0">Manage schools, instructors, slots, and see bookings/reviews.</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm" (click)="logout()">Logout</button>
      </div>

      <div *ngIf="message" class="alert alert-success">{{ message }}</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div class="row g-3">
        <div class="col-md-6 d-flex flex-column">
          <div class="card shadow-sm flex-grow-1">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Schools</h5>
              <form class="row g-2 mb-3" (ngSubmit)="saveSchool()">
                <div class="col-6"><input class="form-control" [(ngModel)]="schoolForm.name" name="name" placeholder="Name" required></div>
                <div class="col-6"><input class="form-control" [(ngModel)]="schoolForm.city" name="city" placeholder="City"></div>
                <div class="col-12"><input class="form-control" [(ngModel)]="schoolForm.address" name="address" placeholder="Address"></div>
                <div class="col-6"><input class="form-control" [(ngModel)]="schoolForm.contactPhone" name="contactPhone" placeholder="Phone"></div>
                <div class="col-3"><input class="form-control" [(ngModel)]="schoolForm.pricePerLesson" name="price" type="number" placeholder="Price"></div>
                <div class="col-3"><input class="form-control" [(ngModel)]="schoolForm.defaultLessonMinutes" name="duration" type="number" placeholder="Minutes"></div>
                <div class="col-12"><textarea class="form-control" [(ngModel)]="schoolForm.description" name="desc" placeholder="Description"></textarea></div>
                <div class="col-12 text-end">
                  <button class="btn btn-primary btn-sm" type="submit">Add school</button>
                </div>
              </form>
              <div class="table-responsive flex-grow-1" style="max-height: 400px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Name</th>
                      <th>City</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of schools">
                      <td class="fw-semibold">{{ s.name }}</td>
                      <td class="text-muted">{{ s.city || '-' }}</td>
                      <td>{{ s.pricePerLesson ? ('R' + s.pricePerLesson) : '-' }}</td>
                      <td>{{ s.defaultLessonMinutes || '-' }} mins</td>
                      <td>
                        <button class="btn btn-outline-danger btn-sm" (click)="deleteSchool(s.id)">Delete</button>
                      </td>
                    </tr>
                    <tr *ngIf="schools.length === 0">
                      <td colspan="5" class="text-center text-muted small">No schools yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 d-flex flex-column">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title">Instructors</h5>
              <form class="row g-2 mb-3" (ngSubmit)="addInstructor()">
                <div class="col-4"><input class="form-control" [(ngModel)]="instForm.name" name="iname" placeholder="Name" required></div>
                <div class="col-4">
                  <select class="form-select" [(ngModel)]="instForm.schoolId" name="ischool" required>
                    <option value="">School</option>
                    <option *ngFor="let s of schools" [value]="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div class="col-4"><input class="form-control" [(ngModel)]="instForm.rating" name="irating" type="number" step="0.1" placeholder="Rating"></div>
                <div class="col-12"><input class="form-control" [(ngModel)]="instForm.bio" name="ibio" placeholder="Bio"></div>
                <div class="col-12 text-end">
                  <button class="btn btn-primary btn-sm" type="submit">Add instructor</button>
                </div>
              </form>
              <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Name</th>
                      <th>School</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let i of instructors">
                      <td class="fw-semibold">{{ i.name }}</td>
                      <td class="text-muted">{{ i.school?.name || '-' }}</td>
                      <td>{{ i.rating?.toFixed(1) || '-' }} ★</td>
                      <td>
                        <button class="btn btn-outline-danger btn-sm" (click)="deleteInstructor(i.id)">Delete</button>
                      </td>
                    </tr>
                    <tr *ngIf="instructors.length === 0">
                      <td colspan="4" class="text-center text-muted small">No instructors yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title">Slots</h5>
              <form class="row g-2 mb-3" (ngSubmit)="addSlot()">
                <div class="col-4">
                  <select class="form-select" [(ngModel)]="slotForm.instructorId" name="sinstructor" required>
                    <option value="">Instructor</option>
                    <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                  </select>
                </div>
                <div class="col-4"><input class="form-control" [(ngModel)]="slotForm.startTime" name="stime" type="datetime-local" required></div>
                <div class="col-2"><input class="form-control" [(ngModel)]="slotForm.durationMinutes" name="sduration" type="number" placeholder="Min" required></div>
                <div class="col-2"><input class="form-control" [(ngModel)]="slotForm.price" name="sprice" type="number" placeholder="Price" required></div>
                <div class="col-12 text-end">
                  <button class="btn btn-primary btn-sm" type="submit">Add slot</button>
                </div>
              </form>
              <div class="small text-muted">Use instructor list above to identify IDs.</div>
            </div>
          </div>

          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title">Driver Availability</h5>
              
              <!-- Month Management -->
              <div class="mb-3">
                <h6 class="small fw-bold mb-2">Month Management</h6>
                <form class="row g-2 mb-2" (ngSubmit)="enableDriverMonth()">
                  <div class="col-4">
                    <select class="form-select form-select-sm" [(ngModel)]="driverAvailForm.instructorId" name="dinstructor" required>
                      <option value="">Select Driver</option>
                      <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                    </select>
                  </div>
                  <div class="col-4">
                    <input class="form-control form-control-sm" [(ngModel)]="driverAvailForm.month" name="dmonth" type="month" required>
                  </div>
                  <div class="col-4">
                    <button class="btn btn-primary btn-sm w-100" type="submit">Enable Month</button>
                  </div>
                </form>
                <form class="row g-2 mb-2" (ngSubmit)="disableDriverMonth()">
                  <div class="col-4">
                    <select class="form-select form-select-sm" [(ngModel)]="driverAvailForm.instructorId" name="dinstructor2" required>
                      <option value="">Select Driver</option>
                      <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                    </select>
                  </div>
                  <div class="col-4">
                    <input class="form-control form-control-sm" [(ngModel)]="driverAvailForm.month" name="dmonth2" type="month" required>
                  </div>
                  <div class="col-4">
                    <button class="btn btn-danger btn-sm w-100" type="submit">Disable Month</button>
                  </div>
                </form>
                
                <!-- Month Status Display -->
                <div class="mt-3 p-2 bg-light rounded">
                  <div class="small fw-bold mb-2">View Month Status:</div>
                  <div class="row g-2 mb-2">
                    <div class="col-8">
                      <select class="form-select form-select-sm" [(ngModel)]="driverAvailForm.instructorId" (change)="loadDriverMonths()">
                        <option value="">Select Driver to View Status</option>
                        <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <button class="btn btn-sm btn-outline-secondary w-100" (click)="loadDriverMonths()" [disabled]="!driverAvailForm.instructorId">Refresh</button>
                    </div>
                  </div>
                  <div *ngIf="selectedDriverForMonths && driverMonths" class="mt-2">
                    <div class="small fw-bold mb-1">Status for {{ getInstructorName(selectedDriverForMonths) }}:</div>
                    <div class="d-flex flex-wrap gap-2 mb-2">
                      <span *ngFor="let month of driverMonths.enabled" 
                            class="badge bg-success">{{ formatMonth(month) }}</span>
                      <span *ngFor="let month of driverMonths.disabled" 
                            class="badge bg-danger">{{ formatMonth(month) }}</span>
                    </div>
                    <div class="small text-muted">
                      <span class="badge bg-success me-1">Green</span> = Enabled
                      <span class="badge bg-danger ms-2 me-1">Red</span> = Disabled
                    </div>
                  </div>
                </div>
              </div>

              <!-- Day Management -->
              <div class="mb-3">
                <h6 class="small fw-bold mb-2">Set Entire Day Unavailable</h6>
                <form class="row g-2" (ngSubmit)="setUnavailableDay()">
                  <div class="col-4">
                    <select class="form-select form-select-sm" [(ngModel)]="driverAvailForm.instructorId" name="dinstructor3" required>
                      <option value="">Select Driver</option>
                      <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                    </select>
                  </div>
                  <div class="col-4">
                    <input class="form-control form-control-sm" [(ngModel)]="driverAvailForm.unavailableDate" name="ddate" type="date" required>
                  </div>
                  <div class="col-4">
                    <button class="btn btn-warning btn-sm w-100" type="submit">Set Day Unavailable</button>
                  </div>
                </form>
              </div>

              <!-- Time Slot Management -->
              <div>
                <h6 class="small fw-bold mb-2">Set Specific Time Slot Unavailable</h6>
                <form class="row g-2 mb-2" (ngSubmit)="setUnavailableTimeSlot()">
                  <div class="col-3">
                    <select class="form-select form-select-sm" [(ngModel)]="timeSlotForm.instructorId" name="tinstructor" required>
                      <option value="">Driver</option>
                      <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                    </select>
                  </div>
                  <div class="col-3">
                    <input class="form-control form-control-sm" [(ngModel)]="timeSlotForm.date" name="tdate" type="date" required>
                  </div>
                  <div class="col-3">
                    <select class="form-select form-select-sm" [(ngModel)]="timeSlotForm.timeSlot" name="ttime" required>
                      <option value="">Time</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                  <div class="col-3">
                    <button class="btn btn-danger btn-sm w-100" type="submit">Mark Unavailable</button>
                  </div>
                </form>
                <form class="row g-2" (ngSubmit)="setAvailableTimeSlot()">
                  <div class="col-3">
                    <select class="form-select form-select-sm" [(ngModel)]="timeSlotForm.instructorId" name="tinstructor2" required>
                      <option value="">Driver</option>
                      <option *ngFor="let i of instructors" [value]="i.id">{{ i.name }}</option>
                    </select>
                  </div>
                  <div class="col-3">
                    <input class="form-control form-control-sm" [(ngModel)]="timeSlotForm.date" name="tdate2" type="date" required>
                  </div>
                  <div class="col-3">
                    <select class="form-select form-select-sm" [(ngModel)]="timeSlotForm.timeSlot" name="ttime2" required>
                      <option value="">Time</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                  <div class="col-3">
                    <button class="btn btn-success btn-sm w-100" type="submit">Mark Available</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-6 d-flex flex-column">
          <div class="card shadow-sm flex-grow-1">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Bookings</h5>
              <div class="table-responsive flex-grow-1" style="max-height: 400px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Date/Time</th>
                      <th>Status</th>
                      <th>Instructor</th>
                      <th>Learner</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let b of bookings">
                      <td class="small">{{ b.slot.startTime | date:'short' }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'bg-warning': b.status === 'PENDING',
                          'bg-success': b.status === 'CONFIRMED',
                          'bg-secondary': b.status === 'CANCELLED'
                        }">{{ b.status }}</span>
                      </td>
                      <td class="small">
                        <div>{{ b.slot.instructor?.name }}</div>
                        <div class="text-muted">{{ b.slot.instructor?.school?.name }}</div>
                      </td>
                      <td class="small">
                        <div>{{ b.learner.fullName }}</div>
                        <div class="text-muted" *ngIf="b.learner.email">{{ b.learner.email }}</div>
                        <div class="text-muted" *ngIf="b.learner.phone">{{ b.learner.phone }}</div>
                      </td>
                      <td class="small">
                        <div>{{ b.paymentMethod || 'n/a' }}</div>
                        <div class="text-muted" *ngIf="b.cardLast4">•••• {{ b.cardLast4 }}</div>
                      </td>
                    </tr>
                    <tr *ngIf="bookings.length === 0">
                      <td colspan="5" class="text-center text-muted small">No bookings yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 d-flex flex-column">
          <div class="card shadow-sm flex-grow-1">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Reviews</h5>
              <div class="table-responsive flex-grow-1" style="max-height: 400px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Rating</th>
                      <th>School</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of reviews">
                      <td class="fw-semibold">{{ r.rating }} ★</td>
                      <td>{{ r.school?.name || '-' }}</td>
                      <td class="text-muted small">{{ r.comment || '-' }}</td>
                    </tr>
                    <tr *ngIf="reviews.length === 0">
                      <td colspan="3" class="text-center text-muted small">No reviews yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private admin = inject(AdminService);
  private auth = inject(AuthService);

  schools: School[] = [];
  instructors: Instructor[] = [];
  bookings: Booking[] = [];
  reviews: any[] = [];
  message = '';
  error = '';
  isAuthed = false;
  loginForm = { username: '', password: '' };
  loginError = '';

  schoolForm: Partial<School> = {};
  instForm: any = { name: '', bio: '', rating: null, schoolId: null };
  slotForm: any = { instructorId: null, startTime: '', durationMinutes: 60, price: 350 };
  driverAvailForm: any = { instructorId: null, month: '', unavailableDate: '' };
  timeSlotForm: any = { instructorId: null, date: '', timeSlot: '' };
  selectedDriverForMonths: number | null = null;
  driverMonths: { enabled: string[]; disabled: string[] } | null = null;

  ngOnInit(): void {
    this.checkAuth();
    this.auth.currentUser$.subscribe(() => this.checkAuth());
  }

  private checkAuth(): void {
    const hasAdminFlag = localStorage.getItem('adminAuth') === 'true';
    const hasAdminUser = (this.auth.currentUser()?.role || '').toUpperCase() === 'ADMIN';
    this.isAuthed = hasAdminFlag || hasAdminUser;
    if (this.isAuthed) {
      this.refresh();
    }
  }

  refresh(): void {
    if (!this.isAuthed) return;
    this.message = '';
    this.error = '';
    this.api.getSchools().subscribe(s => (this.schools = s));
    this.admin.bookings().subscribe(b => (this.bookings = b));
    this.admin.reviews().subscribe(r => (this.reviews = r));
    // Load instructors per school
    this.api.getSchools().subscribe(schools => {
      this.instructors = [];
      schools.forEach(s => {
        this.api.getInstructorsBySchool(s.id).subscribe(inst => {
          this.instructors = [...this.instructors, ...inst];
        });
      });
    });
  }

  login(): void {
    this.loginError = '';
    if (this.loginForm.username === 'admin' && this.loginForm.password === 'admin') {
      this.isAuthed = true;
      localStorage.setItem('adminAuth', 'true');
      this.refresh();
    } else {
      this.loginError = 'Invalid credentials';
    }
  }

  logout(): void {
    this.isAuthed = false;
    localStorage.removeItem('adminAuth');
  }

  saveSchool(): void {
    if (!this.isAuthed) return;
    this.message = '';
    this.error = '';
    this.admin.createSchool(this.schoolForm).subscribe({
      next: () => {
        this.schoolForm = {};
        this.message = 'School added';
        this.refresh();
      },
      error: () => (this.error = 'Failed to add school')
    });
  }

  deleteSchool(id?: number): void {
    if (!id) return;
    this.message = '';
    this.error = '';
    this.admin.deleteSchool(id).subscribe({
      next: () => {
        this.message = 'School deleted';
        this.refresh();
      },
      error: () => (this.error = 'Failed to delete school')
    });
  }

  addInstructor(): void {
    if (!this.instForm.schoolId) return;
    this.message = '';
    this.error = '';
    this.admin.createInstructor(this.instForm).subscribe({
      next: () => {
        this.instForm = { name: '', bio: '', rating: null, schoolId: null };
        this.message = 'Instructor added';
        this.refresh();
      },
      error: () => (this.error = 'Failed to add instructor')
    });
  }

  deleteInstructor(id?: number): void {
    if (!id) return;
    this.message = '';
    this.error = '';
    this.admin.deleteInstructor(id).subscribe({
      next: () => {
        this.message = 'Instructor deleted';
        this.refresh();
      },
      error: () => (this.error = 'Failed to delete instructor')
    });
  }

  addSlot(): void {
    if (!this.slotForm.instructorId || !this.slotForm.startTime) return;
    this.message = '';
    this.error = '';
    // Ensure ISO string for LocalDateTime
    const startIso = this.slotForm.startTime.includes(':')
      ? this.slotForm.startTime
      : `${this.slotForm.startTime}:00`;
    this.admin.createSlot({
      instructorId: Number(this.slotForm.instructorId),
      startTime: startIso,
      durationMinutes: Number(this.slotForm.durationMinutes),
      price: Number(this.slotForm.price)
    }).subscribe({
      next: () => {
        this.slotForm = { instructorId: null, startTime: '', durationMinutes: 60, price: 350 };
        this.message = 'Slot added';
        this.refresh();
      },
      error: () => (this.error = 'Failed to add slot')
    });
  }

  enableDriverMonth(): void {
    if (!this.driverAvailForm.instructorId || !this.driverAvailForm.month) return;
    this.admin.enableDriverMonth(this.driverAvailForm.instructorId, this.driverAvailForm.month).subscribe({
      next: () => {
        this.message = 'Month enabled for driver';
        this.loadDriverMonths();
      },
      error: () => (this.error = 'Failed to enable month')
    });
  }

  disableDriverMonth(): void {
    if (!this.driverAvailForm.instructorId || !this.driverAvailForm.month) return;
    this.admin.disableDriverMonth(this.driverAvailForm.instructorId, this.driverAvailForm.month).subscribe({
      next: () => {
        this.message = 'Month disabled for driver';
        this.loadDriverMonths();
      },
      error: () => (this.error = 'Failed to disable month')
    });
  }

  setUnavailableDay(): void {
    if (!this.driverAvailForm.instructorId || !this.driverAvailForm.unavailableDate) return;
    this.admin.setUnavailableDay(this.driverAvailForm.instructorId, this.driverAvailForm.unavailableDate).subscribe({
      next: () => {
        this.message = 'Day set as unavailable';
        this.driverAvailForm = { instructorId: null, month: '', unavailableDate: '' };
        this.loadDriverMonths();
      },
      error: () => (this.error = 'Failed to set unavailable day')
    });
  }

  setUnavailableTimeSlot(): void {
    if (!this.timeSlotForm.instructorId || !this.timeSlotForm.date || !this.timeSlotForm.timeSlot) return;
    this.admin.setUnavailableTimeSlot(
      this.timeSlotForm.instructorId, 
      this.timeSlotForm.date, 
      this.timeSlotForm.timeSlot
    ).subscribe({
      next: () => {
        this.message = `Time slot ${this.timeSlotForm.timeSlot} on ${this.timeSlotForm.date} set as unavailable`;
        this.timeSlotForm = { instructorId: null, date: '', timeSlot: '' };
        this.loadDriverMonths();
      },
      error: () => (this.error = 'Failed to set unavailable time slot')
    });
  }

  setAvailableTimeSlot(): void {
    if (!this.timeSlotForm.instructorId || !this.timeSlotForm.date || !this.timeSlotForm.timeSlot) return;
    this.admin.setAvailableTimeSlot(
      this.timeSlotForm.instructorId, 
      this.timeSlotForm.date, 
      this.timeSlotForm.timeSlot
    ).subscribe({
      next: () => {
        this.message = `Time slot ${this.timeSlotForm.timeSlot} on ${this.timeSlotForm.date} set as available`;
        this.timeSlotForm = { instructorId: null, date: '', timeSlot: '' };
        this.loadDriverMonths();
      },
      error: () => (this.error = 'Failed to set available time slot')
    });
  }

  loadDriverMonths(): void {
    if (!this.driverAvailForm.instructorId) {
      this.selectedDriverForMonths = null;
      this.driverMonths = null;
      return;
    }
    this.selectedDriverForMonths = this.driverAvailForm.instructorId;
    this.admin.getDriverMonths(this.driverAvailForm.instructorId).subscribe({
      next: (months) => {
        this.driverMonths = months;
      },
      error: () => {
        this.error = 'Failed to load month status';
        this.driverMonths = null;
      }
    });
  }

  formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  getInstructorName(id: number): string {
    const inst = this.instructors.find(i => i.id === id);
    return inst?.name || `Driver ${id}`;
  }
}

