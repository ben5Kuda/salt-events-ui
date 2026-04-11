import {Component, inject, OnInit, ViewChild, AfterViewInit, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MinionKeysStore } from '../../core/store/minion-keys.store';
import { MinionKey } from '../../core/models/minion-key';

@Component({
  selector: 'app-minion-keys',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTabsModule
  ],
  template: `
    <div class="minion-keys-container">
      <div class="header">
        <h1>
          <mat-icon>vpn_key</mat-icon>
          Minion Keys
        </h1>
        <button mat-raised-button color="primary" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      @if (store.isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading minion keys...</p>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-icon class="card-icon">vpn_key</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.totalKeys() }}</div>
              <div class="card-label">Total Keys</div>
            </div>
          </mat-card>

          <mat-card class="summary-card accepted">
            <mat-icon class="card-icon">check_circle</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.acceptedCount() }}</div>
              <div class="card-label">Accepted</div>
            </div>
          </mat-card>

          <mat-card class="summary-card pending">
            <mat-icon class="card-icon">schedule</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.pendingCount() }}</div>
              <div class="card-label">Pending</div>
            </div>
          </mat-card>

          <mat-card class="summary-card rejected">
            <mat-icon class="card-icon">cancel</mat-icon>
            <div class="card-content">
              <div class="card-value">{{ store.rejectedCount() }}</div>
              <div class="card-label">Rejected</div>
            </div>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-tab-group class="keys-tabs">
          <!-- All Keys Tab -->
          <mat-tab label="All Keys">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card>
                  <mat-form-field class="search-field">
                    <mat-label>Search</mat-label>
                    <input matInput (keyup)="applyFilter($event, allKeysDataSource)" placeholder="Search minion ID...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <div class="table-container">
                    <table mat-table [dataSource]="allKeysDataSource" matSort class="keys-table">
                      <!-- Minion ID Column -->
                      <ng-container matColumnDef="minionId">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                        <td mat-cell *matCellDef="let row">{{ row.minionId }}</td>
                      </ng-container>

                      <!-- Status Column -->
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                        <td mat-cell *matCellDef="let row">
                          <mat-chip [class]="'status-chip ' + row.status">
                            {{ row.status | titlecase }}
                          </mat-chip>
                        </td>
                      </ng-container>

                      <!-- Timestamp Column -->
                      <ng-container matColumnDef="timestamp">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
                        <td mat-cell *matCellDef="let row">{{ row.timestamp | date:'short' }}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="key-row"></tr>
                    </table>
                  </div>

                  <mat-paginator
                    #allKeysPaginator
                    [pageSizeOptions]="[10, 20, 50, 100]"
                    [pageSize]="20"
                    showFirstLastButtons>
                  </mat-paginator>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>

          <!-- Accepted Tab -->
          <mat-tab [label]="'Accepted (' + store.acceptedCount() + ')'">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card>
                  <mat-form-field class="search-field">
                    <mat-label>Search</mat-label>
                    <input matInput (keyup)="applyFilter($event, acceptedDataSource)" placeholder="Search minion ID...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <div class="table-container">
                    <table mat-table [dataSource]="acceptedDataSource" matSort class="keys-table">
                      <ng-container matColumnDef="minionId">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                        <td mat-cell *matCellDef="let row">{{ row.minionId }}</td>
                      </ng-container>

                      <ng-container matColumnDef="timestamp">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
                        <td mat-cell *matCellDef="let row">{{ row.timestamp | date:'short' }}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="simpleDisplayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: simpleDisplayedColumns;" class="key-row"></tr>
                    </table>
                  </div>

                  <mat-paginator
                    #acceptedPaginator
                    [pageSizeOptions]="[10, 20, 50, 100]"
                    [pageSize]="20"
                    showFirstLastButtons>
                  </mat-paginator>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>

          <!-- Pending Tab -->
          <mat-tab [label]="'Pending (' + store.pendingCount() + ')'">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card>
                  <mat-form-field class="search-field">
                    <mat-label>Search</mat-label>
                    <input matInput (keyup)="applyFilter($event, pendingDataSource)" placeholder="Search minion ID...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <div class="table-container">
                    <table mat-table [dataSource]="pendingDataSource" matSort class="keys-table">
                      <ng-container matColumnDef="minionId">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                        <td mat-cell *matCellDef="let row">{{ row.minionId }}</td>
                      </ng-container>

                      <ng-container matColumnDef="timestamp">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
                        <td mat-cell *matCellDef="let row">{{ row.timestamp | date:'short' }}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="simpleDisplayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: simpleDisplayedColumns;" class="key-row"></tr>
                    </table>
                  </div>

                  <mat-paginator
                    #pendingPaginator
                    [pageSizeOptions]="[10, 20, 50, 100]"
                    [pageSize]="20"
                    showFirstLastButtons>
                  </mat-paginator>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>

          <!-- Rejected Tab -->
          <mat-tab [label]="'Rejected (' + store.rejectedCount() + ')'">
            <ng-template matTabContent>
              <div class="tab-content">
                <mat-card>
                  <mat-form-field class="search-field">
                    <mat-label>Search</mat-label>
                    <input matInput (keyup)="applyFilter($event, rejectedDataSource)" placeholder="Search minion ID...">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <div class="table-container">
                    <table mat-table [dataSource]="rejectedDataSource" matSort class="keys-table">
                      <ng-container matColumnDef="minionId">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                        <td mat-cell *matCellDef="let row">{{ row.minionId }}</td>
                      </ng-container>

                      <ng-container matColumnDef="timestamp">
                        <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
                        <td mat-cell *matCellDef="let row">{{ row.timestamp | date:'short' }}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="simpleDisplayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: simpleDisplayedColumns;" class="key-row"></tr>
                    </table>
                  </div>

                  <mat-paginator
                    #rejectedPaginator
                    [pageSizeOptions]="[10, 20, 50, 100]"
                    [pageSize]="20"
                    showFirstLastButtons>
                  </mat-paginator>
                </mat-card>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .minion-keys-container {
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
      padding: 60px;
      gap: 20px;

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      &.accepted {
        border-left: 4px solid #4caf50;
      }

      &.pending {
        border-left: 4px solid #ff9800;
      }

      &.rejected {
        border-left: 4px solid #f44336;
      }

      .card-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #666;
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

    .keys-tabs {
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
      margin-bottom: 16px;
    }

    .keys-table {
      width: 100%;

      .key-row {
        &:hover {
          background-color: #f5f5f5;
        }
      }
    }

    .status-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      &.accepted {
        background-color: #e8f5e9 !important;
        color: #2e7d32 !important;
      }

      &.pending {
        background-color: #fff3e0 !important;
        color: #f57c00 !important;
      }

      &.rejected, &.denied {
        background-color: #ffebee !important;
        color: #c62828 !important;
      }
    }
  `]
})
export class MinionKeysComponent implements OnInit, AfterViewInit {
  readonly store = inject(MinionKeysStore);

  displayedColumns: string[] = ['minionId', 'status', 'timestamp'];
  simpleDisplayedColumns: string[] = ['minionId', 'timestamp'];

  allKeysDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);
  acceptedDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);
  pendingDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);
  rejectedDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);

  @ViewChild('allKeysPaginator') allKeysPaginator!: MatPaginator;
  @ViewChild('acceptedPaginator') acceptedPaginator!: MatPaginator;
  @ViewChild('pendingPaginator') pendingPaginator!: MatPaginator;
  @ViewChild('rejectedPaginator') rejectedPaginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // ✅ Use effect to reactively update tables when store changes
    effect(() => {
      const allKeys = this.store.keys();

      this.allKeysDataSource.data = [...allKeys];
      this.acceptedDataSource.data = [...allKeys.filter((k: { status: string; }) => k.status === 'accepted')];
      this.pendingDataSource.data = [...allKeys.filter((k: { status: string; }) => k.status === 'pending')];
      this.rejectedDataSource.data = [...allKeys.filter((k: { status: string; }) => k.status === 'rejected' || k.status === 'denied')];
    });
  }

  ngOnInit() {
    this.refresh();
  }

  ngAfterViewInit() {
    // ✅ Set paginators after view init
    setTimeout(() => {
      this.allKeysDataSource.paginator = this.allKeysPaginator;
      this.acceptedDataSource.paginator = this.acceptedPaginator;
      this.pendingDataSource.paginator = this.pendingPaginator;
      this.rejectedDataSource.paginator = this.rejectedPaginator;
    });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  refresh() {
    this.store.refresh();
  }
}
