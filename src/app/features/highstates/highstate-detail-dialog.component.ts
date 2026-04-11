import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import {HighstateExecution, HighstateState} from "../../core/models/highstates.model";

@Component({
  selector: 'app-highstate-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatExpansionModule
  ],
  templateUrl: './highstate-detail-dialog.component.html',
  styleUrls: ['./highstate-detail-dialog.component.scss'],
})
export class HighstateDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HighstateDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HighstateExecution
  ) {
  }

  hasChanges(state: HighstateState): boolean {
    return state.changes != null &&
      typeof state.changes === 'object' &&
      Object.keys(state.changes).length > 0;
  }

  getChangedStates(): HighstateState[] {
    return this.data.states.filter(s => this.hasChanges(s));
  }

  getSuccessRate(): string {
    if (this.data.totalStates === 0) return '0.0';
    return ((this.data.succeededStates / this.data.totalStates) * 100).toFixed(1);
  }

  getStatesBySls(): { name: string; count: number }[] {
    const slsMap = new Map<string, number>();

    this.data.states.forEach(state => {
      const sls = state.sls || 'unknown';
      slsMap.set(sls, (slsMap.get(sls) || 0) + 1);
    });

    return Array.from(slsMap.entries())
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count);
  }

  getSlowestStates(): HighstateState[] {
    return [...this.data.states]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  exportJson(): void {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `highstate-${this.data.jobId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
