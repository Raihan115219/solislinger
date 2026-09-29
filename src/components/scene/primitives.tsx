import * as THREE from 'three';
import type { MeshProps, SpriteProps } from '@react-three/fiber';
import type { Vec3 } from '@/config/scene';
import { getMaterials } from './materials';

type Shadowed = { cast?: boolean };

export function Box({ size, cast = true, ...props }: MeshProps & Shadowed & { size: Vec3 }) {
  return (
    <mesh castShadow={cast} receiveShadow {...props}>
      <boxGeometry args={size} />
    </mesh>
  );
}

export function Cylinder({
  dims,
  cast = true,
  ...props
}: Omit<MeshProps, 'args'> & Shadowed & { dims: [top: number, bottom: number, height: number, segments?: number] }) {
  const [top, bottom, height, segments = 12] = dims;
  return (
    <mesh castShadow={cast} receiveShadow {...props}>
      <cylinderGeometry args={[top, bottom, height, segments]} />
    </mesh>
  );
}

/** Additive soft glow sprite for flames, bulbs and lamps. */
export function Halo({
  color,
  size = 0.4,
  opacity = 0.6,
  ...props
}: SpriteProps & { color: string; size?: number; opacity?: number }) {
  const { maps } = getMaterials();
  return (
    <sprite scale={[size, size, 1]} {...props}>
      <spriteMaterial
        map={maps.glow}
        color={color}
        opacity={opacity}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}
