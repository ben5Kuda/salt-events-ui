import {Component, inject, OnInit, ViewChild, AfterViewInit, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MinionKeysStore } from '../../core/store/minion-keys.store';
import { MinionKey } from '../../core/models/minion-key';

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
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './minion-keys.component.html',
  styleUrls: ['./minion-keys.component.scss']
})
export class MinionKeysComponent implements OnInit, AfterViewInit {
  readonly store = inject(MinionKeysStore);

  displayedColumns: string[] = ['minionId', 'status', 'timestamp'];
  simpleDisplayedColumns: string[] = ['minionId', 'timestamp'];

  allKeysDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);
  acceptedDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);
  pendingDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);
  rejectedDataSource = new MatTableDataSource<MinionKey & { status: string }>([]);

  @ViewChild('allKeysPaginator') allKeysPaginator!: MatPaginator;
  @ViewChild('acceptedPaginator') acceptedPaginator!: MatPaginator;
  @ViewChild('pendingPaginator') pendingPaginator!: MatPaginator;
  @ViewChild('rejectedPaginator') rejectedPaginator!: MatPaginator;

  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // ✅ Use effect to reactively update tables when store changes
    effect(() => {
      const allKeys = this.store.keys();

      this.allKeysDataSource.data = [...allKeys];
      this.acceptedDataSource.data = [...allKeys.filter((k: { status: string; }) => k.status === 'accepted')];
      this.pendingDataSource.data = [...allKeys.filter((k: { status: string; }) => k.status === 'pending')];
      this.rejectedDataSource.data = [...allKeys.filter((k: { status: string; }) => k.status === 'rejected' || k.status === 'denied')];
    });
  }

  ngOnInit() {
    this.refresh();
  }

  ngAfterViewInit() {
    // ✅ Set paginators after view init
    setTimeout(() => {
      this.allKeysDataSource.paginator = this.allKeysPaginator;
      this.acceptedDataSource.paginator = this.acceptedPaginator;
      this.pendingDataSource.paginator = this.pendingPaginator;
      this.rejectedDataSource.paginator = this.rejectedPaginator;
    });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  refresh() {
    this.store.refresh();
  }
}
