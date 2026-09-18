import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DuplicateReportData } from '../../models/report.model';
import { Zone } from '../../models/zone.model';
import { ReportsService } from '../../services/reports.service';
import { ToastService } from '../../services/toast.service';
import { ZonesService } from '../../services/zones.service';
import { localToIso } from '../../shared/date-utils';

@Component({
  selector: 'app-report-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './report-create.html',
  styleUrl: './report-create.css',
})
export class ReportCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private zonesService = inject(ZonesService);
  private reportsService = inject(ReportsService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  zones = signal<Zone[]>([]);
  duplicate = signal<DuplicateReportData | null>(null);

  form = this.fb.nonNullable.group({
    zoneId: ['', Validators.required],
    address: ['', [Validators.required, Validators.minLength(5)]],
    startedAt: [''],
    evidenceUrl: [''],
  });

  ngOnInit(): void {
    this.zonesService.getAll(true).subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error ?? 'No se pudieron cargar las zonas.');
      },
    });
  }

  zoneWithActiveCut(): Zone | null {
    const zoneId = this.form.controls.zoneId.value;
    const zone = this.zones().find((z) => z.id === zoneId);
    return zone && zone.activeReportId ? zone : null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.saving.set(true);

    this.reportsService
      .create({
        zoneId: values.zoneId,
        address: values.address,
        startedAt: localToIso(values.startedAt),
        evidenceUrl: values.evidenceUrl || undefined,
      })
      .subscribe({
        next: (report) => {
          this.saving.set(false);
          this.toast.success('Reporte enviado.');
          this.router.navigate(['/reportes', report.id]);
        },
        error: (err) => {
          this.saving.set(false);

          if (err.status === 409 && err.error?.code === 'reporte_duplicado') {
            this.duplicate.set(err.error.data);
            return;
          }
          this.toast.error(err.error?.error ?? 'No se pudo crear el reporte.');
        },
      });
  }

  confirmExisting(reportId: string): void {
    this.saving.set(true);
    this.reportsService.confirm(reportId).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Listo, tu confirmación quedó registrada.');
        this.router.navigate(['/reportes', reportId]);
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.error ?? 'No se pudo confirmar.');
      },
    });
  }
}
