import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Report } from '../../models/report.model';
import { Technician } from '../../models/technician.model';
import { AuthService } from '../../services/auth.service';
import { ReportsService } from '../../services/reports.service';
import { TechniciansService } from '../../services/technicians.service';
import { ToastService } from '../../services/toast.service';
import { localToIso } from '../../shared/date-utils';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge';

@Component({
  selector: 'app-report-detail',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe, StatusBadgeComponent],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.css',
})
export class ReportDetailComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private reportsService = inject(ReportsService);
  private techniciansService = inject(TechniciansService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  reportId = this.route.snapshot.paramMap.get('id') ?? '';

  loading = signal(true);
  saving = signal(false);
  report = signal<Report | null>(null);
  technicians = signal<Technician[]>([]);

  resolutionForm = this.fb.nonNullable.group({
    cause: ['', [Validators.required, Validators.minLength(3)]],
    detail: ['', [Validators.required, Validators.minLength(10)]],
    estimatedMinutes: [60, Validators.required],
    restoredAt: [''],
  });

  ngOnInit(): void {
    this.load();

    if (this.auth.isAdmin()) {
      this.techniciansService.getAll().subscribe({
        next: (techs) => this.technicians.set(techs),
        error: () => this.technicians.set([]),
      });
    }
  }

  canConfirm(): boolean {
    const r = this.report();
    return !!r && r.isActive && !r.confirmedByMe && r.reportedByUserId !== this.auth.userId();
  }

  canAccept(): boolean {
    const r = this.report();
    return !!r && this.auth.isTecnico() && r.isActive && !r.assignedTechnicianId;
  }

  canChangeStatus(): boolean {
    const r = this.report();
    return !!r && r.isActive && (this.auth.isAdmin() || this.auth.isTecnico());
  }

  canResolve(): boolean {
    const r = this.report();
    return !!r && this.auth.isTecnico() && r.isActive && r.resolution === null;
  }

  confirm(): void {
    this.saving.set(true);
    this.reportsService.confirm(this.reportId).subscribe({
      next: (updated) => this.done(updated, 'Confirmado. Gracias por avisar.'),
      error: (err) => this.failed(err, 'No se pudo confirmar.'),
    });
  }

  accept(): void {
    this.saving.set(true);
    this.reportsService.accept(this.reportId).subscribe({
      next: (updated) => this.done(updated, 'Tomaste el reporte.'),
      error: (err) => this.failed(err, 'No se pudo tomar el reporte.'),
    });
  }

  changeStatus(status: string): void {
    this.saving.set(true);
    this.reportsService.changeStatus(this.reportId, status).subscribe({
      next: (updated) => this.done(updated, 'Estado actualizado.'),
      error: (err) => this.failed(err, 'No se pudo cambiar el estado.'),
    });
  }

  assign(technicianId: string): void {
    if (!technicianId) {
      this.toast.error('Elegí un técnico primero.');
      return;
    }

    this.saving.set(true);
    this.reportsService.assign(this.reportId, technicianId).subscribe({
      next: (updated) => this.done(updated, 'Técnico asignado.'),
      error: (err) => this.failed(err, 'No se pudo asignar el técnico.'),
    });
  }

  resolve(): void {
    if (this.resolutionForm.invalid) {
      this.resolutionForm.markAllAsTouched();
      return;
    }

    const values = this.resolutionForm.getRawValue();
    this.saving.set(true);

    this.reportsService
      .resolve(this.reportId, {
        cause: values.cause,
        detail: values.detail,
        estimatedMinutes: Number(values.estimatedMinutes),
        restoredAt: localToIso(values.restoredAt),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Corte cerrado. Gracias.');
          this.resolutionForm.reset({ cause: '', detail: '', estimatedMinutes: 60, restoredAt: '' });
          this.load();
        },
        error: (err) => this.failed(err, 'No se pudo registrar la resolución.'),
      });
  }

  private load(): void {
    this.loading.set(true);
    this.reportsService.getById(this.reportId).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.report.set(null);
        this.toast.error(err.error?.error ?? 'No se pudo cargar el reporte.');
      },
    });
  }

  private done(updated: Report, message: string): void {
    this.saving.set(false);
    this.report.set(updated);
    this.toast.success(message);
  }

  private failed(err: any, fallback: string): void {
    this.saving.set(false);
    this.toast.error(err.error?.error ?? fallback);
  }
}
