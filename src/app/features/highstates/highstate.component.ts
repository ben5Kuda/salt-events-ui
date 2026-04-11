import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { HighstateStore } from '../../core/store/highstate.store';
import { HighstateDetailDialogComponent } from './highstate-detail-dialog.component';
import {HighstateExecution} from "../../core/models/highstates.model";

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
    MatSortModule,
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

  private executionFilterValue = '';
  private minionFilterValue = '';

  ngOnInit() {
    this.refresh();
  }

  filteredExecutions() {
    const executions = this.store.executions();
    if (!this.executionFilterValue) {
      return executions;
    }

    const filter = this.executionFilterValue.toLowerCase();
    return executions.filter((e: { minionId: string; jobId: string; success: any; }) =>
      e.minionId.toLowerCase().includes(filter) ||
      e.jobId.toLowerCase().includes(filter) ||
      (e.success ? 'success' : 'failed').includes(filter)
    );
  }

  filteredMinions() {
    const minions = this.store.statsByMinion();
    if (!this.minionFilterValue) {
      return minions;
    }

    const filter = this.minionFilterValue.toLowerCase();
    return minions.filter((m: { minionId: string; }) =>
      m.minionId.toLowerCase().includes(filter)
    );
  }

  applyExecutionFilter(event: Event) {
    this.executionFilterValue = (event.target as HTMLInputElement).value;
  }

  applyMinionFilter(event: Event) {
    this.minionFilterValue = (event.target as HTMLInputElement).value;
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
