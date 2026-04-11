import {Component, Input, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MinionKeysStore } from '../../core/store/minion-keys.store';
import { PublicKeyDialogComponent } from './public-key-dialog.component';
import {MinionKey} from "../../core/models/minion-key";

@Component({
  selector: 'app-minion-keys-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    @if (isLoading) {
      <div class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    } @else if (keys.length === 0) {
      <div class="no-data">
        <mat-icon>inbox</mat-icon>
        <p>No {{ state }} keys found</p>
      </div>
    } @else {
      <div class="table-actions">
        @if (store.hasSelectedKeys()) {
          <div class="selection-info">
            <span>{{ store.selectedCount() }} selected</span>
            <button mat-button (click)="store.clearSelection()">
              <mat-icon>clear</mat-icon>
              Clear Selection
            </button>
          </div>
        }

        @if (state === 'pending') {
          <div class="action-buttons">
            <button
              mat-raised-button
              color="primary"
              [disabled]="!store.hasSelectedKeys()"
              (click)="acceptSelected()">
              <mat-icon>check</mat-icon>
              Accept Key
            </button>
            <button
              mat-raised-button
              color="warn"
              [disabled]="!store.hasSelectedKeys()"
              (click)="rejectSelected()">
              <mat-icon>close</mat-icon>
              Reject Key
            </button>
            <button
              mat-raised-button
              [disabled]="!store.hasSelectedKeys()"
              (click)="deleteSelected()">
              <mat-icon>delete</mat-icon>
              Delete Key
            </button>
          </div>
        }

        @if (state === 'accepted' || state === 'rejected') {
          <div class="action-buttons">
            <button
              mat-raised-button
              color="warn"
              [disabled]="!store.hasSelectedKeys()"
              (click)="deleteSelected()">
              <mat-icon>delete</mat-icon>
              Delete Key
            </button>
          </div>
        }
      </div>

      <table mat-table [dataSource]="keys" class="keys-table">
        <!-- Checkbox Column -->
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox
              (change)="$event ? toggleAll() : null"
              [checked]="isAllSelected()"
              [indeterminate]="hasSelection() && !isAllSelected()">
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let key">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="$event ? store.toggleKeySelection(key.minionId) : null"
              [checked]="isSelected(key.minionId)">
            </mat-checkbox>
          </td>
        </ng-container>

        <!-- Cluster Column -->
        <ng-container matColumnDef="cluster">
          <th mat-header-cell *matHeaderCellDef>Cluster/Master</th>
          <td mat-cell *matCellDef="let key">
            <mat-chip class="cluster-chip">{{ key.cluster || 'N/A' }}</mat-chip>
          </td>
        </ng-container>

        <!-- Minion ID Column -->
        <ng-container matColumnDef="minionId">
          <th mat-header-cell *matHeaderCellDef>Minion ID</th>
          <td mat-cell *matCellDef="let key">
            <span class="minion-id">{{ key.minionId }}</span>
          </td>
        </ng-container>

        <!-- Key State Column -->
        <ng-container matColumnDef="keyState">
          <th mat-header-cell *matHeaderCellDef>Key State</th>
          <td mat-cell *matCellDef="let key">
            <mat-chip [class]="'state-chip state-' + key.keyState">
              {{ key.keyState | titlecase }}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Timestamp Column -->
        <ng-container matColumnDef="timestamp">
          <th mat-header-cell *matHeaderCellDef>Last Updated</th>
          <td mat-cell *matCellDef="let key">
            {{ key.timestamp | date:'short' }}
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let key">
            <button
              mat-icon-button
              matTooltip="View Public Key"
              (click)="viewPublicKey(key)">
              <mat-icon>visibility</mat-icon>
            </button>

          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="key-row"></tr>
      </table>
    }
  `,
  styles: [`
    .loading, .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
    }

    .table-actions {
      padding: 16px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      .selection-info {
        display: flex;
        align-items: center;
        gap: 12px;

        span {
          font-weight: 500;
          color: #666;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;
      }
    }

    .keys-table {
      width: 100%;

      th {
        font-weight: 600;
        color: #666;
      }

      .minion-id {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }

      .cluster-chip {
        background-color: #e3f2fd;
        color: #1976d2;
        font-size: 12px;
      }

      .state-chip {
        font-size: 12px;
        font-weight: 500;

        &.state-pending {
          background-color: #fff3e0;
          color: #f57c00;
        }

        &.state-accepted {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        &.state-rejected {
          background-color: #ffebee;
          color: #d32f2f;
        }

        &.state-denied {
          background-color: #f5f5f5;
          color: #616161;
        }
      }
    }

    .key-row {
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  `]
})
export class MinionKeysTableComponent implements OnInit{
  ngOnInit(): void {
    console.log('Keys input:', this.keys);
    console.log('Loaded keys:', this.store.keys());
  }

  @Input({ required: true }) keys: MinionKey[] = [];
  @Input({ required: true }) state!: string;
  @Input() isLoading = false;

  readonly store = inject(MinionKeysStore);
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['select', 'cluster', 'minionId', 'keyState', 'timestamp', 'actions'];

  isSelected(minionId: string): boolean {
    return this.store.selectedKeys().has(minionId);
  }

  isAllSelected(): boolean {
    return this.keys.length > 0 &&
      this.keys.every(key => this.store.selectedKeys().has(key.minionId));
  }

  hasSelection(): boolean {
    return this.store.hasSelectedKeys();
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.store.clearSelection();
    } else {
      this.store.selectAll(this.keys);
    }
  }

  viewPublicKey(key: MinionKey) {
    this.dialog.open(PublicKeyDialogComponent, {
      width: '700px',
      data: key
    });
  }

  acceptSelected() {
    const selected = Array.from(this.store.selectedKeys());
    alert(`Accept ${selected.length} keys\n\nThis would call the Salt API to accept multiple keys.`);
  }

  rejectSelected() {
    const selected = Array.from(this.store.selectedKeys());
    alert(`Reject ${selected.length} keys\n\nThis would call the Salt API to reject multiple keys.`);
  }

  deleteSelected() {
    const selected = Array.from(this.store.selectedKeys());
    if (confirm(`Are you sure you want to delete ${selected.length} keys?`)) {
      alert(`Delete ${selected.length} keys\n\nThis would call the Salt API to delete multiple keys.`);
    }
  }
}
