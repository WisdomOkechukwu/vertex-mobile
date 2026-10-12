import { useEffect } from 'react';

import { useLinksStore } from '@/stores/links-store';
import { isLoading } from '@/lib/api-status';

/**
 * Ensures the links store is populated on screens that can be reached directly — `/links/<id>` and
 * the edit form both read a single link out of the store, and only `/links` fetched the list, so a
 * deep link (or a reload on web) used to render an empty screen. Fires once, from `idle`, and
 * reports whether the list is still in flight so callers can show a skeleton rather than a
 * premature "not found".
 */
export function useLinksHydrated(): boolean {
  const status = useLinksStore((s) => s.status);
  const fetchLinks = useLinksStore((s) => s.fetchLinks);

  useEffect(() => {
    if (status === 'idle') fetchLinks();
  }, [status, fetchLinks]);

  return isLoading(status);
}
