import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { SaltEventsStore } from '../../core/store/salt-events.store';
import { HighstateStore } from '../../core/store/highstate.store';
import { MinionKeysStore } from '../../core/store/minion-keys.store';
import {MinionSummaryStore} from "../../core/store/minion-summary.store";
import {MinionConnectivityStore} from "../../core/store/minion-connectivity.store";

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
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>
          <mat-icon>dashboard</mat-icon>
          Salt Events Dashboard
        </h1>
        <button mat-raised-button color="primary" (click)="refreshAll()">
          <mat-icon>refresh</mat-icon>
          Refresh All
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading dashboard data...</p>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-grid">
          <!-- Events Summary -->
          <mat-card class="summary-card events-card" (click)="navigateTo('/events')">
            <div class="card-header">
              <mat-icon class="card-icon">event</mat-icon>
              <h2>Events</h2>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-value">{{ eventsStore.totalEvents() }}</span>
                <span class="stat-label">Total Events (24h)</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item">
                  <span class="stat-value-small">{{ eventsStore.uniqueJobs() }}</span>
                  <span class="stat-label-small">Unique Jobs</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value-small">{{ eventsStore.uniqueMinions() }}</span>
                  <span class="stat-label-small">Unique Minions</span>
                </div>
              </div>
            </div>
            <div class="card-action">
              <span>View All Events</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </mat-card>

          <!-- Highstate Summary -->
          <mat-card class="summary-card highstate-card" (click)="navigateTo('/highstate')">
            <div class="card-header">
              <mat-icon class="card-icon">assignment_turned_in</mat-icon>
              <h2>Highstate Executions</h2>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-value">{{ highstateStore.totalExecutions() }}</span>
                <span class="stat-label">Total Executions</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item success">
                  <span class="stat-value-small">{{ highstateStore.successRate() | number:'1.0-0' }}%</span>
                  <span class="stat-label-small">Success Rate</span>
                </div>
                <div class="stat-item warning">
                  <span class="stat-value-small">{{ highstateStore.changeRate() | number:'1.0-0' }}%</span>
                  <span class="stat-label-small">Change Rate</span>
                </div>
              </div>
            </div>
            <div class="card-action">
              <span>View Executions</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </mat-card>

          <!-- Minion Keys Summary -->
          <mat-card class="summary-card keys-card" (click)="navigateTo('/minion-keys')">
            <div class="card-header">
              <mat-icon class="card-icon">vpn_key</mat-icon>
              <h2>Minion Keys</h2>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-value">{{ minionKeysStore.totalKeys() }}</span>
                <span class="stat-label">Total Keys</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item accepted">
                  <span class="stat-value-small">{{ minionKeysStore.acceptedCount() }}</span>
                  <span class="stat-label-small">Accepted</span>
                </div>
                <div class="stat-item pending">
                  <span class="stat-value-small">{{ minionKeysStore.pendingCount() }}</span>
                  <span class="stat-label-small">Pending</span>
                </div>
                <div class="stat-item rejected">
                  <span class="stat-value-small">{{ minionKeysStore.rejectedCount() }}</span>
                  <span class="stat-label-small">Rejected</span>
                </div>
              </div>
            </div>
            <div class="card-action">
              <span>Manage Keys</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </mat-card>

        <mat-card class="summary-card minion-summary-card" (click)="navigateTo('/minion-grains')">
          <div class="card-header">
            <mat-icon class="card-icon">computer</mat-icon>
            <h2>Minion Summary</h2>
          </div>
          <div class="card-stats">
            @if (minionSummaryStore.isLoading()) {
              <mat-spinner diameter="40"></mat-spinner>
            } @else {
              <div class="stat-main">
                <span class="stat-value">{{ minionSummaryStore.versionSummary()?.totalMinions || 0 }}</span>
                <span class="stat-label">Total Minions</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item">
                  <span class="stat-label-small">Top OS Versions</span>
                  @for (osVersion of minionSummaryStore.topOsVersions(); track osVersion[0]) {
                    <div class="version-item">
                      <span class="version-name">{{ osVersion[0] }}</span>
                      <span class="version-count">{{ osVersion[1] }}</span>
                    </div>
                  }
                </div>
                <div class="stat-item">
                  <span class="stat-label-small">Top Salt Versions</span>
                  @for (saltVersion of minionSummaryStore.topSaltVersions(); track saltVersion[0]) {
                    <div class="version-item">
                      <span class="version-name">{{ saltVersion[0] }}</span>
                      <span class="version-count">{{ saltVersion[1] }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          <div class="card-action">
            <span>View Details</span>
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </mat-card>

        <!-- Provisioning Events Card -->
        <mat-card class="summary-card provisioning-card">
          <div class="card-header">
            <mat-icon class="card-icon">build</mat-icon>
            <h2>Provisioning Events</h2>
          </div>
          <div class="card-stats">
            @if (minionSummaryStore.isLoading()) {
              <mat-spinner diameter="40"></mat-spinner>
            } @else {
              <div class="stat-grid">
                <div class="stat-item">
                  <span class="stat-value-small">{{ minionSummaryStore.provisioningSummary()?.totalLast24Hours || 0 }}</span>
                  <span class="stat-label-small">Last 24 Hours</span>
                  <div class="success-rate" [class.high]="minionSummaryStore.provisioningSuccessRate24h() >= 80">
                    {{ minionSummaryStore.provisioningSuccessRate24h() }}% Success
                  </div>
                </div>
                <div class="stat-item">
                  <span class="stat-value-small">{{ minionSummaryStore.provisioningSummary()?.totalLast7Days || 0 }}</span>
                  <span class="stat-label-small">Last 7 Days</span>
                  <div class="success-rate" [class.high]="minionSummaryStore.provisioningSuccessRate7d() >= 80">
                    {{ minionSummaryStore.provisioningSuccessRate7d() }}% Success
                  </div>
                </div>
              </div>
            }
          </div>
        </mat-card>

        <!-- Minion Connectivity Card -->
        <mat-card class="summary-card connectivity-card" (click)="navigateTo('/minion-grains')">
          <div class="card-header">
            <mat-icon class="card-icon">wifi</mat-icon>
            <h2>Minion Connectivity</h2>
          </div>
          <div class="card-stats">
            @if (connectivityStore.isLoading()) {
              <mat-spinner diameter="40"></mat-spinner>
            } @else if (connectivityStore.summary()) {
              <div class="stat-main">
                <span class="stat-value">{{ connectivityStore.summary()!.onlineMinions }}</span>
                <span class="stat-label">Online Minions</span>
              </div>
              <div class="stat-grid">
                <div class="stat-item online">
                  <span class="stat-value-small">{{ connectivityStore.summary()!.onlinePercentage | number:'1.0-1' }}%</span>
                  <span class="stat-label-small">Online Rate</span>
                </div>
                <div class="stat-item offline">
                  <span class="stat-value-small">{{ connectivityStore.summary()!.offlineMinions }}</span>
                  <span class="stat-label-small">Offline</span>
                </div>
                <div class="stat-item total">
                  <span class="stat-value-small">{{ connectivityStore.summary()!.totalMinions }}</span>
                  <span class="stat-label-small">Total</span>
                </div>
              </div>
            }
          </div>
          <div class="card-action">
            <span>View Details</span>
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </mat-card>



        <!-- System Health -->
          <mat-card class="summary-card health-card">
            <div class="card-header">
              <mat-icon class="card-icon">favorite</mat-icon>
              <h2>System Health</h2>
            </div>
            <div class="card-stats">
              <div class="health-items">
                <div class="health-item">
                  <mat-icon class="health-icon success">check_circle</mat-icon>
                  <div class="health-info">
                    <span class="health-label">API Status</span>
                    <span class="health-value">Operational</span>
                  </div>
                </div>
                <div class="health-item">
                  <mat-icon class="health-icon success">storage</mat-icon>
                  <div class="health-info">
                    <span class="health-label">Database</span>
                    <span class="health-value">Connected</span>
                  </div>
                </div>
                <div class="health-item">
                  <mat-icon class="health-icon success">cloud</mat-icon>
                  <div class="health-info">
                    <span class="health-label">Salt Master</span>
                    <span class="health-value">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>history</mat-icon>
                Recent Activity
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                @for (event of eventsStore.recentEvents(); track event.id) {
                  <div class="activity-item">
                    <mat-icon [class]="'activity-icon ' + getEventTypeClass(event.event_type)">
                      {{ getEventIcon(event.event_type) }}
                    </mat-icon>
                    <div class="activity-details">
                      <div class="activity-title">{{ event.function || event.event_type }}</div>
                      <div class="activity-meta">
                        <span>{{ event.minion_id || 'System' }}</span>
                        <span>•</span>
                        <span>{{ event.timestamp | date:'short' }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 32px;
        color: #333;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 20px;

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .minion-summary-card {
      border-top: 4px solid #9c27b0;
    }

    .connectivity-card {
      border-top: 4px solid #00bcd4;
    }

    .stat-item {
      &.online {
        background-color: #e8f5e9;

        .stat-value-small {
          color: #4caf50;
        }
      }

      &.offline {
        background-color: #ffebee;

        .stat-value-small {
          color: #f44336;
        }
      }

      &.total {
        background-color: #e3f2fd;

        .stat-value-small {
          color: #2196f3;
        }
      }
    }

    .provisioning-card {
      border-top: 4px solid #00bcd4;
      cursor: default;

      &:hover {
        transform: none;
      }
    }

    .version-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;

      .version-name {
        color: #666;
      }

      .version-count {
        font-weight: 600;
        color: #333;
      }
    }

    .success-rate {
      margin-top: 4px;
      font-size: 11px;
      color: #f44336;

      &.high {
        color: #4caf50;
      }
    }

    .summary-card {
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
      }

      &.events-card {
        border-top: 4px solid #2196f3;
      }

      &.highstate-card {
        border-top: 4px solid #4caf50;
      }

      &.keys-card {
        border-top: 4px solid #ff9800;
      }

      &.health-card {
        border-top: 4px solid #e91e63;
        cursor: default;

        &:hover {
          transform: none;
        }
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;

        .card-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #666;
        }

        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
          color: #333;
        }
      }

      .card-stats {
        .stat-main {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;

          .stat-value {
            font-size: 48px;
            font-weight: 700;
            color: #333;
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 8px;
          }
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 16px;

          .stat-item {
            display: flex;
            flex-direction: column;
            padding: 12px;
            background-color: #f5f5f5;
            border-radius: 8px;

            &.success {
              background-color: #e8f5e9;
            }

            &.warning {
              background-color: #fff3e0;
            }

            &.accepted {
              background-color: #e8f5e9;
            }

            &.pending {
              background-color: #fff3e0;
            }

            &.rejected {
              background-color: #ffebee;
            }

            .stat-value-small {
              font-size: 24px;
              font-weight: 700;
              color: #333;
              line-height: 1;
            }

            .stat-label-small {
              font-size: 12px;
              color: #666;
              margin-top: 4px;
            }
          }
        }
      }

      .card-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
        color: #2196f3;
        font-weight: 500;

        mat-icon {
          transition: transform 0.2s;
        }
      }

      &:hover .card-action mat-icon {
        transform: translateX(4px);
      }

      .health-items {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .health-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 8px;

          .health-icon {
            &.success {
              color: #4caf50;
            }

            &.warning {
              color: #ff9800;
            }

            &.error {
              color: #f44336;
            }
          }

          .health-info {
            display: flex;
            flex-direction: column;

            .health-label {
              font-size: 12px;
              color: #666;
            }

            .health-value {
              font-size: 14px;
              font-weight: 600;
              color: #333;
            }
          }
        }
      }
    }

    .recent-activity {
      mat-card-header {
        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
        }
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-height: 400px;
        overflow-y: auto;

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 8px;
          transition: background-color 0.2s;

          &:hover {
            background-color: #e0e0e0;
          }

          .activity-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;

            &.job-execution {
              color: #2196f3;
            }

            &.authentication {
              color: #7b1fa2;
            }

            &.minion-lifecycle {
              color: #4caf50;
            }

            &.provisioning {
              color: #ff9800;
            }
          }

          .activity-details {
            flex: 1;

            .activity-title {
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }

            .activity-meta {
              font-size: 12px;
              color: #666;
              display: flex;
              gap: 8px;
            }
          }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly eventsStore = inject(SaltEventsStore);
  readonly highstateStore = inject(HighstateStore);
  readonly minionKeysStore = inject(MinionKeysStore);
  readonly minionSummaryStore = inject(MinionSummaryStore);
  readonly connectivityStore = inject(MinionConnectivityStore);
  private readonly router = inject(Router);

  ngOnInit() {
    this.refreshAll();
  }

  isLoading() {
    return this.eventsStore.isLoading() ||
      this.highstateStore.isLoading() ||
      this.minionKeysStore.isLoading();
  }

  refreshAll() {
    this.eventsStore.loadSummary();
    this.eventsStore.loadEvents(50);
    this.highstateStore.refreshAll();
    this.minionKeysStore.loadKeys();
    this.minionSummaryStore.loadAll();
    this.connectivityStore.refreshAll();
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
