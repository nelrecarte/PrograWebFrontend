import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Report } from '../../models/report.model';
import { ReportsService } from '../../services/reports.service';
import { ToastService } from '../../services/toast.service';
import { ReportCardComponent } from '../../shared/report-card/report-card';

@Component({
  selector: 'app-my-reports',
  imports: [RouterLink, ReportCardComponent],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.css',
})
export class MyReportsComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private toast = inject(ToastService);

  loading = signal(true);
  reports = signal<Report[]>([]);

  ngOnInit(): void {
    this.reportsService.getMine().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error ?? 'No se pudieron cargar tus reportes.');
      },
    });
  }
}
