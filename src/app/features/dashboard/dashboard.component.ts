import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { EventsStore } from '../../core/store/events.store';
import { HighstateStore } from '../../core/store/highstate.store';
import { MinionKeysStore } from '../../core/store/minion-keys.store';
import { MinionSummaryStore } from "../../core/store/minion-summary.store";
import { MinionConnectivityStore } from "../../core/store/minion-connectivity.store";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  readonly eventsStore = inject(EventsStore);
  readonly highstateStore = inject(HighstateStore);
  readonly minionKeysStore = inject(MinionKeysStore);
  readonly minionSummaryStore = inject(MinionSummaryStore);
  readonly connectivityStore = inject(MinionConnectivityStore);
  private readonly router = inject(Router);

  // Track initial loading state
  initialLoadComplete = signal(false);

  ngOnInit() {
    this.refreshAll();
  }

  isLoading(): boolean {
    return !this.initialLoadComplete() && (
      this.eventsStore.isLoading() ||
      this.highstateStore.isLoading() ||
      this.minionKeysStore.isLoading() ||
      this.minionSummaryStore.isLoading() ||
      this.connectivityStore.isLoading()
    );
  }

  async refreshAll() {
    // Start loading each store independently
    Promise.all([
      this.eventsStore.loadSummary(),
      this.eventsStore.loadEvents(50),
      this.highstateStore.refreshAll(),
      this.minionKeysStore.loadKeys(),
      this.minionSummaryStore.loadAll(),
      this.connectivityStore.refreshAll()
    ]).finally(() => {
      this.initialLoadComplete.set(true);
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getEventTypeClass(eventType: string): string {
    if (eventType === 'job_execution') return 'job-execution';
    if (eventType === 'authentication') return 'authentication';
    if (eventType === 'minion_lifecycle') return 'minion-lifecycle';
    if (eventType === 'provisioning') return 'provisioning';
    if (eventType === 'runner') return 'runner';
    if (eventType === 'state_execution') return 'state-execution';
    return '';
  }

  getEventIcon(eventType: string): string {
    if (eventType.includes('job')) return 'play_circle';
    if (eventType.includes('auth')) return 'lock';
    if (eventType.includes('minion')) return 'computer';
    if (eventType.includes('provision')) return 'build';
    return 'event';
  }
}
