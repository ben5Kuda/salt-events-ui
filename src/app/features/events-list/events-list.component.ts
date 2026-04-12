import {Component, inject, Input, OnInit, computed, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventsStore } from '../../core/store/events.store';
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
export class EventsListComponent implements OnInit {
  @Input() limit = 50;
  readonly store = inject(EventsStore);
  private readonly dialog = inject(MatDialog);
  defaultPageSize = 10;

  displayedColumns: string[] = [
    'timestamp',
    'event_type',
    'function',
    'minion_id',
    'job_id',
    'success',
    'actions'
  ];

  filterText = signal('');
  pageSize = signal(this.defaultPageSize);
  pageIndex = signal(0);

  displayedEvents = computed(() => {
    let events = this.store.events();

    const filter = this.filterText().toLowerCase();
    if (filter) {
      events = events.filter((e: { event_type: string; function: string; minion_id: string; job_id: string; }) =>
        e.event_type?.toLowerCase().includes(filter) ||
        e.function?.toLowerCase().includes(filter) ||
        e.minion_id?.toLowerCase().includes(filter) ||
        e.job_id?.toLowerCase().includes(filter)
      );
    }

    // Paginate
    const start = this.pageIndex() * this.pageSize();
    return events.slice(start, start + this.pageSize());
  });

  totalEvents = computed(() => {
    const filter = this.filterText().toLowerCase();
    if (!filter) return this.store.events().length;

    return this.store.events().filter((e: { event_type: string; function: string; minion_id: string; job_id: string; }) =>
      e.event_type?.toLowerCase().includes(filter) ||
      e.function?.toLowerCase().includes(filter) ||
      e.minion_id?.toLowerCase().includes(filter) ||
      e.job_id?.toLowerCase().includes(filter)
    ).length;
  });

  ngOnInit() {
    this.refresh();
  }

  applyFilter(value: string) {
    this.filterText.set(value.trim().toLowerCase());
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
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

  getEventAction(event: SaltEvent): string {
    if (event.event_action) return event.event_action;
    const args = event.original_data?.arg;
    if (args && Array.isArray(args) && args.length > 0) return args[0];
    return event.function || 'N/A';
  }

  getFullArguments(event: SaltEvent): string {
    const args = event.original_data?.arg;
    return args && Array.isArray(args) ? args.join('\n') : 'No arguments available';
  }

  getEventTypeClass(eventType: string): string {
    if (eventType === 'job_execution') return 'job-execution';
    if (eventType === 'authentication') return 'authentication';
    if (eventType === 'minion_lifecycle') return 'minion-lifecycle';
    if (eventType === 'provisioning') return 'provisioning';
    if (eventType === 'runner') return 'runner';
    if (eventType === 'state_execution') return 'state-execution';
    return '';
  }

  getFunction(event: SaltEvent): string {
    // First try the function property
    if (event.function) return event.function;

    // Then try to extract from original_data.fun
    try {
      const fun = event.original_data?.fun;
      if (fun) return fun;
    } catch {
      // Ignore
    }

    return 'N/A';
  }
}
