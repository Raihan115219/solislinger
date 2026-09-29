import { BAR, BOARD, CABINETS, type Vec3 } from './scene';

export type HotspotId = 'card-rooms' | 'slot-machines' | 'faction-map' | 'lounge';

export interface HitBox {
  position: Vec3;
  size: Vec3;
}

export interface HotspotConfig {
  id: HotspotId;
  label: string;
  teaser: string;
  color: string;
  /** Where the floating label is pinned in world space. */
  labelPosition: Vec3;
  /** Which edge of the label sits on `labelPosition`, so labels near the frame edge stay on screen. */
  labelAnchor: 'center' | 'left' | 'right';
  /** What the host turns to look at while this hotspot is active. */
  lookTarget: Vec3;
  lightPosition: Vec3;
  hitBoxes: HitBox[];
}

const cabinetCenterX = (CABINETS.xs[0] + CABINETS.xs[1]) / 2;

export const HOTSPOTS: HotspotConfig[] = [
  {
    id: 'card-rooms',
    label: 'Card Rooms',
    teaser: "Blackjack · Hold'em",
    color: '#4fd889',
    labelPosition: [-0.62, 1.12, 0.35],
    labelAnchor: 'center',
    lookTarget: [-0.72, 0.8, 0.25],
    lightPosition: [0.1, 1.7, 0.75],
    hitBoxes: [{ position: [0.2, 0.55, 0.7], size: [2.6, 1.1, 2.1] }],
  },
  {
    id: 'slot-machines',
    label: 'Slot Machines',
    teaser: 'Solslinger · Ghosts of the Dead Ringers',
    color: '#ffb347',
    labelPosition: [cabinetCenterX + 0.3, 2.2, CABINETS.z],
    labelAnchor: 'right',
    lookTarget: [cabinetCenterX, 1.45, CABINETS.z],
    lightPosition: [cabinetCenterX - 0.2, 1.9, CABINETS.z + 1.1],
    hitBoxes: [{ position: [cabinetCenterX, 1.0, CABINETS.z], size: [1.45, 2.0, 0.7] }],
  },
  {
    id: 'faction-map',
    label: 'Faction War Map',
    teaser: 'Regional conquest · 5 territories',
    color: '#ff7a52',
    labelPosition: [BOARD.position[0] - 0.28, BOARD.position[1] + 0.62, BOARD.position[2]],
    labelAnchor: 'left',
    lookTarget: BOARD.position,
    lightPosition: [BOARD.position[0] + 0.3, BOARD.position[1] + 0.2, BOARD.position[2] + 1.0],
    hitBoxes: [
      { position: BOARD.position, size: [BOARD.width + 0.12, BOARD.height + 0.12, 0.25] },
    ],
  },
  {
    id: 'lounge',
    label: 'Shoot Your Shot Lounge',
    teaser: 'Social lounge · Direct messages',
    color: '#f0c060',
    labelPosition: [0, 2.55, -2.3],
    labelAnchor: 'center',
    lookTarget: [0.75, BAR.height, BAR.z + 0.1],
    lightPosition: [0, 2.6, -3.4],
    hitBoxes: [
      { position: [0, BAR.height / 2, BAR.z], size: [BAR.halfWidth * 2 + 0.2, BAR.height + 0.05, BAR.depth + 0.1] },
      { position: [0, 2.2, -4.4], size: [2.5, 2.4, 0.4] },
    ],
  },
];

export const HOTSPOT_BY_ID = Object.fromEntries(HOTSPOTS.map((h) => [h.id, h])) as Record<
  HotspotId,
  HotspotConfig
>;
