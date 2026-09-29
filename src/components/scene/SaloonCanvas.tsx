'use client';

import { Component, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { CAMERA } from '@/config/scene';
import { HOTSPOT_BY_ID } from '@/config/hotspots';
import { hotspotStore } from '@/lib/hotspotStore';
import { SaloonEnvironment } from './SaloonEnvironment';
import { BarArea, BulletinBoard, CardTables, SlotCabinets } from './SaloonProps';
import { Hotspot } from './Hotspot';
import { HotspotLight } from './HotspotLight';
import { HostAvatar } from './HostAvatar';
import { CameraRig, INTRO_START } from './CameraRig';
import { Atmosphere } from './Atmosphere';

class HostBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[Solslinger] Host avatar failed to load; continuing without it.', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Lights() {
  const key = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => {
    const spot = key.current;
    if (!spot) return;
    spot.target.position.set(0, 0.9, -1.6);
    spot.target.updateMatrixWorld();
  }, []);
  return (
    <>
      <hemisphereLight args={['#9a7550', '#1a0f08', 0.55]} />
      <spotLight
        ref={key}
        position={[0.9, 4.5, 1.4]}
        angle={0.9}
        penumbra={0.85}
        intensity={70}
        distance={14}
        decay={1.5}
        color="#ffc27f"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[0, 2.9, -3.6]} color="#ff9d52" intensity={9} distance={4.5} decay={1.6} />
      <pointLight position={[-0.95, 1.4, -1.6]} color="#ffb060" intensity={2.2} distance={2.6} decay={1.8} />
      <directionalLight position={[4, 3.5, 2]} color="#6f8fe0" intensity={0.5} />
    </>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
    const id = requestAnimationFrame(() => onReady());
    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera, onReady]);
  return null;
}

export default function SaloonCanvas({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: INTRO_START, fov: CAMERA.fov, near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.1;
      }}
      onPointerMissed={() => hotspotStore.set(null)}
    >
      <color attach="background" args={['#0b0705']} />
      <fog attach="fog" args={['#0f0906', 9, 20]} />
      <Suspense fallback={null}>
        <Lights />
        <Environment frames={1} resolution={64} environmentIntensity={0.35}>
          <Lightformer form="rect" intensity={2} color="#ffb870" position={[0, 3, 2]} scale={[4, 1.5, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#ff9040" position={[-3, 2, -2]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#7f9cff" position={[3, 2, 0]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} />
        </Environment>
        <SaloonEnvironment />
        <Hotspot config={HOTSPOT_BY_ID.lounge}>
          <BarArea />
        </Hotspot>
        <Hotspot config={HOTSPOT_BY_ID['card-rooms']}>
          <CardTables />
        </Hotspot>
        <Hotspot config={HOTSPOT_BY_ID['slot-machines']}>
          <SlotCabinets />
        </Hotspot>
        <Hotspot config={HOTSPOT_BY_ID['faction-map']}>
          <BulletinBoard />
        </Hotspot>
        <HostBoundary>
          <HostAvatar />
        </HostBoundary>
        <HotspotLight />
        <Atmosphere />
        <CameraRig />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
