import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SaltEventsStore } from '../../core/store/salt-events.store';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    @if (store.isLoading()) {
      <div class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @else if (store.stats()) {
      <div class="stats-grid">
        <!-- Total Events Card -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon total">event</mat-icon>
            <mat-card-title>Total Events (24h)</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ store.stats()!.totalEventsLast24Hours | number }}</div>
          </mat-card-content>
        </mat-card>

        <!-- Unique Minions Card -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon minions">devices</mat-icon>
            <mat-card-title>Unique Minions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ store.stats()!.uniqueMinions | number }}</div>
          </mat-card-content>
        </mat-card>

        <!-- Unique Jobs Card -->
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon jobs">work</mat-icon>
            <mat-card-title>Unique Jobs</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ store.stats()!.uniqueJobs | number }}</div>
          </mat-card-content>
        </mat-card>

        @if (detailed) {
          <!-- Events by Type -->
          <mat-card class="stat-card wide">
            <mat-card-header>
              <mat-card-title>Events by Type</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="type-list">
                @for (item of store.stats()!.eventsByType; track item.eventType) {
                  <div class="type-item">
                    <span class="type-name">{{ item.eventType }}</span>
                    <span class="type-count">{{ item.count | number }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Events by Function -->
          <mat-card class="stat-card wide">
            <mat-card-header>
              <mat-card-title>Top Functions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="type-list">
                @for (item of store.stats()!.eventsByFunction; track item.function) {
                  <div class="type-item">
                    <span class="type-name">{{ item.function }}</span>
                    <span class="type-count">{{ item.count | number }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .stat-card {
      mat-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      mat-card-title {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;

      &.total { color: #2196F3; }
      &.minions { color: #4CAF50; }
      &.jobs { color: #FF9800; }
    }

    .stat-value {
      font-size: 36px;
      font-weight: 600;
      color: #333;
    }

    .wide {
      grid-column: span 2;
    }

    .type-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .type-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;

      .type-name {
        font-weight: 500;
        color: #333;
      }

      .type-count {
        font-weight: 600;
        color: #2196F3;
      }
    }
  `]
})
export class StatsCardsComponent {
  @Input() detailed = false;
  readonly store = inject(SaltEventsStore);
}
