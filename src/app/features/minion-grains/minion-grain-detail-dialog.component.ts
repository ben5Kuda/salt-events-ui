import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MinionGrain } from '../../core/models/minion-grain.model';

@Component({
  selector: 'app-minion-grain-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>computer</mat-icon>
      Minion Grains: {{ minion.minionId }}
    </h2>

    <mat-dialog-content>
      <mat-tab-group>
        <!-- System Info Tab -->
        <mat-tab label="System Info">
          <div class="tab-content">
            <div class="detail-section">
              <h3>Operating System</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">OS:</span>
                  <span class="value">{{ minion.os }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Version:</span>
                  <span class="value">{{ minion.osVersion }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Release:</span>
                  <span class="value">{{ minion.osRelease || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">OS Finger:</span>
                  <span class="value">{{ minion.osFinger || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Kernel:</span>
                  <span class="value">{{ minion.kernel }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Kernel Release:</span>
                  <span class="value">{{ minion.kernelRelease }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>Hardware</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Manufacturer:</span>
                  <span class="value">{{ minion.manufacturer }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Product:</span>
                  <span class="value">{{ minion.productName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">CPU Model:</span>
                  <span class="value">{{ minion.cpuModel }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">CPU Count:</span>
                  <span class="value">{{ minion.numCpus }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Memory:</span>
                  <span class="value">{{ minion.memTotal }} MB</span>
                </div>
                <div class="detail-item">
                  <span class="label">GPU Count:</span>
                  <span class="value">{{ minion.numGpus }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Network Tab -->
        <mat-tab label="Network">
          <div class="tab-content">
            <div class="detail-section">
              <h3>Network Configuration</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">FQDN:</span>
                  <span class="value">{{ minion.fqdn }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Hostname:</span>
                  <span class="value">{{ minion.host || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Domain:</span>
                  <span class="value">{{ minion.domain || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>IP Addresses</h3>
              <div class="ip-list">
                @for (ip of minion.ipAddresses; track ip) {
                  <mat-chip class="ip-chip">{{ ip }}</mat-chip>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Salt Info Tab -->
        <mat-tab label="Salt Info">
          <div class="tab-content">
            <div class="detail-section">
              <h3>Salt Configuration</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Salt Version:</span>
                  <span class="value">{{ minion.saltVersion }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Master:</span>
                  <span class="value">{{ minion.master || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Machine ID:</span>
                  <span class="value">{{ minion.machineId || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Virtual:</span>
                  <span class="value">{{ minion.virtual || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Init System:</span>
                  <span class="value">{{ minion.init || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Last Updated:</span>
                  <span class="value">{{ minion.lastUpdated | date:'medium' }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- IoTPE Grains Tab -->
        <mat-tab label="IoTPE Grains">
          <div class="tab-content">
            <div class="detail-section">
              <h3>IoTPE Configuration</h3>
              <div class="custom-grains">
                @for (grain of getCustomGrainsArray(); track grain.key) {
                  <div class="grain-item">
                    <span class="grain-key">{{ formatGrainKey(grain.key) }}:</span>
                    <span class="grain-value">{{ grain.value }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Raw Data Tab -->
        <mat-tab label="Raw Data">
          <div class="tab-content">
            <pre class="json-display">{{ formatRawData() }}</pre>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 0;
    }

    .tab-content {
      padding: 24px;
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
    }

    .ip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .ip-chip {
        background-color: #e3f2fd !important;
        color: #1976d2 !important;
      }
    }

    .custom-grains {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .grain-item {
        display: flex;
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
        border-left: 3px solid #1976d2;

        .grain-key {
          font-weight: 600;
          color: #1976d2;
          min-width: 250px;
        }

        .grain-value {
          color: #333;
          word-break: break-word;
        }
      }
    }

    .json-display {
      background-color: #263238;
      color: #aed581;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      margin: 0;
      font-family: 'Courier New', monospace;
      line-height: 1.5;
    }
  `]
})
export class MinionGrainDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public minion: MinionGrain) {}

  getCustomGrainsArray(): { key: string; value: string }[] {
    return Object.entries(this.minion.customGrains).map(([key, value]) => ({
      key,
      value
    }));
  }

  formatGrainKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatRawData(): string {
    return JSON.stringify(this.minion, null, 2);
  }
}
