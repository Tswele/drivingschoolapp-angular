import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LessonSlot } from '../models/types';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
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
      max-width: 520px;
      width: 100%;
      box-shadow: 0 12px 32px rgba(0,0,0,0.18);
    }
  `],
  template: `
    <div *ngIf="open" class="backdrop" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Confirm booking</h5>
          <button type="button" class="btn btn-sm btn-outline-secondary" (click)="close()">×</button>
        </div>
        <form class="p-3" #form="ngForm" (ngSubmit)="confirm(form)">
          <ng-container *ngIf="slot">
            <div class="mb-2"><strong>{{ slot.instructor.name }}</strong> • {{ slot.instructor.school?.name }}</div>
            <div class="mb-1">When: <strong>{{ slot.startTime | date:'medium' }}</strong></div>
            <div class="mb-1">Duration: {{ slot.durationMinutes }} mins</div>
            <div class="mb-3">Price: <strong>R{{ slot.price }}</strong></div>
          </ng-container>
          <div class="mb-3">
            <label class="form-label">Full name</label>
            <input class="form-control" [(ngModel)]="fullName" name="fullName" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input class="form-control" [(ngModel)]="phone" name="phone" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Payment method</label>
            <div class="d-flex gap-3">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="payCash" value="CASH" [(ngModel)]="paymentMethod" required>
                <label class="form-check-label" for="payCash">Cash</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="payCard" value="CARD" [(ngModel)]="paymentMethod" required>
                <label class="form-check-label" for="payCard">Card</label>
              </div>
            </div>
          </div>
          <div class="mb-3" *ngIf="paymentMethod === 'CARD'">
            <label class="form-label">Card number</label>
            <input class="form-control" [(ngModel)]="cardNumber" name="cardNumber" maxlength="19" placeholder="**** **** **** 1234" required>
            <div class="form-text">We store only the last 4 digits.</div>
          </div>
          <div *ngIf="message" class="alert alert-info py-2 px-3 small mb-0">{{ message }}</div>
          <div class="p-3 border-top d-flex gap-2 justify-content-end">
            <button class="btn btn-light" type="button" (click)="close()" [disabled]="busy">Cancel</button>
            <button class="btn btn-primary" type="submit" [disabled]="busy || !slot || !form.valid">
              {{ busy ? 'Booking...' : 'Confirm booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BookingModalComponent {
  @Input() open = false;
  @Input() slot: LessonSlot | null = null;
  @Input() busy = false;
  @Input() message = '';

  @Output() confirmed = new EventEmitter<{ fullName: string; email: string; phone: string; paymentMethod: string; cardLast4: string | null }>();
  @Output() closed = new EventEmitter<void>();

  fullName = '';
  email = '';
  phone = '';
  paymentMethod: 'CASH' | 'CARD' | '' = '';
  cardNumber = '';

  confirm(form: NgForm): void {
    if (!this.slot || !form.valid) return;
    const last4 = this.paymentMethod === 'CARD' && this.cardNumber
      ? this.cardNumber.replace(/\s+/g, '').slice(-4)
      : null;
    this.confirmed.emit({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      paymentMethod: this.paymentMethod,
      cardLast4: last4
    });
  }

  close(): void {
    if (!this.busy) {
      this.closed.emit();
    }
  }
}

