import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MinionGrain } from '../models/minion-grain.model';

@Injectable({
  providedIn: 'root'
})
export class MinionGrainsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5278/api';

  getAllMinions(): Observable<MinionGrain[]> {
    return this.http.get<MinionGrain[]>(`${this.baseUrl}/minions-grains`);
  }

  getMinionGrains(minionId: string): Observable<MinionGrain> {
    return this.http.get<MinionGrain>(`${this.baseUrl}/minions-grains/${minionId}/grains`);
  }
}
