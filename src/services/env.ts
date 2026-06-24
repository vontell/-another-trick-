// Centralised access to the build-time configuration. Everything here is
// optional: when a value is missing, the corresponding integration (PostHog
// analytics, Supabase global stats) silently no-ops, so local dev and the
// public build work with or without keys.
const env = import.meta.env;

export const POSTHOG_KEY = (env.VITE_POSTHOG_KEY as string | undefined) ?? '';
export const POSTHOG_HOST =
  (env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com';

export const SUPABASE_URL = (env.VITE_SUPABASE_URL as string | undefined) ?? '';
export const SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const analyticsEnabled = POSTHOG_KEY.length > 0;
export const globalStatsEnabled = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
