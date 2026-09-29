import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { HOTSPOT_BY_ID } from '@/config/hotspots';
import { hotspotStore } from '@/lib/hotspotStore';

const PEAK_INTENSITY = 7;

/** One shared coloured light that travels to whichever hotspot is active, instead of one light per hotspot. */
export function HotspotLight() {
  const light = useRef<THREE.PointLight>(null);
  const level = useRef(0);
  const goalColor = useMemo(() => new THREE.Color(), []);
  const goalPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const l = light.current;
    if (!l) return;
    const id = hotspotStore.get();
    level.current = THREE.MathUtils.damp(level.current, id ? 1 : 0, 6, dt);
    if (id) {
      const cfg = HOTSPOT_BY_ID[id];
      goalPos.set(...cfg.lightPosition);
      goalColor.set(cfg.color);
      const k = level.current < 0.05 ? 1 : 1 - Math.exp(-10 * dt);
      l.position.lerp(goalPos, k);
      l.color.lerp(goalColor, k);
    }
    l.intensity = level.current * PEAK_INTENSITY;
  });

  return <pointLight ref={light} intensity={0} distance={3.6} decay={1.4} />;
}
