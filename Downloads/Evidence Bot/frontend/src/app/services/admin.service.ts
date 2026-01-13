import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, DriverAvailability, Instructor, LessonSlot, Review, School } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  createSchool(payload: Partial<School>): Observable<School> {
    return this.http.post<School>(`${this.baseUrl}/schools`, payload);
  }

  updateSchool(id: number, payload: Partial<School>): Observable<School> {
    return this.http.put<School>(`${this.baseUrl}/schools/${id}`, payload);
  }

  deleteSchool(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schools/${id}`);
  }

  createInstructor(payload: { name: string; bio?: string; rating?: number; schoolId: number }): Observable<Instructor> {
    return this.http.post<Instructor>(`${this.baseUrl}/instructors`, payload);
  }

  deleteInstructor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/instructors/${id}`);
  }

  createSlot(payload: { instructorId: number; startTime: string; durationMinutes: number; price: number }): Observable<LessonSlot> {
    return this.http.post<LessonSlot>(`${this.baseUrl}/slots`, payload);
  }

  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/slots/${id}`);
  }

  bookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`);
  }

  reviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews`);
  }

  enableDriverMonth(instructorId: number, month: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/drivers/${instructorId}/enable-month`, { month });
  }

  disableDriverMonth(instructorId: number, month: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/drivers/${instructorId}/disable-month/${month}`);
  }

  setUnavailableDay(instructorId: number, date: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/drivers/set-unavailable-day`, { instructorId, date });
  }

  getDriverAvailability(instructorId: number): Observable<DriverAvailability[]> {
    return this.http.get<DriverAvailability[]>(`${this.baseUrl}/drivers/${instructorId}/availability`);
  }

  getDriverMonths(instructorId: number): Observable<{ enabled: string[]; disabled: string[] }> {
    return this.http.get<{ enabled: string[]; disabled: string[] }>(`${this.baseUrl}/drivers/${instructorId}/months`);
  }

  setUnavailableTimeSlot(instructorId: number, date: string, timeSlot: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/drivers/${instructorId}/set-unavailable-timeslot`, { date, timeSlot });
  }

  setAvailableTimeSlot(instructorId: number, date: string, timeSlot: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/drivers/${instructorId}/set-available-timeslot`, { date, timeSlot });
  }
}

