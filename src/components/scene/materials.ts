import * as THREE from 'three';
import { PALETTE } from '@/config/scene';
import { antiqueMirrorTexture, glowTexture, lightShaftTexture, starTexture, woodPlanksTexture } from './textures';

function build() {
  const std = (params: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(params);
  return {
    floor: std({
      map: woodPlanksTexture({ base: '#5c3a22', planks: 7, seed: 3, repeat: [2.2, 5] }),
      roughness: 0.78,
    }),
    wall: std({
      map: woodPlanksTexture({ base: '#43271a', planks: 8, seed: 7, repeat: [3, 1.6] }),
      roughness: 0.9,
    }),
    panel: std({
      map: woodPlanksTexture({ base: '#4d2d19', planks: 5, seed: 13, repeat: [1.5, 1] }),
      roughness: 0.72,
    }),
    woodDark: std({ color: PALETTE.woodDark, roughness: 0.8 }),
    wood: std({ color: PALETTE.wood, roughness: 0.7 }),
    woodMid: std({ color: PALETTE.woodMid, roughness: 0.62 }),
    woodLight: std({ color: PALETTE.woodLight, roughness: 0.6 }),
    polished: std({ color: '#5a2f17', roughness: 0.25, metalness: 0.05 }),
    brass: std({ color: PALETTE.brass, roughness: 0.32, metalness: 0.85 }),
    iron: std({ color: PALETTE.iron, roughness: 0.55, metalness: 0.6 }),
    leather: std({ color: PALETTE.leather, roughness: 0.55 }),
    cork: std({ color: '#6e4a2a', roughness: 1 }),
    mirror: (() => {
      const map = antiqueMirrorTexture();
      return std({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0.35, roughness: 0.15, metalness: 0.3 });
    })(),
    glass: std({ color: '#cfe6e0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }),
    cream: std({ color: '#efe3c6', roughness: 0.6 }),
    flame: new THREE.MeshBasicMaterial({ color: '#ffd9a0', toneMapped: false }),
    lanternGlass: std({ color: '#ffcf8a', emissive: '#ffb45c', emissiveIntensity: 2.2, roughness: 0.3 }),
    maps: { glow: glowTexture(), star: starTexture(), shaft: lightShaftTexture() },
  };
}

let cache: ReturnType<typeof build> | null = null;

/** Shared materials, created once on the client. */
export function getMaterials() {
  return (cache ??= build());
}
