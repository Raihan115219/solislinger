import type { HotspotId } from '@/config/hotspots';
import { createStore, useStore } from './createStore';

export const hotspotStore = createStore<HotspotId | null>(null);

/** Flips true after the first hotspot interaction, used to retire the hint. */
export const exploredStore = createStore(false);
hotspotStore.subscribe(() => {
  if (hotspotStore.get()) exploredStore.set(true);
});

export const useActiveHotspot = () => useStore(hotspotStore, null);
