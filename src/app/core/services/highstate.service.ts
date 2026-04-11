import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HighstateExecution, HighstateStats, HighstateSummary } from "../models/highstates.model";

@Injectable({
  providedIn: 'root'
})
export class HighstateService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5278/api/highstate';

  // ✅ Changed to return array directly
  getExecutions(): Observable<HighstateExecution[]> {
    return this.http.get<HighstateExecution[]>(`${this.baseUrl}/executions`);
  }

  // ✅ Keep this for pagination if needed
  getHighstateExecutions(limit: number = 50): Observable<{ data: HighstateExecution[]; count: number }> {
    return this.http.get<{ data: HighstateExecution[]; count: number }>(
      `${this.baseUrl}/executions?limit=${limit}`
    );
  }

  // ✅ Renamed to match store
  getSummary(): Observable<HighstateSummary> {
    return this.http.get<HighstateSummary>(`${this.baseUrl}/summary`);
  }

  getHighstateSummary(): Observable<HighstateSummary> {
    return this.getSummary();
  }

  // ✅ Renamed to match store
  getStatsByMinion(): Observable<HighstateStats[]> {
    return this.http.get<HighstateStats[]>(`${this.baseUrl}/stats-by-minion`);
  }

  getHighstateStatsByMinion(): Observable<HighstateStats[]> {
    return this.getStatsByMinion();
  }

  getExecutionById(id: string): Observable<HighstateExecution> {
    return this.http.get<HighstateExecution>(`${this.baseUrl}/executions/${id}`);
  }

  getHighstateExecutionByJobId(jobId: string): Observable<HighstateExecution> {
    return this.getExecutionById(jobId);
  }
}
