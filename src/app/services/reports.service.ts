import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateReportRequest,
  CreateResolutionRequest,
  Report,
  ReportFilters,
  Resolution,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(filters: ReportFilters = {}): Observable<Report[]> {
    let params = new HttpParams();
    if (filters.zoneId) {
      params = params.set('zoneId', filters.zoneId);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.technicianId) {
      params = params.set('technicianId', filters.technicianId);
    }
    if (filters.isActive !== undefined) {
      params = params.set('isActive', filters.isActive);
    }
    return this.http.get<Report[]>(this.apiUrl + '/reports', { params });
  }

  getMine(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl + '/reports/mine');
  }

  getById(id: string): Observable<Report> {
    return this.http.get<Report>(this.apiUrl + '/reports/' + id);
  }

  create(data: CreateReportRequest): Observable<Report> {
    return this.http.post<Report>(this.apiUrl + '/reports', data);
  }

  confirm(id: string): Observable<Report> {
    return this.http.post<Report>(this.apiUrl + '/reports/' + id + '/confirm', {});
  }

  assign(id: string, technicianId: string): Observable<Report> {
    return this.http.post<Report>(this.apiUrl + '/reports/' + id + '/assign', { technicianId });
  }

  accept(id: string): Observable<Report> {
    return this.http.post<Report>(this.apiUrl + '/reports/' + id + '/accept', {});
  }

  changeStatus(id: string, status: string): Observable<Report> {
    return this.http.patch<Report>(this.apiUrl + '/reports/' + id + '/status', { status });
  }

  resolve(id: string, data: CreateResolutionRequest): Observable<Resolution> {
    return this.http.post<Resolution>(this.apiUrl + '/reports/' + id + '/resolution', data);
  }
}
