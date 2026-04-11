import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { HighstateStore } from '../../core/store/highstate.store';
import { HighstateDetailDialogComponent } from './highstate-detail-dialog.component';
import {HighstateExecution} from "../../core/models/highstates.model";

@Component({
  selector: 'app-highstate',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  template: `
    <div class="highstate-container">
      <!-- Header -->
      <div class="header">
        <h1>
          <mat-icon>assignment_turned_in</mat-icon>
          Highstate Executions
        </h1>
        <button mat-raised-button color="primary" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading highstate executions...</p>
        </div>
      }

      <!-- Error State -->
      @if (store.error() && !store.isLoading()) {
        <mat-card class="error-card">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ store.error() }}</p>
          <button mat-raised-button color="primary" (click)="refresh()">
            Try Again
          </button>
        </mat-card>
      }

      <!-- Content -->
      @if (!store.isLoading() && !store.error()) {
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-icon class="card-icon primary">play_circle</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.totalExecutions() }}</div>
              <div class="card-label">Total Executions</div>
            </div>
          </mat-card>

          <mat-card class="summary-card">
            <mat-icon class="card-icon success">check_circle</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.successRate() | number:'1.1-1' }}%</div>
              <div class="card-label">Success Rate</div>
            </div>
          </mat-card>

          <mat-card class="summary-card">
            <mat-icon class="card-icon warning">update</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.changeRate() | number:'1.1-1' }}%</div>
              <div class="card-label">Change Rate</div>
            </div>
          </mat-card>

          <mat-card class="summary-card">
            <mat-icon class="card-icon info">devices</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.uniqueMinions() }}</div>
              <div class="card-label">Unique Minions</div>
            </div>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-tab-group class="content-tabs">
          <!-- Recent Executions Tab -->
          <mat-tab label="Recent Executions">
            <div class="tab-content">
              <mat-card>
                <!-- Search -->
                <mat-form-field class="search-field">
                  <mat-label>Search</mat-label>
                  <input matInput (keyup)="applyExecutionFilter($event)" placeholder="Search minion ID, job ID, or status">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <!-- Table -->
                <div class="table-container">
                  <table mat-table [dataSource]="filteredExecutions()" class="executions-table" matSort>
                    <!-- Timestamp Column -->
                    <ng-container matColumnDef="timestamp">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                      <td mat-cell *matCellDef="let row">{{ row.timestamp | date:'short' }}</td>
                    </ng-container>

                    <!-- Minion ID Column -->
                    <ng-container matColumnDef="minionId">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                      <td mat-cell *matCellDef="let row">{{ row.minionId }}</td>
                    </ng-container>

                    <!-- Job ID Column -->
                    <ng-container matColumnDef="jobId">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Job ID</th>
                      <td mat-cell *matCellDef="let row" class="job-id">{{ row.jobId }}</td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                      <td mat-cell *matCellDef="let row">
                        <mat-chip [class.success-chip]="row.success" [class.failed-chip]="!row.success">
                          {{ row.success ? 'Success' : 'Failed' }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- States Column -->
                    <ng-container matColumnDef="states">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>States</th>
                      <td mat-cell *matCellDef="let row">{{ row.totalStates }}</td>
                    </ng-container>

                    <!-- Changed States Column -->
                    <ng-container matColumnDef="changedStates">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Changed States</th>
                      <td mat-cell *matCellDef="let row" class="changed-value">{{ row.changedStates }}</td>
                    </ng-container>

                    <!-- Total Changes Column -->
                    <ng-container matColumnDef="totalChanges">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Changes</th>
                      <td mat-cell *matCellDef="let row" class="info-value">{{ row.totalPropertyChanges }}</td>
                    </ng-container>

                    <!-- Failed Column -->
                    <ng-container matColumnDef="failed">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Failed</th>
                      <td mat-cell *matCellDef="let row" [class.failed-value]="row.failedStates > 0">
                        {{ row.failedStates }}
                      </td>
                    </ng-container>

                    <!-- Duration Column -->
                    <ng-container matColumnDef="duration">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Duration</th>
                      <td mat-cell *matCellDef="let row">{{ formatDuration(row.duration) }}</td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let row">
                        <button mat-icon-button (click)="viewDetails(row)" color="primary">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="executionDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: executionDisplayedColumns;" class="execution-row"></tr>
                  </table>
                </div>

                <!-- Pagination -->
                <mat-paginator
                  [length]="filteredExecutions().length"
                  [pageSize]="20"
                  [pageSizeOptions]="[10, 20, 50, 100]"
                  showFirstLastButtons>
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>

          <!-- By Minion Tab -->
          <mat-tab label="By Minion">
            <div class="tab-content">
              <mat-card>
                <!-- Search -->
                <mat-form-field class="search-field">
                  <mat-label>Search</mat-label>
                  <input matInput (keyup)="applyMinionFilter($event)" placeholder="Search minion ID">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <!-- Table -->
                <div class="table-container">
                  <table mat-table [dataSource]="filteredMinions()" class="minions-table" matSort>
                    <!-- Minion ID Column -->
                    <ng-container matColumnDef="minionId">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                      <td mat-cell *matCellDef="let row">{{ row.minionId }}</td>
                    </ng-container>

                    <!-- Executions Column -->
                    <ng-container matColumnDef="executions">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Executions</th>
                      <td mat-cell *matCellDef="let row">{{ row.executionCount }}</td>
                    </ng-container>

                    <!-- Success Rate Column -->
                    <ng-container matColumnDef="successRate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Success Rate</th>
                      <td mat-cell *matCellDef="let row" [ngClass]="getSuccessRateClass(row.successRate)">
                        {{ row.successRate | number:'1.1-1' }}%
                      </td>
                    </ng-container>

                    <!-- Avg Duration Column -->
                    <ng-container matColumnDef="avgDuration">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Avg Duration</th>
                      <td mat-cell *matCellDef="let row">{{ formatDuration(row.averageDuration) }}</td>
                    </ng-container>

                    <!-- Total States Column -->
                    <ng-container matColumnDef="totalStates">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Total States</th>
                      <td mat-cell *matCellDef="let row">{{ row.totalStates }}</td>
                    </ng-container>

                    <!-- Changed Column -->
                    <ng-container matColumnDef="changed">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Changed</th>
                      <td mat-cell *matCellDef="let row" class="changed-value">{{ row.changedStates }}</td>
                    </ng-container>

                    <!-- Failed Column -->
                    <ng-container matColumnDef="failed">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Failed</th>
                      <td mat-cell *matCellDef="let row" [class.failed-value]="row.failedStates > 0">
                        {{ row.failedStates }}
                      </td>
                    </ng-container>

                    <!-- Last Execution Column -->
                    <ng-container matColumnDef="lastExecution">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Execution</th>
                      <td mat-cell *matCellDef="let row">{{ row.lastExecution | date:'short' }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="minionDisplayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: minionDisplayedColumns;" class="minion-row"></tr>
                  </table>
                </div>

                <!-- Pagination -->
                <mat-paginator
                  [length]="filteredMinions().length"
                  [pageSize]="20"
                  [pageSizeOptions]="[10, 20, 50, 100]"
                  showFirstLastButtons>
                </mat-paginator>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .highstate-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 28px;
        color: #333;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 20px;

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .error-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
      text-align: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      p {
        color: #666;
        margin: 0;
      }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      cursor: default;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .card-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;

        &.primary { color: #2196f3; }
        &.success { color: #4caf50; }
        &.warning { color: #ff9800; }
        &.info { color: #00bcd4; }
      }

      .card-content {
        flex: 1;

        .card-value {
          font-size: 32px;
          font-weight: 600;
          color: #333;
          line-height: 1;
        }

        .card-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }
      }
    }

    .content-tabs {
      margin-top: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .search-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
      max-height: 600px;
    }

    table {
      width: 100%;
    }

    .execution-row, .minion-row {
      &:hover {
        background-color: #f5f5f5;
      }
    }

    .job-id {
      font-family: monospace;
      font-size: 12px;
    }

    .success-chip {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .failed-chip {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .changed-value {
      color: #ff9800;
      font-weight: 600;
    }

    .info-value {
      color: #2196f3;
      font-weight: 600;
    }

    .failed-value {
      color: #f44336;
      font-weight: 600;
    }

    .success-rate-high {
      color: #4caf50;
      font-weight: 600;
    }

    .success-rate-medium {
      color: #ff9800;
      font-weight: 600;
    }

    .success-rate-low {
      color: #f44336;
      font-weight: 600;
    }
  `]
})
export class HighstateComponent implements OnInit {
  readonly store = inject(HighstateStore);
  private readonly dialog = inject(MatDialog);

  executionDisplayedColumns = [
    'timestamp',
    'minionId',
    'jobId',
    'status',
    'states',
    'changedStates',
    'totalChanges',
    'failed',
    'duration',
    'actions'
  ];

  minionDisplayedColumns = [
    'minionId',
    'executions',
    'successRate',
    'avgDuration',
    'totalStates',
    'changed',
    'failed',
    'lastExecution'
  ];

  private executionFilterValue = '';
  private minionFilterValue = '';

  ngOnInit() {
    this.refresh();
  }

  filteredExecutions() {
    const executions = this.store.executions();
    if (!this.executionFilterValue) {
      return executions;
    }

    const filter = this.executionFilterValue.toLowerCase();
    return executions.filter((e: { minionId: string; jobId: string; success: any; }) =>
      e.minionId.toLowerCase().includes(filter) ||
      e.jobId.toLowerCase().includes(filter) ||
      (e.success ? 'success' : 'failed').includes(filter)
    );
  }

  filteredMinions() {
    const minions = this.store.statsByMinion();
    if (!this.minionFilterValue) {
      return minions;
    }

    const filter = this.minionFilterValue.toLowerCase();
    return minions.filter((m: { minionId: string; }) =>
      m.minionId.toLowerCase().includes(filter)
    );
  }

  applyExecutionFilter(event: Event) {
    this.executionFilterValue = (event.target as HTMLInputElement).value;
  }

  applyMinionFilter(event: Event) {
    this.minionFilterValue = (event.target as HTMLInputElement).value;
  }

  refresh() {
    this.store.refreshAll();
  }

  viewDetails(execution: HighstateExecution) {
    this.dialog.open(HighstateDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1400px',
      maxHeight: '90vh',
      data: execution
    });
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  getSuccessRateClass(rate: number): string {
    if (rate >= 90) return 'success-rate-high';
    if (rate >= 70) return 'success-rate-medium';
    return 'success-rate-low';
  }
}
