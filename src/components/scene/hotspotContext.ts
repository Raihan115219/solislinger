import { createContext, useContext } from 'react';

/** Smoothed 0..1 hover activation of the enclosing hotspot, read inside useFrame. */
export const HotspotActivation = createContext<{ current: number }>({ current: 0 });

export const useHotspotActivation = () => useContext(HotspotActivation);
