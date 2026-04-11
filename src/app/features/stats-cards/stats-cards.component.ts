import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SaltEventsStore } from '../../core/store/salt-events.store';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: `./stats-cards.component.html`,
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent {
  @Input() detailed = false;
  readonly store = inject(SaltEventsStore);
}
