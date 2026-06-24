// Thin PostHog wrapper for product metrics. Loads PostHog lazily and only when
// a project key is configured; otherwise every call is a no-op so the game runs
// identically without analytics (local dev, forks, or before keys are set).
import { POSTHOG_KEY, POSTHOG_HOST, analyticsEnabled } from './env';

export type AnalyticsEvent =
  | 'app_loaded'
  | 'puzzle_opened'
  | 'room_solved'
  | 'room_missed'
  | 'powerup_used'
  | 'maze_completed'
  | 'meta_solved'
  | 'meta_missed'
  | 'help_opened'
  | 'puzzles_browsed'
  | 'settings_changed';

type Props = Record<string, string | number | boolean | undefined>;

// Resolves to the posthog instance once loaded, or null if disabled / failed.
let phPromise: Promise<typeof import('posthog-js').default | null> | null = null;

function getPosthog() {
  if (!analyticsEnabled) return Promise.resolve(null);
  if (!phPromise) {
    phPromise = import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          // Aggregate-only product metrics: no cross-site identity, respect DNT.
          person_profiles: 'never',
          autocapture: false,
          capture_pageview: true,
          respect_dnt: true,
        });
        return posthog;
      })
      .catch(() => null);
  }
  return phPromise;
}

/** Initialise analytics up front (safe to call once at startup). */
export function initAnalytics() {
  void getPosthog();
}

/** Fire a product-analytics event. Never throws; no-ops when disabled. */
export function track(event: AnalyticsEvent, props?: Props) {
  void getPosthog().then((ph) => ph?.capture(event, props));
}
