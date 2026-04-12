import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { SaltEvent } from '../models/salt-event.model';
import { EventSummary } from '../models/event-summary.model';
import { SaltEventsService } from '../services/salt-events.service';

interface EventsState {
  events: SaltEvent[];
  summary: EventSummary | null;
  selectedEvent: SaltEvent | null;
  isLoading: boolean;
  error: string | null;
  limit: number;
  lastRefresh: number;
}

const initialState: EventsState = {
  events: [],
  summary: null,
  selectedEvent: null,
  isLoading: false,
  error: null,
  limit: 50,
  lastRefresh: 0,
};

export const EventsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ events, summary }) => ({
    totalEvents: computed(() => summary()?.totalEventsLast24Hours ?? events().length),
    uniqueJobs: computed(() => summary()?.uniqueJobs ?? 0),
    uniqueMinions: computed(() => summary()?.uniqueMinions ?? 0),
    successRate: computed(() => summary()?.successRate ?? 0),

    eventsByType: computed(() => {
      const s = summary();
      if (s?.eventsByType) {
        return s.eventsByType.map(et => ({
          type: et.eventType,
          count: et.count
        }));
      }

      const eventTypes = new Map<string, number>();
      events().forEach(event => {
        const count = eventTypes.get(event.event_type) || 0;
        eventTypes.set(event.event_type, count + 1);
      });
      return Array.from(eventTypes.entries()).map(([type, count]) => ({
        type,
        count
      }));
    }),

    recentEvents: computed(() => events().slice(0, 5)),
    hasData: computed(() => events().length > 0),

    statsSummary: computed(() => {
      const s = summary();
      if (!s) return null;
      return {
        total: s.totalEventsLast24Hours,
        totalAll: s.totalEvents,
        minions: s.uniqueMinions,
        jobs: s.uniqueJobs,
        successRate: s.successRate,
        topEventType: s.eventsByType[0]?.eventType || 'N/A',
        topFunction: s.eventsByFunction[0]?.function || 'N/A'
      };
    })
  })),
  withMethods((store) => {
    const saltEventsService = inject(SaltEventsService);

    return {
      async loadEvents(limit: number) {
        patchState(store, { isLoading: true, error: null });

        try {
          const response = await lastValueFrom(saltEventsService.getEvents(limit));

          patchState(store, {
            events: response.data,
            isLoading: false,
            lastRefresh: Date.now(),
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      async loadSummary() {
        patchState(store, { isLoading: true, error: null });

        try {
          const summary = await lastValueFrom(saltEventsService.getEventsSummary());
          patchState(store, {
            summary,
            isLoading: false,
            lastRefresh: Date.now(),
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      setLimit(limit: number) {
        patchState(store, { limit });
      },

      selectEvent(event: SaltEvent | null) {
        patchState(store, { selectedEvent: event });
      },

      clearError() {
        patchState(store, { error: null });
      },

      async refreshAll() {
        const { limit } = store;
        await Promise.all([
          this.loadSummary(),
          this.loadEvents(limit())
        ]);
      }
    };
  })
);
