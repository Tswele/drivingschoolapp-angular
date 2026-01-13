import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { MyBookingsComponent } from './pages/my-bookings.component';
import { AdminComponent } from './pages/admin.component';
import { DriverDashboardComponent } from './pages/driver-dashboard.component';
import { BookDriverComponent } from './pages/book-driver.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'bookings', component: MyBookingsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'driver', component: DriverDashboardComponent },
  { path: 'book-driver', component: BookDriverComponent },
  { path: 'book-driver/:instructorId', component: BookDriverComponent },
  { path: '**', redirectTo: '' }
];

