import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MinionKey} from "../../core/models/minion-key";

@Component({
  selector: 'app-public-key-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>vpn_key</mat-icon>
      Public Key Details
    </h2>

    <mat-dialog-content>
      <div class="key-details">
        <div class="detail-row">
          <span class="label">Minion ID:</span>
          <span class="value">{{ data.minionId }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Key State:</span>
          <span class="value">
            <span [class]="'badge badge-' + data.keyState">
              {{ data.keyState | titlecase }}
            </span>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">Cluster:</span>
          <span class="value">{{ data.cluster || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Timestamp:</span>
          <span class="value">{{ data.timestamp | date:'full' }}</span>
        </div>
      </div>

      <div class="public-key-section">
        <div class="section-header">
          <h3>Public Key</h3>
          <button
            mat-icon-button
            matTooltip="Copy to clipboard"
            (click)="copyToClipboard()">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
        <pre class="public-key">{{ data.publicKey || 'No public key available' }}</pre>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
    }

    .key-details {
      margin-bottom: 24px;
    }

    .detail-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #666;
        width: 150px;
        flex-shrink: 0;
      }

      .value {
        flex: 1;
        color: #333;

        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;

          &.badge-pending {
            background-color: #fff3e0;
            color: #f57c00;
          }

          &.badge-accepted {
            background-color: #e8f5e9;
            color: #388e3c;
          }

          &.badge-rejected {
            background-color: #ffebee;
            color: #d32f2f;
          }

          &.badge-denied {
            background-color: #f5f5f5;
            color: #616161;
          }
        }
      }
    }

    .public-key-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #666;
        }
      }

      .public-key {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 300px;
        overflow-y: auto;
      }
    }
  `]
})
export class PublicKeyDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MinionKey) {}

  copyToClipboard() {
    navigator.clipboard.writeText(this.data.publicKey).then(() => {
      alert('Public key copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}
