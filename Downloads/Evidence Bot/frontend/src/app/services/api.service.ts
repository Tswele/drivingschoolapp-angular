import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, Instructor, LessonSlot, School } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getSchools(city?: string, q?: string): Observable<School[]> {
    const params: Record<string, string> = {};
    if (city) params['city'] = city;
    if (q) params['q'] = q;
    return this.http.get<School[]>(`${this.baseUrl}/schools`, { params });
  }

  getInstructorsBySchool(schoolId: number): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(`${this.baseUrl}/schools/${schoolId}/instructors`);
  }

  getSlots(instructorId: number): Observable<LessonSlot[]> {
    return this.http.get<LessonSlot[]>(`${this.baseUrl}/instructors/${instructorId}/slots`);
  }

  createBooking(payload: {
    userId?: number;
    slotId: number;
    fullName?: string;
    email?: string;
    phone?: string;
    paymentMethod?: string;
    cardLast4?: string | null;
  }): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, payload);
  }

  createBookingFromDriverAvailability(payload: {
    userId?: number;
    instructorId: number;
    date: string; // YYYY-MM-DD
    timeSlot: string; // HH:MM
    fullName?: string;
    email?: string;
    phone?: string;
    paymentMethod?: string;
    cardLast4?: string | null;
  }): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/driver-availability`, payload);
  }

  getBookingsForUser(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/users/${userId}/bookings`);
  }

  cancelBooking(bookingId: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${bookingId}/cancel`, {});
  }
}

