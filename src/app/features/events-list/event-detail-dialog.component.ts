import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SaltEvent } from '../../core/models/salt-event.model';

@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>event</mat-icon>
      Event Details
    </h2>

    <mat-dialog-content>
      <!-- Basic Information -->
      <div class="detail-section">
        <h3>Basic Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Event ID:</span>
            <span class="value">{{ event.event_id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Job ID:</span>
            <span class="value">{{ event.job_id || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Timestamp:</span>
            <span class="value">{{ event.timestamp | date:'medium' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Event Type:</span>
            <mat-chip>{{ event.event_type }}</mat-chip>
          </div>
        </div>
      </div>

      <!-- Event Action & Arguments -->
      <div class="detail-section">
        <h3>Event Action & Arguments</h3>
        <div class="detail-grid">
          <div class="detail-item full-width">
            <span class="label">Primary Action:</span>
            <span class="value action-highlight">{{ getEventAction() }}</span>
          </div>
          @if (getArguments().length > 1) {
            <div class="detail-item full-width">
              <span class="label">Additional Arguments:</span>
              <div class="arguments-list">
                @for (arg of getArguments().slice(1); track $index) {
                  <code class="argument-item">{{ formatArgument(arg) }}</code>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Execution Details -->
      <div class="detail-section">
        <h3>Execution Details</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Function:</span>
            <span class="value">{{ event.function || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Minion ID:</span>
            <span class="value">{{ event.minion_id || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Success:</span>
            <div class="success-indicator">
              @if (event.success) {
                <mat-icon class="success-icon">check_circle</mat-icon>
                <span class="success-text">Success</span>
              } @else {
                <mat-icon class="failure-icon">cancel</mat-icon>
                <span class="failure-text">Failed</span>
              }
            </div>
          </div>
          @if (!event.success && getFailureReason()) {
            <div class="detail-item full-width">
              <span class="label">Failure Reason:</span>
              <div class="failure-reason">
                <mat-icon class="warning-icon">warning</mat-icon>
                <span class="value">{{ getFailureReason() }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Return Data (if available) -->
      @if (hasReturnData()) {
        <div class="detail-section">
          <h3>Return Data Summary</h3>
          <div class="return-summary">
            <div class="summary-item">
              <span class="label">Return Code:</span>
              <span class="value">{{ getReturnCode() }}</span>
            </div>
            @if (getReturnData()) {
              <div class="summary-item full-width">
                <span class="label">Details:</span>
                <pre class="return-data">{{ formatReturnData() }}</pre>
              </div>
            }
          </div>
        </div>
      }

      <!-- Raw Data -->
      <div class="detail-section">
        <h3>Raw Data</h3>
        <pre class="json-display">{{ formatRawData() }}</pre>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .detail-section {
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 8px;
      }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      &.full-width {
        grid-column: 1 / -1;
      }

      .label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .value {
        font-size: 14px;
        color: #333;
        word-break: break-word;
      }

      .action-highlight {
        font-family: 'Courier New', monospace;
        color: #1976d2;
        font-weight: 600;
        font-size: 15px;
        background-color: #e3f2fd;
        padding: 8px 12px;
        border-radius: 4px;
      }
    }

    .arguments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .argument-item {
      background-color: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
      border-left: 3px solid #1976d2;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .success-indicator {
      display: flex;
      align-items: center;
      gap: 8px;

      .success-icon {
        color: #4caf50;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .failure-icon {
        color: #f44336;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .success-text {
        color: #4caf50;
        font-weight: 600;
      }

      .failure-text {
        color: #f44336;
        font-weight: 600;
      }
    }

    .failure-reason {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background-color: #ffebee;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #f44336;

      .warning-icon {
        color: #f44336;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .value {
        color: #c62828;
        font-size: 13px;
        line-height: 1.5;
      }
    }

    .return-summary {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        &.full-width {
          width: 100%;
        }

        .label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .value {
          font-size: 14px;
          color: #333;
        }
      }
    }

    .return-data {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      max-height: 200px;
      margin: 0;
      border-left: 3px solid #ff9800;
    }

    .json-display {
      background-color: #263238;
      color: #aed581;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      max-height: 400px;
      margin: 0;
      font-family: 'Courier New', monospace;
      line-height: 1.5;
    }

    mat-chip {
      &.success {
        background-color: #4caf50 !important;
        color: white !important;
      }

      &.failed {
        background-color: #f44336 !important;
        color: white !important;
      }
    }
  `]
})
export class EventDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public event: SaltEvent) {}

  getEventAction(): string {
    try {
      const args = this.event.original_data?.arg;
      if (args && Array.isArray(args) && args.length > 0) {
        return this.formatArgument(args[0]);
      }
      return this.event.function || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  getArguments(): any[] {
    try {
      const args = this.event.original_data?.arg;
      if (args && Array.isArray(args)) {
        return args;
      }
      return [];
    } catch {
      return [];
    }
  }

  formatArgument(arg: any): string {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg, null, 2);
    }
    return String(arg);
  }

  getFailureReason(): string | null {
    try {
      const originalData = this.event.original_data;

      // Check for error message in return data
      if (originalData?.return) {
        const returnData = originalData.return;

        // Check for error in return
        if (typeof returnData === 'object' && returnData !== null) {
          // Look for common error fields
          if (returnData.error) {
            return returnData.error;
          }
          if (returnData.comment) {
            return returnData.comment;
          }
          if (returnData.stderr) {
            return returnData.stderr;
          }

          // Check for failed states in highstate returns
          if (typeof returnData === 'object') {
            for (const key in returnData) {
              const state = returnData[key];
              if (state && typeof state === 'object' && state.result === false) {
                return state.comment || `State ${key} failed`;
              }
            }
          }
        }

        // If return is a string error message
        if (typeof returnData === 'string') {
          return returnData;
        }
      }

      // Check retcode
      if (originalData?.retcode && originalData.retcode !== 0) {
        return `Process exited with code ${originalData.retcode}`;
      }

      return null;
    } catch {
      return null;
    }
  }

  hasReturnData(): boolean {
    return this.event.original_data?.return != null;
  }

  getReturnCode(): string {
    return this.event.original_data?.retcode?.toString() || 'N/A';
  }

  getReturnData(): any {
    return this.event.original_data?.return;
  }

  formatReturnData(): string {
    const returnData = this.getReturnData();
    if (!returnData) return 'No return data';

    if (typeof returnData === 'string') {
      return returnData;
    }

    if (typeof returnData === 'object') {
      return JSON.stringify(returnData, null, 2);
    }

    return String(returnData);
  }

  formatRawData(): string {
    try {
      return JSON.stringify(this.event.original_data, null, 2);
    } catch {
      return 'Unable to format raw data';
    }
  }
}
