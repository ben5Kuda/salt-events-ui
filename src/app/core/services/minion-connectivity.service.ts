import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MinionConnectivitySummary, MinionPresenceStatus } from '../models/minion-connectivity.model';

@Injectable({ providedIn: 'root' })
export class MinionConnectivityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5278/api';

  getConnectivitySummary(): Observable<MinionConnectivitySummary> {
    return this.http.get<MinionConnectivitySummary>(`${this.apiUrl}/minions/connectivity/summary`);
  }

  getPresenceStatus(): Observable<MinionPresenceStatus[]> {
    return this.http.get<MinionPresenceStatus[]>(`${this.apiUrl}/minions/connectivity/status`);
  }
}
