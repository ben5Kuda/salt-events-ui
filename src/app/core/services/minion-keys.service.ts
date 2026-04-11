import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MinionKey, MinionKeySummary} from "../models/minion-key";

@Injectable({
  providedIn: 'root'
})
export class MinionKeysService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5278/api/minion-keys';

  getMinionKeys(): Observable<{
    pending: MinionKey[];
    accepted: MinionKey[];
    rejected: MinionKey[];
    denied: MinionKey[];
  }> {
    return this.http.get<any>(this.baseUrl);
  }

  getMinionKeysByState(state: string): Observable<MinionKey[]> {
    return this.http.get<MinionKey[]>(`${this.baseUrl}/${state}`);
  }

  getSummary(): Observable<MinionKeySummary> {
    return this.http.get<MinionKeySummary>(`${this.baseUrl}/summary`);
  }
}
