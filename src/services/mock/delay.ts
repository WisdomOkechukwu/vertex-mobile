/** Simulated network latency so loaders/skeletons are actually visible against mock data. */
export function delay(ms?: number): Promise<void> {
  const duration = ms ?? 400 + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, duration));
}
