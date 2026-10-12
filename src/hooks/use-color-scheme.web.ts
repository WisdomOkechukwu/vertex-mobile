import { useSyncExternalStore } from 'react';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Web needs the colour scheme resolved on the client, because static rendering has no way to know
 * it — so the server snapshot is always `'light'` and the real value arrives on hydration.
 *
 * `useSyncExternalStore` is the right primitive for that: it reads from an external source
 * (`Appearance`) with an explicit server snapshot, which avoids both the hydration mismatch and the
 * cascading re-render a `setState`-in-effect flag would cause.
 */
function subscribe(onChange: () => void) {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}

export function useColorScheme() {
  const scheme = useRNColorScheme();
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  return hasHydrated ? scheme : 'light';
}
