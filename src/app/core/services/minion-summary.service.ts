import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MinionVersionSummary, ProvisioningEventsSummary } from '../models/minion-summary.model';

@Injectable({ providedIn: 'root' })
export class MinionSummaryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5278/api';

  getMinionVersionSummary(): Observable<MinionVersionSummary> {
    return this.http.get<MinionVersionSummary>(`${this.apiUrl}/minions-grains/summary`);
  }

  getProvisioningSummary(): Observable<ProvisioningEventsSummary> {
    return this.http.get<ProvisioningEventsSummary>(`${this.apiUrl}/events/provisioning/summary`);
  }
}
