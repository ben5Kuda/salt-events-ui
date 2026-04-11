import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { HighstateService } from '../services/highstate.service';
import { HighstateExecution, HighstateStats, HighstateSummary } from "../models/highstates.model";

interface HighstateState {
  executions: HighstateExecution[];
  executionsCount: number;
  summary: HighstateSummary | null;
  statsByMinion: HighstateStats[];
  selectedExecution: HighstateExecution | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: HighstateState = {
  executions: [],
  executionsCount: 0,
  summary: null,
  statsByMinion: [],
  selectedExecution: null,
  isLoading: false,
  error: null,
};

export const HighstateStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ executions, executionsCount, summary, statsByMinion }) => ({
    totalExecutions: computed(() => {
      const s = summary();
      return s?.totalExecutions ?? executionsCount();
    }),

    recentExecutions: computed(() => {
      const execs = executions();
      return execs?.slice(0, 10) ?? [];
    }),

    hasData: computed(() => {
      const execs = executions();
      return (execs?.length ?? 0) > 0;
    }),

    successRate: computed(() => {
      const s = summary();
      if (!s || !s.totalExecutions || s.totalExecutions === 0) {
        return 0;
      }
      return (s.successfulExecutions / s.totalExecutions) * 100;
    }),

    changeRate: computed(() => {
      const s = summary();
      if (!s || !s.totalStatesRun || s.totalStatesRun === 0) {
        return 0;
      }
      return (s.totalStatesChanged / s.totalStatesRun) * 100;
    }),

    totalStatesRun: computed(() => {
      const s = summary();
      return s?.totalStatesRun ?? 0;
    }),

    totalStatesChanged: computed(() => {
      const s = summary();
      return s?.totalStatesChanged ?? 0;
    }),

    totalPropertyChanges: computed(() => {
      const execs = executions();
      if (!execs || execs.length === 0) return 0;
      return execs.reduce((sum, e) => sum + (e.totalPropertyChanges ?? 0), 0);
    }),

    averageDuration: computed(() => {
      const s = summary();
      return s?.averageDuration ?? 0;
    }),

    uniqueMinions: computed(() => {
      const s = summary();
      return s?.uniqueMinions ?? 0;
    })
  })),
  withMethods((store) => {
    const service = inject(HighstateService);

    return {
      async loadExecutions(limit: number = 50) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await lastValueFrom(service.getHighstateExecutions(limit));
          patchState(store, {
            executions: response.data ?? [],
            executionsCount: response.count ?? 0,
            isLoading: false
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
            executions: [],
            executionsCount: 0
          });
        }
      },

      async loadSummary() {
        try {
          const summary = await lastValueFrom(service.getHighstateSummary());
          patchState(store, { summary });
        } catch (error) {
          patchState(store, { summary: null });
        }
      },

      async loadStatsByMinion() {
        try {
          const statsByMinion = await lastValueFrom(service.getHighstateStatsByMinion());
          patchState(store, { statsByMinion: statsByMinion ?? [] });
        } catch (error) {
          patchState(store, { statsByMinion: [] });
        }
      },

      selectExecution(execution: HighstateExecution | null) {
        patchState(store, { selectedExecution: execution });
      },

      async refreshAll() {
        patchState(store, { isLoading: true });
        try {
          await this.loadSummary();
          await this.loadExecutions();
          await this.loadStatsByMinion();
        } finally {
          patchState(store, { isLoading: false });
        }
      }
    };
  })
);
