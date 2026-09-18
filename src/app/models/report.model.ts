export type ReportStatus = 'nuevo' | 'en_verificacion' | 'confirmado' | 'resuelto';

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  nuevo: 'Nuevo',
  en_verificacion: 'En verificación',
  confirmado: 'Confirmado',
  resuelto: 'Resuelto',
};

export interface Resolution {
  id: string;
  reportId: string;
  technicianId: string;
  technicianName: string;
  cause: string;
  detail: string;
  estimatedMinutes: number;
  restoredAt: string;
  resolutionMinutes: number;
  createdAt: string;
}

export interface Report {
  id: string;
  zoneId: string;
  zoneName: string;
  address: string;
  startedAt: string;
  status: ReportStatus;
  isActive: boolean;
  reportedByUserId: string;
  reportedByName: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  evidenceUrl: string;
  confirmationCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  confirmedByMe: boolean;
  resolution: Resolution | null;
}

export interface CreateReportRequest {
  zoneId: string;
  address: string;
  startedAt?: string;
  evidenceUrl?: string;
}

export interface CreateResolutionRequest {
  cause: string;
  detail: string;
  estimatedMinutes: number;
  restoredAt?: string;
}

export interface ReportFilters {
  zoneId?: string;
  status?: string;
  technicianId?: string;
  isActive?: boolean;
}

export interface DuplicateReportData {
  existingReportId: string;
  zoneId: string;
  zoneName: string;
  status: ReportStatus;
  confirmationCount: number;
  alreadyConfirmedByMe: boolean;
}
