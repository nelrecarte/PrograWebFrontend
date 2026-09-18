import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Statistics, StatisticsFilters } from '../models/statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get(filters: StatisticsFilters = {}): Observable<Statistics> {
    let params = new HttpParams();
    if (filters.zoneId) {
      params = params.set('zoneId', filters.zoneId);
    }
    if (filters.from) {
      params = params.set('from', filters.from);
    }
    if (filters.to) {
      params = params.set('to', filters.to);
    }
    return this.http.get<Statistics>(this.apiUrl + '/statistics', { params });
  }
}
