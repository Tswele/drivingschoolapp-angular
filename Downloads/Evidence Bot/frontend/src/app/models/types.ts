export interface School {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  contactPhone: string;
  rating: number;
  pricePerLesson: number;
  defaultLessonMinutes: number;
}

export interface Instructor {
  id: number;
  name: string;
  bio: string;
  rating: number;
  school: School;
}

export interface LessonSlot {
  id: number;
  startTime: string;
  durationMinutes: number;
  price: number;
  available: boolean;
  instructor: Instructor;
}

export interface Booking {
  id: number;
  learner: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
  };
  slot: LessonSlot;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  cardLast4?: string | null;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  school: School;
}

export interface DriverAvailability {
  id: number;
  instructor: Instructor;
  month: string; // "2025-01"
  day: string; // "2025-01-12"
  timeSlot: string; // "08:00"
  status: 'available' | 'booked' | 'locked' | 'unavailable';
  isUnavailableDay: boolean;
}

