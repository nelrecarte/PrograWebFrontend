import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { REPORT_STATUS_LABELS, ReportStatus } from '../../models/report.model';
import { Statistics } from '../../models/statistics.model';
import { Zone } from '../../models/zone.model';
import { StatisticsService } from '../../services/statistics.service';
import { ToastService } from '../../services/toast.service';
import { ZonesService } from '../../services/zones.service';
import { dateToIso } from '../../shared/date-utils';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, DecimalPipe, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private statisticsService = inject(StatisticsService);
  private zonesService = inject(ZonesService);
  private toast = inject(ToastService);

  loading = signal(true);
  zones = signal<Zone[]>([]);
  stats = signal<Statistics | null>(null);

  barData = signal<ChartConfiguration<'bar'>['data']>({ labels: [], datasets: [] });
  pieData = signal<ChartConfiguration<'doughnut'>['data']>({ labels: [], datasets: [] });
  lineData = signal<ChartConfiguration<'line'>['data']>({ labels: [], datasets: [] });
  granularidad = signal<'semana' | 'mes'>('semana');

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  form = this.fb.nonNullable.group({
    zoneId: '',
    from: '',
    to: '',
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

    this.statisticsService
      .get({
        zoneId: values.zoneId || undefined,
        from: values.from ? dateToIso(values.from) : undefined,
        to: values.to ? dateToIso(values.to) : undefined,
      })
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.armarGraficos(stats);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err.error?.error ?? 'No se pudieron cargar las estadisticas.');
        },
      });
  }

  limpiar(): void {
    this.form.reset({ zoneId: '', from: '', to: '' });
    this.load();
  }

  cambiarGranularidad(valor: 'semana' | 'mes'): void {
    this.granularidad.set(valor);
    const stats = this.stats();
    if (stats) {
      this.armarTendencia(stats);
    }
  }

  etiqueta(status: ReportStatus): string {
    return REPORT_STATUS_LABELS[status];
  }

  private armarTendencia(stats: Statistics): void {
    const puntos = this.granularidad() === 'semana' ? stats.weeklyTrend : stats.monthlyTrend;

    this.lineData.set({
      labels: puntos.map((p) => p.period),
      datasets: [
        {
          label: 'Reportados',
          data: puntos.map((p) => p.reported),
          borderColor: '#d97706',
          backgroundColor: '#fde68a',
          tension: 0.3,
        },
        {
          label: 'Resueltos',
          data: puntos.map((p) => p.resolved),
          borderColor: '#059669',
          backgroundColor: '#a7f3d0',
          tension: 0.3,
        },
      ],
    });
  }

  private armarGraficos(stats: Statistics): void {
    this.barData.set({
      labels: stats.reportsByZone.map((z) => z.zoneName),
      datasets: [
        {
          label: 'Cortes reportados',
          data: stats.reportsByZone.map((z) => z.total),
          backgroundColor: '#d97706',
          borderRadius: 4,
        },
      ],
    });

    this.armarTendencia(stats);

    this.pieData.set({
      labels: stats.reportsByStatus.map((s) => this.etiqueta(s.status)),
      datasets: [
        {
          data: stats.reportsByStatus.map((s) => s.total),
          backgroundColor: ['#94a3b8', '#fbbf24', '#f97316', '#10b981'],
        },
      ],
    });
  }
}
