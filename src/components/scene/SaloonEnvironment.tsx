import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BAR, CHANDELIER, PALETTE, ROOM, SIGN, STOOLS_X } from '@/config/scene';
import { getMaterials } from './materials';
import { Box, Cylinder, Halo } from './primitives';

const FONT_URL = '/fonts/Rye-Regular.ttf';

export function SaloonEnvironment() {
  const m = getMaterials();
  const width = ROOM.halfWidth * 2;
  const depth = ROOM.frontZ - ROOM.backZ;
  const midZ = (ROOM.frontZ + ROOM.backZ) / 2;
  const h = ROOM.height;

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]} receiveShadow material={m.floor}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      <mesh position={[0, h / 2, ROOM.backZ]} receiveShadow material={m.wall}>
        <planeGeometry args={[width, h]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * ROOM.halfWidth, h / 2, midZ]}
          rotation-y={(-side * Math.PI) / 2}
          receiveShadow
          material={m.wall}
        >
          <planeGeometry args={[depth, h]} />
        </mesh>
      ))}
      <mesh position={[0, h, midZ]} rotation-x={Math.PI / 2} material={m.woodDark}>
        <planeGeometry args={[width, depth]} />
      </mesh>

      <Box size={[width, 1.0, 0.05]} position={[0, 0.5, ROOM.backZ + 0.025]} material={m.panel} cast={false} />
      <Box size={[width, 0.06, 0.09]} position={[0, 1.02, ROOM.backZ + 0.05]} material={m.woodMid} cast={false} />
      <Box size={[width, 0.14, 0.07]} position={[0, 0.07, ROOM.backZ + 0.04]} material={m.woodDark} cast={false} />
      {[-4.0, -2.6, -1.2, 0.2, 1.6, 3.0].map((z) => (
        <Box key={z} size={[width, 0.22, 0.2]} position={[0, h - 0.11, z]} material={m.woodDark} cast={false} />
      ))}
      {[-1, 1].map((side) => (
        <Box
          key={side}
          size={[0.2, h, 0.2]}
          position={[side * (ROOM.halfWidth - 0.1), h / 2, ROOM.backZ + 0.1]}
          material={m.wood}
        />
      ))}

      <Sign />
      <Sconces />
      <Chandelier />
      <Stools />
      <Barrels />
    </group>
  );
}

function Sign() {
  const m = getMaterials();
  return (
    <group position={SIGN.position}>
      <Box size={[2.3, 0.58, 0.07]} material={m.woodDark} cast={false} />
      <Box size={[2.38, 0.045, 0.09]} position={[0, 0.3, 0]} material={m.brass} cast={false} />
      <Box size={[2.38, 0.045, 0.09]} position={[0, -0.3, 0]} material={m.brass} cast={false} />
      <Text
        font={FONT_URL}
        fontSize={0.2}
        letterSpacing={0.05}
        position={[0, 0.05, 0.04]}
        color="#ecd9ad"
        anchorX="center"
        anchorY="middle"
      >
        THE BLOODY RAVEN
      </Text>
      <Text
        font={FONT_URL}
        fontSize={0.085}
        letterSpacing={0.3}
        position={[0, -0.17, 0.04]}
        color="#e0503f"
        anchorX="center"
        anchorY="middle"
      >
        — SALOON —
      </Text>
    </group>
  );
}

function Sconces() {
  const m = getMaterials();
  return (
    <>
      {[-1.6, 1.6].map((x) => (
        <group key={x} position={[x, 3.1, ROOM.backZ + 0.12]}>
          <Box size={[0.06, 0.06, 0.2]} position={[0, -0.12, -0.03]} material={m.brass} cast={false} />
          <Box size={[0.13, 0.2, 0.13]} position={[0, 0, 0.05]} material={m.lanternGlass} cast={false} />
          <Box size={[0.16, 0.03, 0.16]} position={[0, 0.115, 0.05]} material={m.iron} cast={false} />
          <Halo color={PALETTE.flame} size={0.9} opacity={0.35} position={[0, 0, 0.12]} />
        </group>
      ))}
    </>
  );
}

const CANDLES = 8;
const RING_RADIUS = 0.72;
export const CHANDELIER_LIGHT_INTENSITY = 14;

function Chandelier() {
  const m = getMaterials();
  const flames = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flames.current?.children.forEach((f, i) => {
      f.scale.y = 1 + Math.sin(t * 11 + i * 1.7) * 0.14 + Math.sin(t * 23 + i) * 0.06;
    });
    if (light.current) {
      light.current.intensity =
        CHANDELIER_LIGHT_INTENSITY * (1 + Math.sin(t * 7.3) * 0.035 + Math.sin(t * 13.1) * 0.02);
    }
  });

  const candles = useMemo(
    () =>
      Array.from({ length: CANDLES }, (_, i) => {
        const a = (i / CANDLES) * Math.PI * 2;
        return [Math.cos(a) * RING_RADIUS, Math.sin(a) * RING_RADIUS] as const;
      }),
    [],
  );

  return (
    <group position={CHANDELIER}>
      <mesh rotation-x={Math.PI / 2} material={m.woodDark} castShadow>
        <torusGeometry args={[RING_RADIUS, 0.05, 6, 28]} />
      </mesh>
      <Cylinder dims={[0.09, 0.09, 0.12, 8]} material={m.woodDark} />
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          size={[RING_RADIUS * 2, 0.035, 0.035]}
          rotation-y={(i / 6) * Math.PI}
          material={m.woodDark}
        />
      ))}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        const len = ROOM.height - CHANDELIER[1];
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * RING_RADIUS, len / 2, Math.sin(a) * RING_RADIUS]}
            material={m.iron}
          >
            <cylinderGeometry args={[0.008, 0.008, len, 4]} />
          </mesh>
        );
      })}
      {candles.map(([x, z], i) => (
        <group key={i} position={[x, 0.05, z]}>
          <Cylinder dims={[0.025, 0.025, 0.12, 6]} position={[0, 0.06, 0]} material={m.cream} cast={false} />
        </group>
      ))}
      <group ref={flames}>
        {candles.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.19, z]} material={m.flame}>
            <coneGeometry args={[0.018, 0.06, 6]} />
          </mesh>
        ))}
      </group>
      {candles.map(([x, z], i) => (
        <Halo key={i} color={PALETTE.flame} size={0.34} opacity={0.55} position={[x, 0.19, z]} />
      ))}
      <pointLight
        ref={light}
        position={[0, -0.1, 0]}
        color="#ffb36b"
        intensity={CHANDELIER_LIGHT_INTENSITY}
        distance={9}
        decay={1.6}
      />
    </group>
  );
}

function Stools() {
  const m = getMaterials();
  const z = BAR.z + BAR.depth / 2 + 0.42;
  return (
    <>
      {STOOLS_X.map((x) => (
        <group key={x} position={[x, 0, z]}>
          <Cylinder dims={[0.2, 0.19, 0.07, 14]} position={[0, 0.74, 0]} material={m.leather} />
          <Cylinder dims={[0.035, 0.035, 0.7, 6]} position={[0, 0.37, 0]} material={m.iron} />
          <mesh position={[0, 0.3, 0]} rotation-x={Math.PI / 2} material={m.brass}>
            <torusGeometry args={[0.13, 0.012, 4, 14]} />
          </mesh>
          <Cylinder dims={[0.16, 0.19, 0.03, 12]} position={[0, 0.015, 0]} material={m.iron} />
        </group>
      ))}
    </>
  );
}

function Barrels() {
  const m = getMaterials();
  const geometry = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.26, 0),
      new THREE.Vector2(0.3, 0.2),
      new THREE.Vector2(0.315, 0.42),
      new THREE.Vector2(0.3, 0.64),
      new THREE.Vector2(0.26, 0.84),
      new THREE.Vector2(0, 0.84),
    ];
    return new THREE.LatheGeometry(pts, 12);
  }, []);
  const spots: [number, number, number][] = [
    [-2.35, 0, -4.1],
    [-1.72, 0, -4.18],
  ];
  return (
    <>
      {spots.map((p, i) => (
        <group key={i} position={p} rotation-y={i * 0.7}>
          <mesh geometry={geometry} material={m.woodMid} castShadow receiveShadow />
          {[0.14, 0.7].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} material={m.iron}>
              <torusGeometry args={[0.3, 0.014, 4, 16]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
