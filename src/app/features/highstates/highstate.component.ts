import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { HighstateStore } from '../../core/store/highstate.store';
import { HighstateDetailDialogComponent } from './highstate-detail-dialog.component';
import { HighstateExecution } from "../../core/models/highstates.model";

@Component({
  selector: 'app-highstate',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  templateUrl: './highstate.component.html',
  styleUrls: ['./highstate.component.scss']
})
export class HighstateComponent implements OnInit {
  readonly store = inject(HighstateStore);
  private readonly dialog = inject(MatDialog);

  defaultPageSize = 10;

  executionDisplayedColumns = [
    'timestamp',
    'minionId',
    'jobId',
    'status',
    'states',
    'changedStates',
    'totalChanges',
    'failed',
    'duration',
    'actions'
  ];

  minionDisplayedColumns = [
    'minionId',
    'executions',
    'successRate',
    'avgDuration',
    'totalStates',
    'changed',
    'failed',
    'lastExecution'
  ];

  // Signals for filtering and pagination
  executionFilterText = signal('');
  executionPageSize = signal(this.defaultPageSize);
  executionPageIndex = signal(0);

  minionFilterText = signal('');
  minionPageSize = signal(this.defaultPageSize);
  minionPageIndex = signal(0);

  // Computed signals for executions tab
  filteredExecutions = computed(() => {
    const executions = this.store.executions();
    const filter = this.executionFilterText().toLowerCase();

    if (!filter) return executions;

    return executions.filter((e: { minionId: string; jobId: string; success: any; }) =>
      e.minionId.toLowerCase().includes(filter) ||
      e.jobId.toLowerCase().includes(filter) ||
      (e.success ? 'success' : 'failed').includes(filter)
    );
  });

  paginatedExecutions = computed(() => {
    const executions = this.filteredExecutions();
    const start = this.executionPageIndex() * this.executionPageSize();
    return executions.slice(start, start + this.executionPageSize());
  });

  totalExecutions = computed(() => this.filteredExecutions().length);

  // Computed signals for minions tab
  filteredMinions = computed(() => {
    const minions = this.store.statsByMinion();
    const filter = this.minionFilterText().toLowerCase();

    if (!filter) return minions;

    return minions.filter((m: { minionId: string; }) =>
      m.minionId.toLowerCase().includes(filter)
    );
  });

  paginatedMinions = computed(() => {
    const minions = this.filteredMinions();
    const start = this.minionPageIndex() * this.minionPageSize();
    return minions.slice(start, start + this.minionPageSize());
  });

  totalMinions = computed(() => this.filteredMinions().length);

  ngOnInit() {
    this.refresh();
  }

  applyExecutionFilter(value: string) {
    this.executionFilterText.set(value.trim().toLowerCase());
    this.executionPageIndex.set(0);
  }

  applyMinionFilter(value: string) {
    this.minionFilterText.set(value.trim().toLowerCase());
    this.minionPageIndex.set(0);
  }

  onExecutionPageChange(event: PageEvent) {
    this.executionPageIndex.set(event.pageIndex);
    this.executionPageSize.set(event.pageSize);
  }

  onMinionPageChange(event: PageEvent) {
    this.minionPageIndex.set(event.pageIndex);
    this.minionPageSize.set(event.pageSize);
  }

  refresh() {
    this.store.refreshAll();
  }

  viewDetails(execution: HighstateExecution) {
    this.dialog.open(HighstateDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1400px',
      maxHeight: '90vh',
      data: execution
    });
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  getSuccessRateClass(rate: number): string {
    if (rate >= 90) return 'success-rate-high';
    if (rate >= 70) return 'success-rate-medium';
    return 'success-rate-low';
  }
}
