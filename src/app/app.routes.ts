import { Routes } from '@angular/router';
import {MinionGrainsComponent} from "./features/minion-grains/minion-grains.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events-list/events-list.component')
      .then(m => m.EventsListComponent)
  },
  {
    path: 'minion-keys',
    loadComponent: () => import('./features/minion-keys/minion-keys.component')
      .then(m => m.MinionKeysComponent)
  },
  {
    path: 'highstate',
    loadComponent: () => import('./features/highstates/highstate.component')
      .then(m => m.HighstateComponent)
  },
  {
    path: 'minion-grains',
    loadComponent: () => import('./features/minion-grains/minion-grains.component')
      .then(m => m.MinionGrainsComponent)
  },
  { path: 'minion-grains', component: MinionGrainsComponent },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
