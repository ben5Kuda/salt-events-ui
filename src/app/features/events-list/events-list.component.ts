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
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
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
