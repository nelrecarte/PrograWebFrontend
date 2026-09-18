export type NotificationType = 'reporte_nuevo' | 'reporte_confirmado' | 'reporte_resuelto';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  reportId: string;
  zoneName: string;
  isRead: boolean;
  createdAt: string;
}
