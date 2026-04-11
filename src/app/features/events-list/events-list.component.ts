import {Component, inject, Input, OnInit, ViewChild, AfterViewInit, effect} from '@angular/core';
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
import { SaltEventsStore } from '../../core/store/salt-events.store';
import { SaltEvent } from '../../core/models/salt-event.model';
import { EventDetailDialogComponent } from './event-detail-dialog.component';

@Component({
  selector: 'app-events-list',
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
    <div class="events-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>event</mat-icon>
            Recent Events
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
              <p>Loading events...</p>
            </div>
          } @else if (dataSource.data.length === 0) {
            <div class="no-data">
              <mat-icon>inbox</mat-icon>
              <p>No events found</p>
            </div>
          } @else {
            <!-- Search Field -->
            <mat-form-field class="search-field">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search events...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Table -->
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="events-table">
                <!-- Timestamp Column -->
                <ng-container matColumnDef="timestamp">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                  <td mat-cell *matCellDef="let row">{{ row.timestamp | date:'short' }}</td>
                </ng-container>

                <!-- Event Type Column -->
                <ng-container matColumnDef="event_type">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Event Type</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip [class]="'event-type-chip ' + getEventTypeClass(row.event_type)">
                      {{ row.event_type }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- ✅ NEW: Event Action/Sub-Type Column -->
                <ng-container matColumnDef="event_action">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Action / State</th>
                  <td mat-cell *matCellDef="let row" class="event-action">
                    <span [matTooltip]="getFullArguments(row)" matTooltipPosition="above">
                      {{ getEventAction(row) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Function Column -->
                <ng-container matColumnDef="function">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Function</th>
                  <td mat-cell *matCellDef="let row">{{ row.function || 'N/A' }}</td>
                </ng-container>

                <!-- Minion ID Column -->
                <ng-container matColumnDef="minion_id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Minion ID</th>
                  <td mat-cell *matCellDef="let row">{{ row.minion_id || 'N/A' }}</td>
                </ng-container>

                <!-- Job ID Column -->
                <ng-container matColumnDef="job_id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Job ID</th>
                  <td mat-cell *matCellDef="let row" class="job-id">{{ row.job_id || 'N/A' }}</td>
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

                <!-- ✅ Success Column with Icons -->
                <ng-container matColumnDef="success">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let row" class="status-cell">
                    @if (row.success) {
                      <mat-icon class="success-icon" matTooltip="Success">check_circle</mat-icon>
                    } @else {
                      <mat-icon class="failure-icon" matTooltip="Failed">cancel</mat-icon>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="event-row"></tr>
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
    .events-container {
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

    .event-row {
      &:hover {
        background-color: #f5f5f5;
      }
    }

    .job-id {
      font-family: monospace;
      font-size: 12px;
    }

    /* ✅ Style for event action column */
    .event-action {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #1976d2;
      font-weight: 500;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: help;
    }

    .status-cell {
      text-align: center;

      .success-icon {
        color: #4caf50;
        font-size: 24px;
        width: 24px;
        height: 24px;
        cursor: pointer;
      }

      .failure-icon {
        color: #f44336;
        font-size: 24px;
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
    }

    .event-action {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #1976d2;
      font-weight: 500;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: help;

      /* ✅ Handle [object Object] display */
      &:empty::before {
        content: 'N/A';
        color: #999;
      }
    }

    .event-type-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;

      &.job-execution {
        background-color: #e3f2fd !important;
        color: #1976d2 !important;
      }

      &.authentication {
        background-color: #f3e5f5 !important;
        color: #7b1fa2 !important;
      }

      &.minion-lifecycle {
        background-color: #e8f5e9 !important;
        color: #388e3c !important;
      }

      &.provisioning {
        background-color: #fff3e0 !important;
        color: #f57c00 !important;
      }
    }
  `]
})
export class EventsListComponent implements OnInit, AfterViewInit {
  @Input() limit = 50;
  readonly store = inject(SaltEventsStore);
  private readonly dialog = inject(MatDialog);

  // ✅ Add event_action to displayed columns
  displayedColumns: string[] = [
    'timestamp',
    'event_type',
    'event_action',  // NEW
    'function',
    'minion_id',
    'job_id',
    'success',
    'actions'
  ];

  dataSource = new MatTableDataSource<SaltEvent>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const events = this.store.events();
      this.dataSource.data = [...events];
    });
  }

  ngOnInit() {
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
    this.store.loadEvents(this.limit);
  }

  viewDetails(event: SaltEvent) {
    this.dialog.open(EventDetailDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: event
    });
  }

  // ✅ Extract event action from original_data.arg[0]
  getEventAction(event: SaltEvent): string {
    try {
      // If backend provides event_action, use it
      if (event.event_action) {
        return event.event_action;
      }

      // Otherwise, extract from original_data
      const args = event.original_data?.arg;
      if (args && Array.isArray(args) && args.length > 0) {
        return args[0];
      }

      // Fallback to function
      return event.function || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  // ✅ Get full arguments for tooltip
  getFullArguments(event: SaltEvent): string {
    try {
      const args = event.original_data?.arg;
      if (args && Array.isArray(args)) {
        return args.join('\n');
      }
      return 'No arguments available';
    } catch {
      return 'No arguments available';
    }
  }

  getEventTypeClass(eventType: string): string {
    if (eventType?.includes('job')) return 'job-execution';
    if (eventType?.includes('auth')) return 'authentication';
    if (eventType?.includes('minion')) return 'minion-lifecycle';
    if (eventType?.includes('provision')) return 'provisioning';
    return '';
  }
}
