import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MinionKey} from "../../core/models/minion-key";

@Component({
  selector: 'app-public-key-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './public-key-dialog.component.html',
  styleUrls: ['./public-key-dialog.component.scss']
})
export class PublicKeyDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MinionKey) {}

  copyToClipboard() {
    navigator.clipboard.writeText(this.data.publicKey).then(() => {
      alert('Public key copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}
