import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { MinionConnectivitySummary, MinionPresenceStatus } from '../models/minion-connectivity.model';
import { MinionConnectivityService } from '../services/minion-connectivity.service';

interface MinionConnectivityState {
  summary: MinionConnectivitySummary | null;
  presenceStatus: MinionPresenceStatus[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MinionConnectivityState = {
  summary: null,
  presenceStatus: [],
  isLoading: false,
  error: null,
};

export const MinionConnectivityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ summary, presenceStatus }) => ({
    hasData: computed(() => summary() !== null),

    onlineMinions: computed(() =>
      presenceStatus().filter(m => m.isOnline)
    ),

    offlineMinions: computed(() =>
      presenceStatus().filter(m => !m.isOnline)
    ),

    recentlyOnline: computed(() =>
      presenceStatus()
        .filter(m => m.isOnline)
        .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
        .slice(0, 5)
    ),

    recentlyOffline: computed(() =>
      presenceStatus()
        .filter(m => !m.isOnline && m.status !== 'unknown')
        .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
        .slice(0, 5)
    ),
  })),
  withMethods((store) => {
    const service = inject(MinionConnectivityService);

    return {
      async loadSummary() {
        patchState(store, { isLoading: true, error: null });

        try {
          const summary = await lastValueFrom(service.getConnectivitySummary());
          patchState(store, {
            summary,
            isLoading: false,
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      async loadPresenceStatus() {
        patchState(store, { isLoading: true, error: null });

        try {
          const presenceStatus = await lastValueFrom(service.getPresenceStatus());
          patchState(store, {
            presenceStatus,
            isLoading: false,
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      async refreshAll() {
        await Promise.all([
          this.loadSummary(),
          this.loadPresenceStatus(),
        ]);
      },

      clearError() {
        patchState(store, { error: null });
      },
    };
  })
);
