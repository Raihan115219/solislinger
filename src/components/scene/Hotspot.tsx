import { useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { HotspotConfig } from '@/config/hotspots';
import { hotspotStore, useActiveHotspot } from '@/lib/hotspotStore';
import { HotspotActivation } from './hotspotContext';
import { FloatingLabel } from './FloatingLabel';

// Mouse/pen use hover. Touch has no hover, so a tap reveals the hotspot instead;
// tapping empty space clears it (handled by the Canvas onPointerMissed).
const isTouch = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
  'pointerType' in e.nativeEvent && e.nativeEvent.pointerType === 'touch';

export function Hotspot({ config, children }: { config: HotspotConfig; children: ReactNode }) {
  const activation = useRef(0);
  const active = useActiveHotspot() === config.id;

  useFrame((_, dt) => {
    const goal = hotspotStore.get() === config.id ? 1 : 0;
    activation.current = THREE.MathUtils.damp(activation.current, goal, 7, dt);
  });

  return (
    <HotspotActivation.Provider value={activation}>
      {children}
      {config.hitBoxes.map((box, i) => (
        <mesh
          key={i}
          position={box.position}
          visible={false}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!isTouch(e)) hotspotStore.set(config.id);
          }}
          onPointerOut={(e) => {
            if (!isTouch(e) && hotspotStore.get() === config.id) hotspotStore.set(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isTouch(e)) hotspotStore.set(config.id);
          }}
        >
          <boxGeometry args={box.size} />
        </mesh>
      ))}
      <FloatingLabel config={config} visible={active} />
    </HotspotActivation.Provider>
  );
}
