import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { MinionKeysService } from '../services/minion-keys.service';
import {MinionKey, MinionKeySummary} from "../models/minion-key";

interface MinionKeysState {
  pending: MinionKey[];
  accepted: MinionKey[];
  rejected: MinionKey[];
  denied: MinionKey[];
  summary: MinionKeySummary | null;
  selectedKeys: Set<string>;
  isLoading: boolean;
  error: string | null;
}

const initialState: MinionKeysState = {
  pending: [],
  accepted: [],
  rejected: [],
  denied: [],
  summary: null,
  selectedKeys: new Set(),
  isLoading: false,
  error: null,
};

export const MinionKeysStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ pending, accepted, rejected, denied, selectedKeys, summary }) => ({

    keys: computed(() => {
      const allKeys: (MinionKey & { status: string })[] = [];

      for (const key of pending()) {
        allKeys.push({...key, status: 'pending'});
      }
      for (const key of accepted()) {
        allKeys.push({...key, status: 'accepted'});
      }
      for (const key of rejected()) {
        allKeys.push({...key, status: 'rejected'});
      }
      for (const key of denied()) {
        allKeys.push({...key, status: 'denied'});
      }

      return allKeys;
    }),

    totalKeys: computed(() =>
      pending().length + accepted().length + rejected().length + denied().length
    ),
    hasSelectedKeys: computed(() => selectedKeys().size > 0),
    selectedCount: computed(() => selectedKeys().size),

    acceptedCount: computed(() => summary()?.accepted ?? accepted().length),
    pendingCount: computed(() => summary()?.pending ?? pending().length),
    rejectedCount: computed(() => summary()?.rejected ?? rejected().length),
    deniedCount: computed(() => summary()?.denied ?? denied().length),
  })),
  withMethods((store) => {
    const service = inject(MinionKeysService);

    return {
      async loadKeys() {
        patchState(store, { isLoading: true, error: null });

        try {
          const data = await lastValueFrom(service.getMinionKeys());
          patchState(store, {
            pending: data.pending || [],
            accepted: data.accepted || [],
            rejected: data.rejected || [],
            denied: data.denied || [],
            isLoading: false,
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      async loadSummary() {
        try {
          const summary = await lastValueFrom(service.getSummary());
          patchState(store, { summary });
        } catch (error) {
          console.error('Failed to load summary:', error);
        }
      },

      toggleKeySelection(minionId: string) {
        const selected = new Set(store.selectedKeys());
        if (selected.has(minionId)) {
          selected.delete(minionId);
        } else {
          selected.add(minionId);
        }
        patchState(store, { selectedKeys: selected });
      },

      selectAll(keys: MinionKey[]) {
        const selected = new Set(keys.map(k => k.minionId));
        patchState(store, { selectedKeys: selected });
      },

      clearSelection() {
        patchState(store, { selectedKeys: new Set() });
      },

      async refresh() {
        await Promise.all([
          this.loadKeys(),
          this.loadSummary()
        ]);
      }
    };
  })
);
