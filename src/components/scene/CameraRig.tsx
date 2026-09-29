import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CAMERA } from '@/config/scene';

export const INTRO_START: [number, number, number] = [
  CAMERA.position[0] + CAMERA.introOffset[0],
  CAMERA.position[1] + CAMERA.introOffset[1],
  CAMERA.position[2] + CAMERA.introOffset[2],
];

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/** Dolly-in on entry, then a gentle breathing sway plus pointer parallax. No free orbit. */
export function CameraRig() {
  const start = useRef<number | null>(null);
  const parallax = useRef(new THREE.Vector2());
  const { from, rest, target, look } = useMemo(
    () => ({
      from: new THREE.Vector3(...INTRO_START),
      rest: new THREE.Vector3(...CAMERA.position),
      target: new THREE.Vector3(...CAMERA.target),
      look: new THREE.Vector3(),
    }),
    [],
  );

  useFrame(({ camera, clock, pointer }, dt) => {
    const t = clock.elapsedTime;
    if (start.current === null) start.current = t;
    const p = easeOutCubic(Math.min(1, (t - start.current) / CAMERA.introSeconds));

    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, pointer.x, 2.5, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, pointer.y, 2.5, dt);

    camera.position.lerpVectors(from, rest, p);
    camera.position.x += parallax.current.x * 0.2 + Math.sin(t * 0.21) * 0.03;
    camera.position.y += parallax.current.y * 0.08 + Math.sin(t * 0.17) * 0.02;

    look.copy(target);
    look.x += parallax.current.x * 0.06;
    camera.lookAt(look);
  });

  return null;
}
