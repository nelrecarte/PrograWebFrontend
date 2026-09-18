import { Component, Input } from '@angular/core';
import { REPORT_STATUS_LABELS, ReportStatus } from '../../models/report.model';

const STATUS_CLASSES: Record<ReportStatus, string> = {
  nuevo: 'bg-slate-100 text-slate-700 ring-slate-200',
  en_verificacion: 'bg-amber-100 text-amber-800 ring-amber-200',
  confirmado: 'bg-orange-100 text-orange-800 ring-orange-200',
  resuelto: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: ReportStatus;

  label(): string {
    return REPORT_STATUS_LABELS[this.status];
  }

  classes(): string {
    return STATUS_CLASSES[this.status];
  }
}
