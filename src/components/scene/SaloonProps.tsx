import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BACK_BAR, BAR, BOARD, CABINETS, PALETTE, ROOM, TABLES } from '@/config/scene';
import { getMaterials } from './materials';
import { Box, Cylinder, Halo } from './primitives';
import { noteTexture, slotReelsTexture, wantedPosterTexture, warMapTexture } from './textures';
import { useHotspotActivation } from './hotspotContext';

const FONT_URL = '/fonts/Rye-Regular.ttf';

/* ───────────────────────── Bar counter + back bar ───────────────────────── */

const BOTTLE_COLORS = ['#5a2a0a', '#7a3b0c', '#2f4a1f', '#1f3a2c', '#8a6a2a', '#4a1212', '#b9a77a'];
const SHELF_YS = [1.45, 2.05, 2.65];
const SHELF_Z = -4.45;

function useBottleGeometry() {
  return useMemo(() => {
    const pts = [
      [0, 0], [0.045, 0], [0.048, 0.02], [0.048, 0.15], [0.03, 0.19],
      [0.016, 0.21], [0.016, 0.26], [0.019, 0.265], [0, 0.265],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 8);
  }, []);
}

export function BarArea() {
  const m = getMaterials();
  const activation = useHotspotActivation();
  const bottleGeometry = useBottleGeometry();
  const bottleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.15,
        metalness: 0.25,
        emissive: '#ffbf66',
        emissiveIntensity: 0,
      }),
    [],
  );

  const bottles = useMemo(() => {
    const list: { p: Vec; s: number; c: string }[] = [];
    let k = 0;
    for (const side of [-1, 1]) {
      for (const y of SHELF_YS) {
        for (let i = 0; i < 5; i++) {
          const s = 0.85 + ((k * 37) % 7) * 0.06;
          list.push({ p: [side * 0.8 - 0.3 + i * 0.15, y + 0.02, SHELF_Z], s, c: BOTTLE_COLORS[k % BOTTLE_COLORS.length] });
          k++;
        }
      }
    }
    for (let i = 0; i < 9; i++) {
      const x = -1.05 + i * 0.26;
      list.push({ p: [x, 1.05, BACK_BAR.z + 0.02], s: 0.9 + (i % 3) * 0.1, c: BOTTLE_COLORS[(i * 3) % BOTTLE_COLORS.length] });
    }
    return list;
  }, []);

  const bottleMesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = bottleMesh.current!;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    bottles.forEach((b, i) => {
      o.position.set(...b.p);
      o.scale.set(1, b.s, 1);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, c.set(b.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bottles]);

  const glintSpots = useMemo<Vec[]>(
    () => [
      [-0.95, 1.68, SHELF_Z + 0.06],
      [0.66, 2.28, SHELF_Z + 0.06],
      [-0.5, 2.88, SHELF_Z + 0.06],
      [1.0, 1.68, SHELF_Z + 0.06],
      [-0.78, 1.26, BACK_BAR.z + 0.08],
      [0.52, 1.26, BACK_BAR.z + 0.08],
    ],
    [],
  );
  const glints = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const a = activation.current;
    const t = clock.elapsedTime;
    bottleMaterial.emissiveIntensity = a * 0.1;
    glints.current?.children.forEach((child, i) => {
      const s = a * Math.max(0, Math.sin(t * 2.6 + i * 1.9)) ** 3;
      child.scale.setScalar(0.02 + s * 0.42);
      child.visible = s > 0.01;
    });
  });

  const front = BAR.z + BAR.depth / 2;

  return (
    <group>
      {/* back bar */}
      <Box size={[2.4, 1.0, 0.45]} position={[0, 0.5, BACK_BAR.z]} material={m.panel} />
      <Box size={[2.5, 0.05, 0.5]} position={[0, 1.025, BACK_BAR.z]} material={m.polished} />
      <Box size={[2.5, 2.3, 0.04]} position={[0, 2.15, ROOM.backZ + 0.03]} material={m.woodDark} cast={false} />
      <Box size={[0.95, 1.3, 0.02]} position={[0, 2.15, ROOM.backZ + 0.06]} material={m.mirror} cast={false} />
      <Box size={[1.05, 0.05, 0.04]} position={[0, 2.82, ROOM.backZ + 0.07]} material={m.brass} cast={false} />
      <Box size={[1.05, 0.05, 0.04]} position={[0, 1.48, ROOM.backZ + 0.07]} material={m.brass} cast={false} />
      {[-1.24, -0.52, 0.52, 1.24].map((x) => (
        <Box key={x} size={[0.08, 2.3, 0.3]} position={[x, 2.15, SHELF_Z]} material={m.woodMid} />
      ))}
      {[-1, 1].flatMap((side) =>
        SHELF_YS.map((y) => (
          <Box key={`${side}${y}`} size={[0.72, 0.04, 0.28]} position={[side * 0.88, y, SHELF_Z]} material={m.woodMid} />
        )),
      )}
      <Box size={[2.7, 0.14, 0.4]} position={[0, 3.33, -4.42]} material={m.woodDark} />
      <Box size={[2.72, 0.03, 0.42]} position={[0, 3.25, -4.42]} material={m.brass} cast={false} />
      <instancedMesh ref={bottleMesh} args={[bottleGeometry, bottleMaterial, bottles.length]} castShadow />

      {/* counter */}
      <Box size={[BAR.halfWidth * 2, 0.98, BAR.depth - 0.02]} position={[0, 0.49, BAR.z]} material={m.panel} />
      <Box size={[BAR.halfWidth * 2 + 0.22, 0.07, BAR.depth + 0.18]} position={[0, 1.015, BAR.z + 0.05]} material={m.polished} />
      <Box size={[BAR.halfWidth * 2 + 0.06, 0.12, BAR.depth + 0.04]} position={[0, 0.06, BAR.z]} material={m.woodDark} />
      {[-1, -0.5, 0, 0.5, 1].map((x) => (
        <Box key={x} size={[0.4, 0.5, 0.025]} position={[x, 0.56, front]} material={m.woodMid} />
      ))}
      <mesh position={[0, 0.2, front + 0.14]} rotation-z={Math.PI / 2} material={m.brass} castShadow>
        <cylinderGeometry args={[0.022, 0.022, BAR.halfWidth * 2, 8]} />
      </mesh>
      {[-1.1, 0, 1.1].map((x) => (
        <Box key={x} size={[0.03, 0.03, 0.14]} position={[x, 0.2, front + 0.07]} material={m.brass} cast={false} />
      ))}

      {/* counter-top dressing */}
      <Cylinder dims={[0.035, 0.03, 0.08, 10]} position={[0.75, 1.09, BAR.z + 0.1]} material={m.glass} cast={false} />
      <Cylinder dims={[0.026, 0.024, 0.035, 10]} position={[0.75, 1.07, BAR.z + 0.1]} material={bottleMaterial} cast={false} />
      <mesh
        geometry={bottleGeometry}
        position={[0.95, 1.05, BAR.z]}
        scale={[1.1, 1.15, 1.1]}
        material={bottleMaterial}
        castShadow
      />
      <group position={[-0.95, 1.05, BAR.z - 0.05]}>
        <Cylinder dims={[0.07, 0.08, 0.04, 10]} position={[0, 0.02, 0]} material={m.brass} />
        <Cylinder dims={[0.045, 0.06, 0.16, 10]} position={[0, 0.12, 0]} material={m.lanternGlass} cast={false} />
        <Cylinder dims={[0.02, 0.05, 0.05, 10]} position={[0, 0.225, 0]} material={m.brass} cast={false} />
        <Halo color={PALETTE.flame} size={0.55} opacity={0.4} position={[0, 0.13, 0.05]} />
      </group>

      <group ref={glints}>
        {glintSpots.map((p, i) => (
          <sprite key={i} position={p}>
            <spriteMaterial
              map={m.maps.star}
              color="#fff1cc"
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
        ))}
      </group>
    </group>
  );
}

type Vec = [number, number, number];

/* ───────────────────────── Card tables ───────────────────────── */

function Chair({ position, rotationY }: { position: Vec; rotationY: number }) {
  const m = getMaterials();
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[0.42, 0.045, 0.42]} position={[0, 0.46, 0]} material={m.woodMid} />
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z]) => (
        <Cylinder key={`${x}${z}`} dims={[0.02, 0.018, 0.46, 5]} position={[x, 0.23, z]} material={m.wood} />
      ))}
      {[-0.18, 0.18].map((x) => (
        <Cylinder key={x} dims={[0.02, 0.02, 0.55, 5]} position={[x, 0.73, -0.19]} material={m.wood} />
      ))}
      <Box size={[0.44, 0.08, 0.03]} position={[0, 0.96, -0.19]} material={m.woodMid} />
      <Box size={[0.4, 0.035, 0.025]} position={[0, 0.74, -0.19]} material={m.wood} />
    </group>
  );
}

const CHIP_COLORS = ['#a3201c', '#ece0c2', '#171311', '#1d4f8a'];

function CardTable({
  position,
  radius,
  rotation,
  felt,
  seed,
}: {
  position: Vec;
  radius: number;
  rotation: number;
  felt: THREE.Material;
  seed: number;
}) {
  const m = getMaterials();
  const cardBack = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7d1a17', roughness: 0.6 }), []);
  const chipMaterials = useMemo(
    () => CHIP_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 })),
    [],
  );
  const cards = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = seed * 1.3 + i * 1.25;
        const r = radius * (0.35 + ((i * 17 + seed) % 5) * 0.08);
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, rot: a * 2.1, back: i % 2 === 0 };
      }),
    [radius, seed],
  );
  const chairAngles = [0.4, 2.5, 4.4];

  return (
    <group position={position}>
      <group rotation-y={rotation}>
        <Cylinder dims={[radius, radius * 0.97, 0.05, 20]} position={[0, 0.755, 0]} material={m.woodMid} />
        <Cylinder dims={[radius - 0.07, radius - 0.07, 0.012, 20]} position={[0, 0.786, 0]} material={felt} cast={false} />
        <mesh position={[0, 0.79, 0]} rotation-x={Math.PI / 2} material={m.leather} castShadow>
          <torusGeometry args={[radius - 0.035, 0.032, 5, 24]} />
        </mesh>
        <Cylinder dims={[0.07, 0.09, 0.72, 8]} position={[0, 0.37, 0]} material={m.woodDark} />
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            size={[0.62, 0.05, 0.08]}
            position={[0, 0.03, 0]}
            rotation-y={(i * Math.PI) / 4}
            material={m.woodDark}
          />
        ))}
        {cards.map((c, i) => (
          <Box
            key={i}
            size={[0.065, 0.004, 0.095]}
            position={[c.x, 0.794, c.z]}
            rotation-y={c.rot}
            material={c.back ? cardBack : m.cream}
            cast={false}
          />
        ))}
        {[0, 1, 2].map((s) => {
          const a = seed + s * 2.1;
          const x = Math.cos(a) * radius * 0.55;
          const z = Math.sin(a) * radius * 0.55;
          const count = 3 + ((s + seed) % 4);
          return Array.from({ length: count }, (_, i) => (
            <Cylinder
              key={`${s}-${i}`}
              dims={[0.022, 0.022, 0.009, 10]}
              position={[x, 0.797 + i * 0.01, z]}
              material={chipMaterials[(s + i) % chipMaterials.length]}
              cast={false}
            />
          ));
        })}
      </group>
      {chairAngles.map((a, i) => {
        const angle = a + rotation;
        const d = radius + 0.3;
        return (
          <Chair key={i} position={[Math.sin(angle) * d, 0, Math.cos(angle) * d]} rotationY={angle + Math.PI} />
        );
      })}
    </group>
  );
}

export function CardTables() {
  const activation = useHotspotActivation();
  const felt = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PALETTE.felt,
        roughness: 0.95,
        emissive: '#3de07f',
        emissiveIntensity: 0,
      }),
    [],
  );
  useFrame(() => {
    felt.emissiveIntensity = activation.current * 0.85;
  });
  return (
    <>
      {TABLES.map((t, i) => (
        <CardTable key={i} {...t} felt={felt} seed={i + 1} />
      ))}
    </>
  );
}

/* ───────────────────────── Slot cabinets ───────────────────────── */

const BULBS_PER_CABINET = 9;
const MARQUEE_RADIUS = 0.28;

export function SlotCabinets() {
  const m = getMaterials();
  const activation = useHotspotActivation();
  const marquee = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ color: '#6b4a1c', emissive: '#ffa53a', emissiveIntensity: 0.35, roughness: 0.4 }),
    [],
  );
  const reels = useMemo(
    () =>
      CABINETS.xs.map((_, i) => {
        const map = slotReelsTexture(i + 5);
        return new THREE.MeshStandardMaterial({
          map,
          emissiveMap: map,
          emissive: '#ffffff',
          emissiveIntensity: 0.2,
          roughness: 0.35,
        });
      }),
    [],
  );
  const knob = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b3201b', roughness: 0.25, metalness: 0.1 }),
    [],
  );
  const bulbMaterial = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const halos = useRef<THREE.Group>(null);
  const bulbCount = BULBS_PER_CABINET * CABINETS.xs.length;

  useLayoutEffect(() => {
    const mesh = bulbs.current!;
    const o = new THREE.Object3D();
    CABINETS.xs.forEach((x, c) => {
      for (let i = 0; i < BULBS_PER_CABINET; i++) {
        const a = (i / (BULBS_PER_CABINET - 1)) * Math.PI;
        o.position.set(
          x + Math.cos(a) * (MARQUEE_RADIUS + 0.015),
          1.58 + Math.sin(a) * (MARQUEE_RADIUS + 0.015),
          CABINETS.z + 0.245,
        );
        o.updateMatrix();
        mesh.setMatrixAt(c * BULBS_PER_CABINET + i, o.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  const dim = useMemo(() => new THREE.Color('#6a4418'), []);
  const lit = useMemo(() => new THREE.Color('#ffd27a'), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const a = activation.current;
    const t = clock.elapsedTime;
    let flicker = 0.82 + 0.18 * Math.sin(t * 31) * Math.sin(t * 7.7);
    if (Math.sin(t * 2.3) > 0.94) flicker *= 0.45;
    marquee.emissiveIntensity = 0.35 + a * 1.7 * flicker;
    reels.forEach((r) => (r.emissiveIntensity = 0.2 + a * 0.75 * flicker));
    const mesh = bulbs.current;
    if (mesh) {
      for (let i = 0; i < bulbCount; i++) {
        const chase = (Math.sin(t * 9 - i * 1.2) + 1) / 2;
        const idle = 0.35 + 0.1 * Math.sin(t * 1.5 + i);
        tmp.copy(dim).lerp(lit, idle + a * (chase * 0.65 - idle * 0.4 + 0.25));
        mesh.setColorAt(i, tmp);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    halos.current?.children.forEach((h) => {
      ((h as THREE.Sprite).material as THREE.SpriteMaterial).opacity = 0.12 + a * 0.45 * flicker;
    });
  });

  const w = CABINETS.width;
  return (
    <group>
      {CABINETS.xs.map((x, i) => (
        <group key={x} position={[x, 0, CABINETS.z]}>
          <Box size={[w, 0.85, 0.55]} position={[0, 0.425, 0]} material={m.woodDark} />
          <Box size={[w + 0.02, 0.03, 0.57]} position={[0, 0.865, 0]} material={m.brass} />
          <Box size={[w - 0.04, 0.72, 0.46]} position={[0, 1.22, -0.02]} material={m.wood} />
          <mesh position={[0, 1.3, 0.212]} material={reels[i]}>
            <planeGeometry args={[0.42, 0.21]} />
          </mesh>
          <Box size={[0.48, 0.03, 0.03]} position={[0, 1.42, 0.215]} material={m.brass} cast={false} />
          <Box size={[0.48, 0.03, 0.03]} position={[0, 1.18, 0.215]} material={m.brass} cast={false} />
          <Box size={[0.3, 0.05, 0.12]} position={[0, 0.96, 0.24]} material={m.brass} />
          <mesh position={[0, 1.58, -0.02]} rotation-x={-Math.PI / 2} material={marquee} castShadow>
            <cylinderGeometry args={[MARQUEE_RADIUS, MARQUEE_RADIUS, 0.46, 18, 1, false, -Math.PI / 2, Math.PI]} />
          </mesh>
          <Text
            font={FONT_URL}
            fontSize={0.075}
            position={[0, 1.68, 0.215]}
            color="#2a1206"
            anchorX="center"
            anchorY="middle"
          >
            SLOTS
          </Text>
          <Cylinder dims={[0.014, 0.014, 0.36, 6]} position={[w / 2 + 0.03, 1.36, 0.05]} material={m.iron} />
          <mesh position={[w / 2 + 0.03, 1.56, 0.05]} material={knob} castShadow>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={bulbs} args={[undefined, bulbMaterial, bulbCount]}>
        <sphereGeometry args={[0.018, 6, 5]} />
      </instancedMesh>
      <group ref={halos}>
        {CABINETS.xs.map((x) => (
          <Halo key={x} color="#ffac40" size={1.3} opacity={0.12} position={[x, 1.55, CABINETS.z + 0.3]} />
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── Bulletin board ───────────────────────── */

export function BulletinBoard() {
  const m = getMaterials();
  const activation = useHotspotActivation();
  const papers = useMemo(() => {
    const make = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.95 });
    return [
      { mat: make(warMapTexture()), size: [0.56, 0.43] as const, pin: [-0.16, 0.3] as const, rot: 0.02 },
      { mat: make(wantedPosterTexture()), size: [0.25, 0.35] as const, pin: [0.34, 0.33] as const, rot: -0.07 },
      { mat: make(noteTexture(31)), size: [0.19, 0.19] as const, pin: [0.3, -0.1] as const, rot: 0.1 },
      { mat: make(noteTexture(47)), size: [0.17, 0.17] as const, pin: [-0.36, -0.2] as const, rot: -0.13 },
    ];
  }, []);
  const pinMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b3201b', emissive: '#ff3b1f', emissiveIntensity: 0.1, roughness: 0.3 }),
    [],
  );
  const paperGroups = useRef<(THREE.Group | null)[]>([]);
  const pinHalos = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const a = activation.current;
    const t = clock.elapsedTime;
    papers.forEach((p, i) => {
      p.mat.emissiveIntensity = a * 0.22;
      const g = paperGroups.current[i];
      if (g) g.rotation.z = p.rot + a * Math.sin(t * 13 + i * 2.1) * 0.03 * (0.6 + 0.4 * Math.sin(t * 2.7 + i));
    });
    pinMaterial.emissiveIntensity = 0.1 + a * 2.4;
    pinHalos.current?.children.forEach((h, i) => {
      ((h as THREE.Sprite).material as THREE.SpriteMaterial).opacity = a * (0.55 + 0.25 * Math.sin(t * 5 + i));
    });
  });

  const { width, height } = BOARD;
  return (
    <group position={BOARD.position}>
      <Box size={[width + 0.1, height + 0.1, 0.05]} material={m.woodMid} cast={false} />
      <Box size={[width, height, 0.03]} position={[0, 0, 0.02]} material={m.cork} cast={false} />
      <Box size={[0.5, 0.11, 0.03]} position={[0, height / 2 + 0.1, 0.01]} material={m.woodDark} cast={false} />
      <Text font={FONT_URL} fontSize={0.05} letterSpacing={0.12} position={[0, height / 2 + 0.1, 0.03]} color="#e6d3a8" anchorX="center" anchorY="middle">
        NOTICES
      </Text>
      {papers.map((p, i) => (
        <group
          key={i}
          position={[p.pin[0], p.pin[1], 0.04 + i * 0.003]}
          ref={(g) => {
            paperGroups.current[i] = g;
          }}
        >
          <mesh position={[0, -p.size[1] / 2 + 0.025, 0]} material={p.mat}>
            <planeGeometry args={[p.size[0], p.size[1]]} />
          </mesh>
          <mesh position={[0, 0, 0.01]} material={pinMaterial}>
            <sphereGeometry args={[0.015, 8, 6]} />
          </mesh>
        </group>
      ))}
      <group ref={pinHalos}>
        {papers.map((p, i) => (
          <Halo key={i} color="#ff5a36" size={0.16} opacity={0} position={[p.pin[0], p.pin[1], 0.07]} />
        ))}
      </group>
    </group>
  );
}
