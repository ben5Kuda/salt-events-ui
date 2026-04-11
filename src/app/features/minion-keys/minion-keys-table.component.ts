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
  templateUrl: './minion-keys-table.component.html',
  styleUrls: ['./minion-keys-table.component.scss']
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
