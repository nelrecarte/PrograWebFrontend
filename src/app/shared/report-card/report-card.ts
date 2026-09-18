import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Report } from '../../models/report.model';
import { AuthService } from '../../services/auth.service';
import { StatusBadgeComponent } from '../status-badge/status-badge';

@Component({
  selector: 'app-report-card',
  imports: [RouterLink, DatePipe, StatusBadgeComponent],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css',
})
export class ReportCardComponent {
  @Input({ required: true }) report!: Report;
  @Input() allowConfirm = true;
  @Output() confirmed = new EventEmitter<Report>();

  private auth = inject(AuthService);

  canConfirm(): boolean {
    return (
      this.allowConfirm &&
      this.report.isActive &&
      !this.report.confirmedByMe &&
      this.report.reportedByUserId !== this.auth.userId()
    );
  }
}
