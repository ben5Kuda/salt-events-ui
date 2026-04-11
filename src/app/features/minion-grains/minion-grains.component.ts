import { Component, inject, OnInit, ViewChild, AfterViewInit, effect } from '@angular/core';
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
    MatSortModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './minion-grains.component.html',
  styleUrls: ['./minion-grains.component.scss']
})
export class MinionGrainsComponent implements OnInit, AfterViewInit {
  readonly store = inject(MinionGrainsStore);
  private readonly dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'minionId',
    'os',
    'hardware',
    'ipAddresses',
    'status',
    'lastUpdated',
    'actions'
  ];

  dataSource = new MatTableDataSource<MinionGrain>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const minions = this.store.minions();
      this.dataSource.data = minions;
    });
  }

  async ngOnInit() {
    await this.refresh();
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

  async refresh() {
    await Promise.all([
      this.store.loadMinions()
    ]);
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
