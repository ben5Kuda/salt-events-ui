import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MinionKeysStore } from '../../core/store/minion-keys.store';


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
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './minion-keys.component.html',
  styleUrls: ['./minion-keys.component.scss']
})
export class MinionKeysComponent implements OnInit {
  readonly store = inject(MinionKeysStore);

  displayedColumns: string[] = ['minionId', 'status', 'timestamp'];
  simpleDisplayedColumns: string[] = ['minionId', 'timestamp'];

  defaultPageSize = 10;

  // Signals for each tab's filtering and pagination
  allFilterText = signal('');
  allPageSize = signal(this.defaultPageSize);
  allPageIndex = signal(0);

  acceptedFilterText = signal('');
  acceptedPageSize = signal(this.defaultPageSize);
  acceptedPageIndex = signal(0);

  pendingFilterText = signal('');
  pendingPageSize = signal(this.defaultPageSize);
  pendingPageIndex = signal(0);

  rejectedFilterText = signal('');
  rejectedPageSize = signal(this.defaultPageSize);
  rejectedPageIndex = signal(0);

  // Computed signals for All Keys tab
  filteredAllKeys = computed(() => {
    const keys = this.store.keys();
    const filter = this.allFilterText().toLowerCase();
    if (!filter) return keys;
    return keys.filter((k: { minionId: string; }) => k.minionId.toLowerCase().includes(filter));
  });

  paginatedAllKeys = computed(() => {
    const keys = this.filteredAllKeys();
    const start = this.allPageIndex() * this.allPageSize();
    return keys.slice(start, start + this.allPageSize());
  });

  totalAllKeys = computed(() => this.filteredAllKeys().length);

  // Computed signals for Accepted tab
  filteredAcceptedKeys = computed(() => {
    const keys = this.store.keys().filter((k: { status: string; }) => k.status === 'accepted');
    const filter = this.acceptedFilterText().toLowerCase();
    if (!filter) return keys;
    return keys.filter((k: { minionId: string; }) => k.minionId.toLowerCase().includes(filter));
  });

  paginatedAcceptedKeys = computed(() => {
    const keys = this.filteredAcceptedKeys();
    const start = this.acceptedPageIndex() * this.acceptedPageSize();
    return keys.slice(start, start + this.acceptedPageSize());
  });

  totalAcceptedKeys = computed(() => this.filteredAcceptedKeys().length);

  // Computed signals for Pending tab
  filteredPendingKeys = computed(() => {
    const keys = this.store.keys().filter((k: { status: string; }) => k.status === 'pending');
    const filter = this.pendingFilterText().toLowerCase();
    if (!filter) return keys;
    return keys.filter((k: { minionId: string; }) => k.minionId.toLowerCase().includes(filter));
  });

  paginatedPendingKeys = computed(() => {
    const keys = this.filteredPendingKeys();
    const start = this.pendingPageIndex() * this.pendingPageSize();
    return keys.slice(start, start + this.pendingPageSize());
  });

  totalPendingKeys = computed(() => this.filteredPendingKeys().length);

  // Computed signals for Rejected tab
  filteredRejectedKeys = computed(() => {
    const keys = this.store.keys().filter((k: { status: string; }) => k.status === 'rejected' || k.status === 'denied');
    const filter = this.rejectedFilterText().toLowerCase();
    if (!filter) return keys;
    return keys.filter((k: { minionId: string; }) => k.minionId.toLowerCase().includes(filter));
  });

  paginatedRejectedKeys = computed(() => {
    const keys = this.filteredRejectedKeys();
    const start = this.rejectedPageIndex() * this.rejectedPageSize();
    return keys.slice(start, start + this.rejectedPageSize());
  });

  totalRejectedKeys = computed(() => this.filteredRejectedKeys().length);

  ngOnInit() {
    this.refresh();
  }

  applyAllFilter(value: string) {
    this.allFilterText.set(value.trim().toLowerCase());
    this.allPageIndex.set(0);
  }

  applyAcceptedFilter(value: string) {
    this.acceptedFilterText.set(value.trim().toLowerCase());
    this.acceptedPageIndex.set(0);
  }

  applyPendingFilter(value: string) {
    this.pendingFilterText.set(value.trim().toLowerCase());
    this.pendingPageIndex.set(0);
  }

  applyRejectedFilter(value: string) {
    this.rejectedFilterText.set(value.trim().toLowerCase());
    this.rejectedPageIndex.set(0);
  }

  onAllPageChange(event: PageEvent) {
    this.allPageIndex.set(event.pageIndex);
    this.allPageSize.set(event.pageSize);
  }

  onAcceptedPageChange(event: PageEvent) {
    this.acceptedPageIndex.set(event.pageIndex);
    this.acceptedPageSize.set(event.pageSize);
  }

  onPendingPageChange(event: PageEvent) {
    this.pendingPageIndex.set(event.pageIndex);
    this.pendingPageSize.set(event.pageSize);
  }

  onRejectedPageChange(event: PageEvent) {
    this.rejectedPageIndex.set(event.pageIndex);
    this.rejectedPageSize.set(event.pageSize);
  }

  refresh() {
    this.store.refresh();
  }
}
