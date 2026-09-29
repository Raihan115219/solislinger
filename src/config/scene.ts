export type Vec3 = [number, number, number];

// World units are metres. The camera looks down -Z into the saloon.
export const ROOM = { halfWidth: 2.9, backZ: -4.6, frontZ: 6, height: 4.8 };

export const CAMERA = {
  position: [0, 2.55, 4.4] as Vec3,
  target: [0, 1.45, -2.6] as Vec3,
  fov: 55,
  introOffset: [0, 0.8, 3.4] as Vec3,
  introSeconds: 3,
};

export const BAR = { z: -1.55, halfWidth: 1.25, height: 1.05, depth: 0.62 };
export const BACK_BAR = { z: -4.36, halfWidth: 1.2 };
export const HOST = { position: [0, 0, -2.08] as Vec3, height: 1.86 };
export const SIGN = { position: [0, 3.82, -4.5] as Vec3 };
export const BOARD = { position: [-2.12, 2.15, -4.54] as Vec3, width: 1.05, height: 0.85 };
export const CABINETS = { xs: [1.6, 2.22], z: -4.12, width: 0.6, height: 1.95 };
export const TABLES: { position: Vec3; radius: number; rotation: number }[] = [
  { position: [-0.72, 0, 0.25], radius: 0.56, rotation: 0.4 },
  { position: [1.08, 0, 1.1], radius: 0.56, rotation: 1.3 },
];
export const STOOLS_X = [-0.82, 0, 0.82];
export const CHANDELIER: Vec3 = [0, 4.15, -2.0];

export const PALETTE = {
  woodDark: '#2e1a0f',
  wood: '#4a2b18',
  woodMid: '#6b3d20',
  woodLight: '#8a5530',
  brass: '#b08a3e',
  felt: '#1d5634',
  parchment: '#e6d3a8',
  blood: '#8e1b1b',
  leather: '#5e1913',
  iron: '#2a2624',
  flame: '#ffc56b',
};
