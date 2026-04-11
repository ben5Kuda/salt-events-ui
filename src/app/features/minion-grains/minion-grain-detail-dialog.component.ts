import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MinionGrain } from '../../core/models/minion-grain.model';

@Component({
  selector: 'app-minion-grain-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './minion-grain-detail-dialog.component.html',
  styleUrls:['./minion-grain-detail-dialog.component.scss']
})
export class MinionGrainDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public minion: MinionGrain) {}

  getCustomGrainsArray(): { key: string; value: string }[] {
    return Object.entries(this.minion.customGrains).map(([key, value]) => ({
      key,
      value
    }));
  }

  formatGrainKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatRawData(): string {
    return JSON.stringify(this.minion, null, 2);
  }
}
