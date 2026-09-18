export interface Zone {
  id: string;
  name: string;
  sector: string;
  description: string;
  isActive: boolean;
  activeReportId: string | null;
}

export interface ZoneRequest {
  name: string;
  sector: string;
  description: string;
}
