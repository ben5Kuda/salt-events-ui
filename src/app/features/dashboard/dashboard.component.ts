import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit() {
    console.log('DashboardComponent ngOnInit');
    console.log('Stores initialized:', {
      events: !!this.eventsStore,
      highstate: !!this.highstateStore,
      keys: !!this.minionKeysStore,
      summary: !!this.minionSummaryStore,
      connectivity: !!this.connectivityStore
    });
    this.refreshAll();
  }

  isLoading(): boolean {
    const loading = this.eventsStore.isLoading() ||
      this.highstateStore.isLoading() ||
      this.minionKeysStore.isLoading();
    console.log('isLoading:', loading);
    return loading;
  }

  async refreshAll() {
    console.log('Starting refresh...');
    try {
      await Promise.all([
        this.eventsStore.loadSummary(),
        this.eventsStore.loadEvents(50),
        this.highstateStore.refreshAll(),
        this.minionKeysStore.loadKeys(),
        this.minionSummaryStore.loadAll(),
        this.connectivityStore.refreshAll()
      ]);
      console.log('All data loaded successfully');
      console.log('Store states:', {
        totalEvents: this.eventsStore.totalEvents(),
        totalExecutions: this.highstateStore.totalExecutions(),
        totalKeys: this.minionKeysStore.totalKeys(),
        totalMinions: this.minionSummaryStore.versionSummary()?.totalMinions,
        onlineMinions: this.connectivityStore.summary()?.onlineMinions
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getEventTypeClass(eventType: string): string {
    if (eventType.includes('job')) return 'job-execution';
    if (eventType.includes('auth')) return 'authentication';
    if (eventType.includes('minion')) return 'minion-lifecycle';
    if (eventType.includes('provision')) return 'provisioning';
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
