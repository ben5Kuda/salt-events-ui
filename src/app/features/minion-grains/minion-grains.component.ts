import { Component, inject, OnInit, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MinionGrainsStore } from '../../core/store/minion-grains.store';
import { MinionGrain } from '../../core/models/minion-grain.model';
import { MinionGrainDetailDialogComponent } from './minion-grain-detail-dialog.component';

@Component({
  selector: 'app-minion-grains',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="minions-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>computer</mat-icon>
            Minion Grains
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="refresh()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (store.isLoading()) {
            <div class="loading">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Loading minion grains...</p>
            </div>
          } @else if (dataSource.data.length === 0) {
            <div class="no-data">
              <mat-icon>inbox</mat-icon>
              <p>No minion grains found</p>
            </div>
          } @else {
            <!-- Summary Stats -->
            <div class="summary-stats">
              <div class="stat-card">
                <mat-icon class="stat-icon">devices</mat-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ store.totalMinions() }}</div>
                  <div class="stat-label">Total Minions</div>
                </div>
              </div>
              <div class="stat-card">
                <mat-icon class="stat-icon success">check_circle</mat-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ store.provisionedMinions() }}</div>
                  <div class="stat-label">Provisioned</div>
                </div>
              </div>
              <div class="stat-card">
                <mat-icon class="stat-icon warning">update</mat-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ store.upgradeInProgress() }}</div>
                  <div class="stat-label">Upgrading</div>
                </div>
              </div>
            </div>

            <!-- Search Field -->
            <mat-form-field class="search-field">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search by minion ID, OS, IP...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Table -->
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="minions-table">
                <!-- Minion ID Column -->
                <ng-container matColumnDef="minionId">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                  <td mat-cell *matCellDef="let row" class="minion-id">{{ row.minionId }}</td>
                </ng-container>

                <!-- OS Column -->
                <ng-container matColumnDef="os">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Operating System</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="os-info">
                      <mat-icon class="os-icon">{{ getOsIcon(row.os) }}</mat-icon>
                      <span>{{ row.os }} {{ row.osVersion }}</span>
                    </div>
                  </td>
                </ng-container>

                <!-- Hardware Column -->
                <ng-container matColumnDef="hardware">
                  <th mat-header-cell *matHeaderCellDef>Hardware</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="hardware-info">
                      <div class="hw-item" [matTooltip]="row.cpuModel">
                        <mat-icon>memory</mat-icon>
                        <span>{{ row.numCpus }} CPUs</span>
                      </div>
                      <div class="hw-item">
                        <mat-icon>storage</mat-icon>
                        <span>{{ row.memTotal }} MB</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- IP Addresses Column -->
                <ng-container matColumnDef="ipAddresses">
                  <th mat-header-cell *matHeaderCellDef>IP Addresses</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="ip-addresses">
                      @for (ip of getFirstTwoIps(row.ipAddresses); track ip) {
                        <mat-chip class="ip-chip">{{ ip }}</mat-chip>
                      }
                      @if (row.ipAddresses.length > 2) {
                        <mat-chip class="more-chip" [matTooltip]="getMoreIpsTooltip(row.ipAddresses)">
                          +{{ row.ipAddresses.length - 2 }}
                        </mat-chip>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip [class]="getStatusClass(row)">
                      {{ getStatus(row) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Last Updated Column -->
                <ng-container matColumnDef="lastUpdated">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
                  <td mat-cell *matCellDef="let row">{{ row.lastUpdated | date:'short' }}</td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let row">
                    <button mat-icon-button (click)="viewDetails(row)" color="primary" matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="minion-row"></tr>
              </table>
            </div>

            <!-- Pagination -->
            <mat-paginator
              #paginator
              [pageSizeOptions]="[10, 20, 50, 100]"
              [pageSize]="20"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .minions-container {
      padding: 24px;
      max-width: 1800px;
      margin: 0 auto;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 20px;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    mat-card-content {
      padding: 24px;
    }

    .loading, .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #666;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: #f5f5f5;
        border-radius: 8px;

        .stat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #666;

          &.success {
            color: #4caf50;
          }

          &.warning {
            color: #ff9800;
          }
        }

        .stat-content {
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #333;
          }

          .stat-label {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .search-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    table {
      width: 100%;
    }

    .minion-row {
      &:hover {
        background-color: #f5f5f5;
      }
    }

    .minion-id {
      font-family: monospace;
      font-size: 13px;
      color: #1976d2;
      font-weight: 500;
    }

    .os-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .os-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #666;
      }
    }

    .hardware-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .hw-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #666;
        }
      }
    }

    .ip-addresses {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .ip-chip {
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;
      }

      .more-chip {
        background-color: #e0e0e0 !important;
        font-size: 11px;
        min-height: 24px;
        padding: 0 8px;
      }
    }

    mat-chip {
      &.status-provisioned {
        background-color: #e8f5e9 !important;
        color: #2e7d32 !important;
      }

      &.status-upgrading {
        background-color: #fff3e0 !important;
        color: #f57c00 !important;
      }

      &.status-unknown {
        background-color: #f5f5f5 !important;
        color: #666 !important;
      }
    }
  `]
})
export class MinionGrainsComponent implements OnInit, AfterViewInit {
  readonly store = inject(MinionGrainsStore);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'minionId',
    'os',
    'hardware',
    'ipAddresses',
    'status',
    'lastUpdated',
    'actions'
  ];

  dataSource = new MatTableDataSource<MinionGrain>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // ✅ Fix: Make sure effect properly updates the dataSource
    effect(() => {
      const minions = this.store.minions();
      console.log('Effect triggered, minions:', minions); // ✅ Add this log
      this.dataSource.data = minions;
      console.log('DataSource updated, data length:', this.dataSource.data.length); // ✅ Add this log
    });
  }

  ngOnInit() {
    console.log('Component initialized');
    this.refresh();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  refresh() {
    this.store.loadMinions();
  }

  viewDetails(minion: MinionGrain) {
    this.dialog.open(MinionGrainDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: minion
    });
  }

  getFirstTwoIps(ips: string[]): string[] {
    return ips.slice(0, 2);
  }

  getMoreIpsTooltip(ips: string[]): string {
    return ips.slice(2).join('\n');
  }

  getOsIcon(os: string): string {
    if (os.toLowerCase().includes('ubuntu') || os.toLowerCase().includes('debian')) {
      return 'linux';
    }
    if (os.toLowerCase().includes('windows')) {
      return 'desktop_windows';
    }
    return 'computer';
  }

  getStatus(minion: MinionGrain): string {
    const provStatus = minion.customGrains['iotpe_provisioning_status'];
    const upgradeStatus = minion.customGrains['iotpe_upgrade_status'];

    if (upgradeStatus === 'in-progress') {
      return 'Upgrading';
    }
    if (provStatus === 'provisioned') {
      return 'Provisioned';
    }
    return 'Unknown';
  }

  getStatusClass(minion: MinionGrain): string {
    const status = this.getStatus(minion);
    if (status === 'Provisioned') return 'status-provisioned';
    if (status === 'Upgrading') return 'status-upgrading';
    return 'status-unknown';
  }
}
