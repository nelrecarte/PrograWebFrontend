import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Report, ReportFilters } from '../../models/report.model';
import { Zone } from '../../models/zone.model';
import { ReportsService } from '../../services/reports.service';
import { ToastService } from '../../services/toast.service';
import { ZonesService } from '../../services/zones.service';
import { ReportCardComponent } from '../../shared/report-card/report-card';

@Component({
  selector: 'app-report-list',
  imports: [ReactiveFormsModule, RouterLink, ReportCardComponent],
  templateUrl: './report-list.html',
  styleUrl: './report-list.css',
})
export class ReportListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private zonesService = inject(ZonesService);
  private toast = inject(ToastService);

  loading = signal(true);
  zones = signal<Zone[]>([]);
  reports = signal<Report[]>([]);

  statuses = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'en_verificacion', label: 'En verificación' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'resuelto', label: 'Resuelto' },
  ];

  form = this.fb.nonNullable.group({
    zoneId: '',
    status: '',
    activity: 'abiertos',
  });

  ngOnInit(): void {
    this.zonesService.getAll().subscribe({
      next: (zones) => this.zones.set(zones),
      error: () => this.zones.set([]),
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);

    const values = this.form.getRawValue();
    const filters: ReportFilters = {
      zoneId: values.zoneId || undefined,
      status: values.status || undefined,
      isActive: values.activity === '' ? undefined : values.activity === 'abiertos',
    };

    this.reportsService.getAll(filters).subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error ?? 'No se pudieron cargar los reportes.');
      },
    });
  }

  confirm(report: Report): void {
    this.reportsService.confirm(report.id).subscribe({
      next: (updated) => {
        this.reports.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.toast.success('Confirmado. Gracias por avisar.');
      },
      error: (err) => this.toast.error(err.error?.error ?? 'No se pudo confirmar.'),
    });
  }
}
