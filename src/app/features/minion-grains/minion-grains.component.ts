import { Component, inject, OnInit, computed, signal } from '@angular/core';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MinionGrainsStore } from '../../core/store/minion-grains.store';
import { MinionGrain } from '../../core/models/minion-grain.model';
import { MinionGrainDetailDialogComponent } from './minion-grain-detail-dialog.component';

@Component({
  selector: 'app-minion-grains',
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
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './minion-grains.component.html',
  styleUrls: ['./minion-grains.component.scss']
})
export class MinionGrainsComponent implements OnInit {
  readonly store = inject(MinionGrainsStore);
  private readonly dialog = inject(MatDialog);
  defaultPageSize = 10;

  displayedColumns: string[] = [
    'minionId',
    'os',
    'hardware',
    'ipAddresses',
    'status',
    'lastUpdated',
    'actions'
  ];

  // Signals for filtering and pagination
  filterText = signal('');
  pageSize = signal(this.defaultPageSize);
  pageIndex = signal(0);

  // Computed signal for filtered minions
  filteredMinions = computed(() => {
    const minions = this.store.minions();
    const filter = this.filterText().toLowerCase();

    if (!filter) return minions;

    return minions.filter((m: { minionId: string; os: string; osVersion: string; ipAddresses: any[]; }) =>
      m.minionId.toLowerCase().includes(filter) ||
      m.os.toLowerCase().includes(filter) ||
      m.osVersion.toLowerCase().includes(filter) ||
      m.ipAddresses.some(ip => ip.includes(filter))
    );
  });

  // Computed signal for paginated minions
  paginatedMinions = computed(() => {
    const minions = this.filteredMinions();
    const start = this.pageIndex() * this.pageSize();
    return minions.slice(start, start + this.pageSize());
  });

  totalMinions = computed(() => this.filteredMinions().length);

  async ngOnInit() {
    await this.refresh();
  }

  applyFilter(value: string) {
    this.filterText.set(value.trim().toLowerCase());
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  async refresh() {
    await this.store.loadMinions();
  }

  viewDetails(minion: MinionGrain) {
    this.dialog.open(MinionGrainDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: minion
    });
  }

  getFirstTwoIps(ips: string[]): string[] {
    return ips.slice(0, 2);
  }

  getMoreIpsTooltip(ips: string[]): string {
    return ips.slice(2).join('\n');
  }

  getOsIcon(os: string): string {
    if (os.toLowerCase().includes('ubuntu') || os.toLowerCase().includes('debian')) {
      return 'linux';
    }
    if (os.toLowerCase().includes('windows')) {
      return 'desktop_windows';
    }
    return 'computer';
  }

  getStatus(minion: MinionGrain): string {
    const provStatus = minion.customGrains['iotpe_provisioning_status'];
    const upgradeStatus = minion.customGrains['iotpe_upgrade_status'];

    if (upgradeStatus === 'in-progress') {
      return 'Upgrading';
    }
    if (provStatus === 'provisioned') {
      return 'Provisioned';
    }
    return 'Unknown';
  }

  getStatusClass(minion: MinionGrain): string {
    const status = this.getStatus(minion);
    if (status === 'Provisioned') return 'status-provisioned';
    if (status === 'Upgrading') return 'status-upgrading';
    return 'status-unknown';
  }
}
