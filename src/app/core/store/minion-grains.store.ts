import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { MinionGrain } from '../models/minion-grain.model';
import { MinionGrainsService } from '../services/minion-grains.service';

interface MinionGrainsState {
  minions: MinionGrain[];
  selectedMinion: MinionGrain | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MinionGrainsState = {
  minions: [],
  selectedMinion: null,
  isLoading: false,
  error: null,
};

export const MinionGrainsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ minions }) => ({
    totalMinions: computed(() => minions().length),

    provisionedMinions: computed(() =>
      minions().filter(m => m.customGrains['iotpe_provisioning_status'] === 'provisioned').length
    ),

    upgradeInProgress: computed(() =>
      minions().filter(m => m.customGrains['iotpe_upgrade_status'] === 'in-progress').length
    ),

    uniqueOsVersions: computed(() => {
      const versions = new Set(minions().map(m => `${m.os} ${m.osVersion}`));
      return Array.from(versions);
    }),

    hasData: computed(() => minions().length > 0),
  })),
  withMethods((store) => {
    const service = inject(MinionGrainsService);

    return {
      async loadMinions() {
        patchState(store, { isLoading: true, error: null });

        try {
          const minions = await lastValueFrom(service.getAllMinions());
          patchState(store, {
            minions,
            isLoading: false,
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      selectMinion(minion: MinionGrain | null) {
        patchState(store, { selectedMinion: minion });
      },

      clearError() {
        patchState(store, { error: null });
      },
    };
  })
);
