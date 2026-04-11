import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer mode="side" opened class="sidenav">
        <mat-toolbar color="primary">
          <span>Salt Events Monitor</span>
        </mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/events" routerLinkActive="active">
            <mat-icon matListItemIcon>event</mat-icon>
            <span matListItemTitle>Events</span>
          </a>
          <a mat-list-item routerLink="/highstate" routerLinkActive="active">
            <mat-icon matListItemIcon>assignment_turned_in</mat-icon>
            <span matListItemTitle>Highstate</span>
          </a>
          <a mat-list-item routerLink="/minion-keys" routerLinkActive="active">
            <mat-icon matListItemIcon>vpn_key</mat-icon>
            <span matListItemTitle>Minion Keys</span>
          </a>

          <a mat-list-item routerLink="/minion-grains" routerLinkActive="active">
            <mat-icon matListItemIcon>computer</mat-icon>
            <span matListItemTitle>Minion Grains</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
    }

    .sidenav mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 2;
    }

    mat-nav-list a {
      &.active {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
  `]
})
export class AppComponent {
  title = 'Salt Events Monitor';
}
