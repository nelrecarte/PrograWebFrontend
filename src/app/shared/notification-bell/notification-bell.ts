import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification } from '../../models/notification.model';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBellComponent implements OnInit {
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);

  abierto = signal(false);
  cargando = signal(false);
  items = signal<AppNotification[]>([]);
  sinLeer = signal(0);

  ngOnInit(): void {
    this.contar();
  }

  alternar(): void {
    const nuevo = !this.abierto();
    this.abierto.set(nuevo);

    if (nuevo) {
      this.cargar();
    }
  }

  abrir(notificacion: AppNotification): void {
    this.abierto.set(false);

    if (!notificacion.isRead) {
      this.notificationsService.markAsRead(notificacion.id).subscribe({
        next: () => this.contar(),
        error: () => this.contar(),
      });
    }

    if (notificacion.reportId) {
      this.router.navigate(['/reportes', notificacion.reportId]);
    }
  }

  marcarTodas(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.items.update((list) => list.map((n) => ({ ...n, isRead: true })));
        this.sinLeer.set(0);
      },
      error: () => this.contar(),
    });
  }

  private contar(): void {
    this.notificationsService.unreadCount().subscribe({
      next: (res) => this.sinLeer.set(res.total),
      error: () => this.sinLeer.set(0),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.notificationsService.getMine().subscribe({
      next: (items) => {
        this.items.set(items);
        this.cargando.set(false);
      },
      error: () => {
        this.items.set([]);
        this.cargando.set(false);
      },
    });
  }
}
