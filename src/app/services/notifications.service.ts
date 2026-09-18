import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getMine(onlyUnread?: boolean): Observable<AppNotification[]> {
    let params = new HttpParams();
    if (onlyUnread !== undefined) {
      params = params.set('onlyUnread', onlyUnread);
    }
    return this.http.get<AppNotification[]>(this.apiUrl + '/notifications', { params });
  }

  unreadCount(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(this.apiUrl + '/notifications/unread-count');
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(this.apiUrl + '/notifications/' + id + '/read', {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(this.apiUrl + '/notifications/read-all', {});
  }
}
