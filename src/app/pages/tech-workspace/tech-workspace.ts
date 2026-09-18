import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Report } from '../../models/report.model';
import { Technician } from '../../models/technician.model';
import { ReportsService } from '../../services/reports.service';
import { TechniciansService } from '../../services/technicians.service';
import { ToastService } from '../../services/toast.service';
import { ReportCardComponent } from '../../shared/report-card/report-card';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge';

@Component({
  selector: 'app-tech-workspace',
  imports: [RouterLink, ReportCardComponent, StatusBadgeComponent],
  templateUrl: './tech-workspace.html',
  styleUrl: './tech-workspace.css',
})
export class TechWorkspaceComponent implements OnInit {
  private techniciansService = inject(TechniciansService);
  private reportsService = inject(ReportsService);
  private toast = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  technician = signal<Technician | null>(null);
  assigned = signal<Report[]>([]);
  unassigned = signal<Report[]>([]);

  ngOnInit(): void {
    this.techniciansService.getMe().subscribe({
      next: (technician) => {
        this.technician.set(technician);
        this.loadReports(technician);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error ?? 'No se pudieron cargar tus datos de técnico.');
      },
    });
  }

  take(report: Report): void {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.reportsService.accept(report.id).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.unassigned.update((list) => list.filter((r) => r.id !== updated.id));
        this.assigned.update((list) => [updated, ...list]);
        this.toast.success('Tomaste el reporte. Ya podés registrar la resolución.');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.error ?? 'No se pudo tomar el reporte.');
      },
    });
  }

  private loadReports(technician: Technician): void {
    this.reportsService.getAll({ technicianId: technician.id }).subscribe({
      next: (reports) => this.assigned.set(reports),
      error: (err) => this.toast.error(err.error?.error ?? 'No se pudieron cargar tus reportes.'),
    });

    this.reportsService.getAll({ zoneId: technician.zoneId, isActive: true }).subscribe({
      next: (reports) => {
        this.unassigned.set(reports.filter((r) => !r.assignedTechnicianId));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error ?? 'No se pudieron cargar los reportes de tu zona.');
      },
    });
  }
}
