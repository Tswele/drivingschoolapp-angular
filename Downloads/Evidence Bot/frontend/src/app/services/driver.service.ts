import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, DriverAvailability } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly baseUrl = `${environment.apiUrl}/driver`;

  constructor(private http: HttpClient) {}

  getBookings(instructorId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/${instructorId}/bookings`);
  }

  getBookingsByDay(instructorId: number, date: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/${instructorId}/bookings/day/${date}`);
  }

  confirmBooking(bookingId: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${bookingId}/confirm`, {});
  }

  rejectBooking(bookingId: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings/${bookingId}/reject`, {});
  }

  getCalendar(instructorId: number, month: string): Observable<DriverAvailability[]> {
    return this.http.get<DriverAvailability[]>(`${this.baseUrl}/${instructorId}/calendar/${month}`);
  }
}

