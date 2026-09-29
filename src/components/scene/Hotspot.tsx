import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { HotspotConfig, HotspotId } from '@/config/hotspots';
import { hotspotStore, useActiveHotspot } from '@/lib/hotspotStore';
import { HotspotActivation } from './hotspotContext';
import { FloatingLabel } from './FloatingLabel';

// Mouse/pen use hover. Touch has no hover, so a tap reveals the hotspot and a tap on empty
// scene clears it. Taps are read from pointerdown/pointerup rather than `click`, because
// iOS Safari's click event does not reliably report pointerType.
const isHoverPointer = (e: ThreeEvent<PointerEvent>) => e.nativeEvent.pointerType !== 'touch';

let touchDownOn: HotspotId | null = null;
let tapHitHotspot = false;

/** Clears the active hotspot when a touch lands on the canvas but misses every hotspot. */
export function TouchTapClear() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      tapHitHotspot = false;
      touchDownOn = null;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || tapHitHotspot) return;
      if (e.target instanceof HTMLCanvasElement) hotspotStore.set(null);
    };
    // Capture runs before R3F's handlers on pointerdown; bubble on window runs after them on pointerup.
    window.addEventListener('pointerdown', onDown, { capture: true, passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown, { capture: true });
      window.removeEventListener('pointerup', onUp);
    };
  }, []);
  return null;
}

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
            if (isHoverPointer(e)) hotspotStore.set(config.id);
          }}
          onPointerOut={(e) => {
            if (isHoverPointer(e) && hotspotStore.get() === config.id) hotspotStore.set(null);
          }}
          onPointerDown={(e) => {
            if (isHoverPointer(e)) return;
            e.stopPropagation();
            touchDownOn = config.id;
            tapHitHotspot = true;
          }}
          onPointerUp={(e) => {
            if (isHoverPointer(e)) return;
            e.stopPropagation();
            tapHitHotspot = true;
            if (touchDownOn === config.id) hotspotStore.set(config.id);
          }}
        >
          <boxGeometry args={box.size} />
        </mesh>
      ))}
      <FloatingLabel config={config} visible={active} />
    </HotspotActivation.Provider>
  );
}
