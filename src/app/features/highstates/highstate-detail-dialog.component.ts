import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import {HighstateExecution, HighstateState} from "../../core/models/highstates.model";

@Component({
  selector: 'app-highstate-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatExpansionModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>assignment_turned_in</mat-icon>
        Highstate Execution Details
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <!-- Header Info -->
      <div class="header-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">Minion ID:</span>
            <span class="value">{{ data.minionId }}</span>
          </div>
          <div class="info-item">
            <span class="label">Job ID:</span>
            <span class="value mono">{{ data.jobId }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <mat-chip [class.success-chip]="data.success" [class.failed-chip]="!data.success">
              {{ data.success ? 'Success' : 'Failed' }}
            </mat-chip>
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">Timestamp:</span>
            <span class="value">{{ data.timestamp | date:'full' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Duration:</span>
            <span class="value">{{ formatDuration(data.duration) }}</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-value">{{ data.totalStates }}</div>
          <div class="stat-label">Total States</div>
        </div>
        <div class="stat-box success">
          <div class="stat-value">{{ data.succeededStates }}</div>
          <div class="stat-label">Succeeded</div>
        </div>
        <div class="stat-box changed">
          <div class="stat-value">{{ data.changedStates }}</div>
          <div class="stat-label">States Changed</div>
        </div>
        <div class="stat-box info">
          <div class="stat-value">{{ data.totalPropertyChanges }}</div>
          <div class="stat-label">Property Changes</div>
        </div>
        @if (data.failedStates > 0) {
          <div class="stat-box failed">
            <div class="stat-value">{{ data.failedStates }}</div>
            <div class="stat-label">Failed</div>
          </div>
        }
      </div>

      <!-- Tabs -->
      <mat-tab-group class="content-tabs">
        <!-- All States Tab -->
        <mat-tab [label]="'All States (' + data.states.length + ')'">
          <div class="tab-content">
            <div class="states-list">
              @for (state of data.states; track state.id) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <div class="state-header">
                        <mat-icon [class.success-icon]="state.result" [class.failed-icon]="!state.result">
                          {{ state.result ? 'check_circle' : 'error' }}
                        </mat-icon>
                        <span class="state-function">{{ state.function }}</span>
                        <span class="state-type-badge">{{ state.state }}</span>
                        @if (hasChanges(state)) {
                          <mat-chip class="changed-chip">Changed</mat-chip>
                        }
                      </div>
                    </mat-panel-title>
                    <mat-panel-description>
                      <span class="state-duration">{{ formatDuration(state.duration) }}</span>
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="state-details">
                    <div class="detail-row">
                      <span class="detail-label">Name:</span>
                      <span class="detail-value">{{ state.name }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">SLS:</span>
                      <span class="detail-value">{{ state.sls }}</span>
                    </div>
                    @if (state.comment) {
                      <div class="detail-row">
                        <span class="detail-label">Comment:</span>
                        <span class="detail-value">{{ state.comment }}</span>
                      </div>
                    }
                    @if (hasChanges(state)) {
                      <div class="detail-row">
                        <span class="detail-label">Changes:</span>
                        <pre class="changes-json">{{ formatJson(state.changes) }}</pre>
                      </div>
                    }
                  </div>
                </mat-expansion-panel>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Changed States Tab -->
        <mat-tab [label]="'Changed States (' + getChangedStates().length + ')'">
          <div class="tab-content">
            <div class="states-list">
              @for (state of getChangedStates(); track state.id) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <div class="state-header">
                        <mat-icon class="success-icon">check_circle</mat-icon>
                        <span class="state-function">{{ state.function }}</span>
                        <span class="state-type-badge">{{ state.state }}</span>
                      </div>
                    </mat-panel-title>
                    <mat-panel-description>
                      <span class="state-duration">{{ formatDuration(state.duration) }}</span>
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="state-details">
                    <div class="detail-row">
                      <span class="detail-label">Name:</span>
                      <span class="detail-value">{{ state.name }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">SLS:</span>
                      <span class="detail-value">{{ state.sls }}</span>
                    </div>
                    @if (state.comment) {
                      <div class="detail-row">
                        <span class="detail-label">Comment:</span>
                        <span class="detail-value">{{ state.comment }}</span>
                      </div>
                    }
                    <div class="detail-row">
                      <span class="detail-label">Changes:</span>
                      <pre class="changes-json">{{ formatJson(state.changes) }}</pre>
                    </div>
                  </div>
                </mat-expansion-panel>
              }
            </div>
          </div>
        </mat-tab>

        <!-- Summary Tab -->
        <mat-tab label="Summary">
          <div class="tab-content">
            <div class="summary-content">
              <!-- Left Column -->
              <div class="summary-column">
                <div class="summary-section">
                  <h3>Execution Summary</h3>
                  <table class="summary-table">
                    <tr>
                      <td class="summary-label">Total States:</td>
                      <td class="summary-value">{{ data.totalStates }}</td>
                    </tr>
                    <tr>
                      <td class="summary-label">Succeeded:</td>
                      <td class="summary-value success-text">{{ data.succeededStates }}</td>
                    </tr>
                    <tr>
                      <td class="summary-label">Changed States:</td>
                      <td class="summary-value changed-text">{{ data.changedStates }}</td>
                    </tr>
                    <tr>
                      <td class="summary-label">Property Changes:</td>
                      <td class="summary-value info-text">{{ data.totalPropertyChanges }}</td>
                    </tr>
                    <tr>
                      <td class="summary-label">Failed:</td>
                      <td class="summary-value error-text">{{ data.failedStates }}</td>
                    </tr>
                    <tr>
                      <td class="summary-label">Total Duration:</td>
                      <td class="summary-value">{{ formatDuration(data.duration) }}</td>
                    </tr>
                    <tr>
                      <td class="summary-label">Success Rate:</td>
                      <td class="summary-value">{{ getSuccessRate() }}%</td>
                    </tr>
                  </table>
                </div>

                <div class="summary-section">
                  <h3>States by SLS</h3>
                  <div class="sls-list">
                    @for (sls of getStatesBySls(); track sls.name) {
                      <div class="sls-item">
                        <span class="sls-name">{{ sls.name }}</span>
                        <span class="sls-count">{{ sls.count }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="summary-column">
                <div class="summary-section">
                  <h3>Top 10 Slowest States</h3>
                  <div class="slowest-states">
                    @for (state of getSlowestStates(); track state.id) {
                      <div class="slowest-state-item">
                        <div class="state-details">
                          <div class="state-function">{{ state.function }}</div>
                          <div class="state-meta">
                            <span class="state-type-badge">{{ state.state }}</span>
                            @if (state.sls) {
                              <span class="state-sls">{{ state.sls }}</span>
                            }
                          </div>
                        </div>
                        <div class="state-duration">{{ formatDuration(state.duration) }}</div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="exportJson()">
        <mat-icon>download</mat-icon>
        Export JSON
      </button>
      <button mat-raised-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 24px;
      }
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 70vh;
    }

    .header-info {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;

      .info-row {
        display: flex;
        gap: 32px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .label {
          font-weight: 600;
          color: #666;
        }

        .value {
          color: #333;

          &.mono {
            font-family: monospace;
            font-size: 12px;
          }
        }
      }
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-box {
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #e0e0e0;
      text-align: center;

      &.success {
        border-color: #4caf50;
        background-color: #e8f5e9;
      }

      &.changed {
        border-color: #ff9800;
        background-color: #fff3e0;
      }

      &.info {
        border-color: #2196f3;
        background-color: #e3f2fd;
      }

      &.failed {
        border-color: #f44336;
        background-color: #ffebee;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #333;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
    }

    .success-chip {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .failed-chip {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .content-tabs {
      margin-top: 16px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .states-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .state-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .success-icon {
        color: #4caf50;
      }

      .failed-icon {
        color: #f44336;
      }

      .state-function {
        font-weight: 600;
        flex: 1;
      }

      .state-type-badge {
        font-size: 11px;
        padding: 4px 8px;
        background-color: #e0e0e0;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .changed-chip {
        background-color: #fff3e0 !important;
        color: #f57c00 !important;
        height: 24px;
        font-size: 11px;
      }
    }

    .state-duration {
      font-weight: 600;
      color: #666;
    }

    .state-details {
      padding: 16px;

      .detail-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
          min-width: 100px;
        }

        .detail-value {
          color: #333;
          flex: 1;
        }
      }

      .changes-json {
        background-color: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        margin: 0;
      }
    }

    .summary-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .summary-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-section {
      h3 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 8px;
      }
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;

      tr {
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 12px 8px;

        &.summary-label {
          font-weight: 500;
          color: #666;
          width: 60%;
        }

        &.summary-value {
          color: #333;
          text-align: right;
          font-weight: 600;

          &.success-text {
            color: #4caf50;
          }

          &.changed-text {
            color: #ff9800;
          }

          &.info-text {
            color: #2196f3;
          }

          &.error-text {
            color: #f44336;
          }
        }
      }
    }

    .sls-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .sls-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background-color: #f8f9fa;
      border-radius: 6px;
      border-left: 3px solid #2196f3;

      .sls-name {
        font-size: 13px;
        color: #333;
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sls-count {
        font-size: 14px;
        font-weight: 600;
        color: #2196f3;
        background-color: #e3f2fd;
        padding: 2px 10px;
        border-radius: 12px;
        min-width: 30px;
        text-align: center;
      }
    }

    .slowest-states {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .slowest-state-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #fff8e1;
      border-radius: 6px;
      border-left: 4px solid #ff9800;

      .state-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;

        .state-function {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .state-meta {
          display: flex;
          gap: 8px;
          align-items: center;

          .state-type-badge {
            font-size: 11px;
            font-weight: 600;
            color: #fff;
            background-color: #607d8b;
            padding: 2px 8px;
            border-radius: 10px;
            text-transform: uppercase;
          }

          .state-sls {
            font-size: 11px;
            color: #666;
            font-family: monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .state-duration {
        font-size: 16px;
        font-weight: 700;
        color: #ff9800;
        white-space: nowrap;
        margin-left: 16px;
      }
    }
  `]
})
export class HighstateDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HighstateDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HighstateExecution
  ) {
  }

  hasChanges(state: HighstateState): boolean {
    return state.changes != null &&
      typeof state.changes === 'object' &&
      Object.keys(state.changes).length > 0;
  }

  getChangedStates(): HighstateState[] {
    return this.data.states.filter(s => this.hasChanges(s));
  }

  getSuccessRate(): string {
    if (this.data.totalStates === 0) return '0.0';
    return ((this.data.succeededStates / this.data.totalStates) * 100).toFixed(1);
  }

  getStatesBySls(): { name: string; count: number }[] {
    const slsMap = new Map<string, number>();

    this.data.states.forEach(state => {
      const sls = state.sls || 'unknown';
      slsMap.set(sls, (slsMap.get(sls) || 0) + 1);
    });

    return Array.from(slsMap.entries())
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count);
  }

  getSlowestStates(): HighstateState[] {
    return [...this.data.states]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  exportJson(): void {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `highstate-${this.data.jobId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
