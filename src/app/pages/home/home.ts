import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Report } from '../../models/report.model';
import { Zone } from '../../models/zone.model';
import { AuthService } from '../../services/auth.service';
import { ReportsService } from '../../services/reports.service';
import { ToastService } from '../../services/toast.service';
import { ZonesService } from '../../services/zones.service';
import { ReportCardComponent } from '../../shared/report-card/report-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReportCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  private zonesService = inject(ZonesService);
  private reportsService = inject(ReportsService);
  private toast = inject(ToastService);

  loading = signal(true);
  zones = signal<Zone[]>([]);
  reports = signal<Report[]>([]);

  ngOnInit(): void {
    this.zonesService.getAll(true).subscribe({
      next: (zones) => this.zones.set(zones),
      error: () => this.zones.set([]),
    });

    this.reportsService.getAll({ isActive: true }).subscribe({
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

  myZone(): Zone | null {
    const zoneId = this.auth.user()?.zoneId;
    if (!zoneId) {
      return null;
    }
    return this.zones().find((zone) => zone.id === zoneId) ?? null;
  }

  confirm(report: Report): void {
    this.reportsService.confirm(report.id).subscribe({
      next: (updated) => {
        this.reports.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.toast.success('Gracias, tu confirmación ayuda a priorizar el corte.');
      },
      error: (err) => this.toast.error(err.error?.error ?? 'No se pudo confirmar.'),
    });
  }
}
