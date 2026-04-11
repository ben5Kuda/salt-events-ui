import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaltEvent, EventsResponse } from '../models/salt-event.model';
import { Stats } from '../models/stats.model';
import {EventSummary} from "../models/event-summary.model";

@Injectable({
  providedIn: 'root'
})
export class SaltEventsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5278/api';

  getEvents(limit: number = 10): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/events?limit=${limit}`);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.baseUrl}/stats`);
  }

  getEventById(eventId: string): Observable<SaltEvent> {
    return this.http.get<SaltEvent>(`${this.baseUrl}/events/${eventId}`);
  }

  getEventsByJobId(jobId: string): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/events/job/${jobId}`);
  }

  getEventsByMinionId(minionId: string): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/events/minion/${minionId}`);
  }

  getEventsSummary(): Observable<EventSummary> {
    return this.http.get<EventSummary>(`${this.baseUrl}/events/summary`);
  }
}
