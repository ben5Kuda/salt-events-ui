import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { MinionVersionSummary, ProvisioningEventsSummary } from '../models/minion-summary.model';
import { MinionSummaryService } from '../services/minion-summary.service';

interface MinionSummaryState {
  versionSummary: MinionVersionSummary | null;
  provisioningSummary: ProvisioningEventsSummary | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MinionSummaryState = {
  versionSummary: null,
  provisioningSummary: null,
  isLoading: false,
  error: null,
};

export const MinionSummaryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ versionSummary, provisioningSummary }) => ({
    topOsVersions: computed(() => {
      if (!versionSummary()) return [];
      const versions = versionSummary()!.osVersions;
      return Object.entries(versions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    }),
    topSaltVersions: computed(() => {
      if (!versionSummary()) return [];
      const versions = versionSummary()!.saltVersions;
      return Object.entries(versions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    }),
    provisioningSuccessRate24h: computed(() => {
      const summary = provisioningSummary();
      if (!summary || summary.totalLast24Hours === 0) return 0;
      return Math.round((summary.successfulLast24Hours / summary.totalLast24Hours) * 100);
    }),
    provisioningSuccessRate7d: computed(() => {
      const summary = provisioningSummary();
      if (!summary || summary.totalLast7Days === 0) return 0;
      return Math.round((summary.successfulLast7Days / summary.totalLast7Days) * 100);
    }),
  })),
  withMethods((store) => {
    const service = inject(MinionSummaryService);

    return {
      async loadAll() {
        patchState(store, { isLoading: true, error: null });

        try {
          const [versionSummary, provisioningSummary] = await Promise.all([
            lastValueFrom(service.getMinionVersionSummary()),
            lastValueFrom(service.getProvisioningSummary()),
          ]);

          patchState(store, {
            versionSummary,
            provisioningSummary,
            isLoading: false,
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      clearError() {
        patchState(store, { error: null });
      },
    };
  })
);
