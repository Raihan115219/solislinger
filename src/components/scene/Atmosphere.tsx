import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { Vec3 } from '@/config/scene';
import { getMaterials } from './materials';

const DUST = 120;
const DUST_BOUNDS = { x: 2.4, yMin: 0.4, yMax: 4.2, zMin: -4.2, zMax: 1.8 };

function DustMotes() {
  const { maps } = getMaterials();
  const geometry = useRef<THREE.BufferGeometry>(null);
  const { positions, drift } = useMemo(() => {
    const positions = new Float32Array(DUST * 3);
    const drift = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * DUST_BOUNDS.x;
      positions[i * 3 + 1] = DUST_BOUNDS.yMin + Math.random() * (DUST_BOUNDS.yMax - DUST_BOUNDS.yMin);
      positions[i * 3 + 2] = DUST_BOUNDS.zMin + Math.random() * (DUST_BOUNDS.zMax - DUST_BOUNDS.zMin);
      drift[i] = 0.02 + Math.random() * 0.05;
    }
    return { positions, drift };
  }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < DUST; i++) {
      const iy = i * 3 + 1;
      positions[iy] += drift[i] * dt;
      positions[i * 3] += Math.sin(t * 0.4 + i) * 0.03 * dt;
      if (positions[iy] > DUST_BOUNDS.yMax) positions[iy] = DUST_BOUNDS.yMin;
    }
    const attr = geometry.current?.getAttribute('position');
    if (attr) attr.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={maps.glow}
        size={0.03}
        sizeAttenuation
        color="#ffd6a0"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

const SHAFTS: { position: Vec3; rotationZ: number; width: number; opacity: number }[] = [
  { position: [1.55, 2.4, -2.9], rotationZ: -0.62, width: 0.75, opacity: 0.09 },
  { position: [2.15, 2.6, -2.2], rotationZ: -0.6, width: 0.45, opacity: 0.07 },
  { position: [0.95, 2.3, -3.4], rotationZ: -0.64, width: 0.35, opacity: 0.05 },
];

/** Cheap fake volumetric moonlight: additive gradient planes, no real volumetrics. */
function LightShafts() {
  const { maps } = getMaterials();
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    group.current?.children.forEach((c, i) => {
      const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = SHAFTS[i].opacity * (0.85 + 0.15 * Math.sin(t * 0.5 + i * 2));
    });
  });
  return (
    <group ref={group}>
      {SHAFTS.map((s, i) => (
        <mesh key={i} position={s.position} rotation-z={s.rotationZ} renderOrder={2}>
          <planeGeometry args={[s.width, 6]} />
          <meshBasicMaterial
            map={maps.shaft}
            color="#9bb8ff"
            transparent
            opacity={s.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Atmosphere() {
  return (
    <>
      <LightShafts />
      <DustMotes />
    </>
  );
}
