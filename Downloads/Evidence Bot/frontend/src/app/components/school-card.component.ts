import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Instructor, School } from '../models/types';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-school-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 class="card-title mb-1">{{ school.name }}</h5>
            <small class="text-muted">{{ school.city }}</small>
          </div>
          <span class="badge bg-warning text-dark">{{ (school.rating ?? 0).toFixed(1) }} ★</span>
        </div>
        <p class="card-text text-muted flex-grow-1">{{ school.description || 'No description yet.' }}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div>
            <div class="fw-semibold">
              {{ school.pricePerLesson ? ('R' + school.pricePerLesson + ' / lesson') : 'Price pending' }}
            </div>
            <small class="text-muted">{{ school.defaultLessonMinutes || 60 }} mins</small>
          </div>
          <button class="btn btn-primary btn-sm" (click)="viewDriverCalendar()">
            View Calendar
          </button>
        </div>
        <div class="mt-3 pt-3 border-top">
          <div *ngIf="loadingInstructors" class="small text-muted">Loading instructors...</div>
          <div *ngIf="!loadingInstructors && instructors.length > 0">
            <div class="small text-muted mb-2">
              <strong>{{ instructors.length }}</strong> instructor{{ instructors.length !== 1 ? 's' : '' }} available
            </div>
            <div *ngFor="let instructor of instructors" class="mb-2 p-2 bg-light rounded">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong class="small">{{ instructor.name }}</strong>
                  <span class="badge bg-light text-dark ms-2">{{ instructor.rating.toFixed(1) }} ★</span>
                </div>
              </div>
              <div class="small text-muted mb-2">{{ instructor.bio || 'No bio available' }}</div>
              <button class="btn btn-outline-primary btn-sm w-100" (click)="viewDriverCalendarForInstructor(instructor.id)">
                View Calendar & Book
              </button>
            </div>
          </div>
          <div *ngIf="!loadingInstructors && instructors.length === 0" class="small text-muted">
            No instructors available for this school.
          </div>
          <div *ngIf="error" class="small text-danger">{{ error }}</div>
        </div>
      </div>
    </div>

  `
})
export class SchoolCardComponent implements OnInit {
  @Input({ required: true }) school!: School;
  @Input() userId = 1; // demo user until auth is added

  error = '';
  instructors: Instructor[] = [];
  loadingInstructors = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadInstructors();
  }

  viewDriverCalendar(): void {
    if (this.instructors.length === 0) {
      this.loadInstructors();
      return;
    }
    // If only one instructor, go directly to their calendar
    if (this.instructors.length === 1) {
      this.router.navigate(['/book-driver', this.instructors[0].id]);
    } else {
      // If multiple instructors, go to book-driver page to select
      this.router.navigate(['/book-driver']);
    }
  }

  viewDriverCalendarForInstructor(instructorId: number): void {
    this.router.navigate(['/book-driver', instructorId]);
  }

  private loadInstructors(): void {
    if (this.instructors.length > 0) return;
    this.loadingInstructors = true;
    this.error = '';
    this.api.getInstructorsBySchool(this.school.id).subscribe({
      next: (instructors) => {
        this.instructors = instructors;
        this.loadingInstructors = false;
      },
      error: () => {
        this.error = 'Could not load instructors';
        this.loadingInstructors = false;
      }
    });
  }

}

