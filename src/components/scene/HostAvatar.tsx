import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { HOST } from '@/config/scene';
import { HOTSPOT_BY_ID } from '@/config/hotspots';
import { hotspotStore } from '@/lib/hotspotStore';

export const HOST_URL = '/models/host.glb';

// Share of the total look rotation each bone takes, from the chest up.
const LOOK_CHAIN: [bone: string, weight: number][] = [
  ['Spine2', 0.25],
  ['Neck', 0.3],
  ['Head', 0.45],
];
const MAX_YAW = 1.25;
const MAX_PITCH_UP = 0.4;
const MAX_PITCH_DOWN = 0.55;
const NEUTRAL_WEIGHT = 0.5;

function buildHat() {
  // Units are head-lengths so the hat fits whatever scale the rig uses.
  const felt = new THREE.MeshStandardMaterial({ color: '#6b4127', roughness: 0.85, side: THREE.DoubleSide });
  const band = new THREE.MeshStandardMaterial({ color: '#7d1a17', roughness: 0.6 });
  const profile = [
    [0, 0.62], [0.36, 0.6], [0.48, 0.5], [0.5, 0.12], [0.52, 0.05],
    [0.82, 0.04], [0.97, 0.12], [1.02, 0.18],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const hat = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 18), felt);
  shell.scale.set(1, 1, 0.82);
  const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.505, 0.515, 0.1, 18, 1, true), band);
  ribbon.position.y = 0.12;
  ribbon.scale.set(1, 1, 0.82);
  hat.add(shell, ribbon);
  hat.traverse((o) => (o.castShadow = true));
  hat.name = 'host-hat';
  return hat;
}

export function HostAvatar() {
  const { scene, animations } = useGLTF(HOST_URL);
  const root = useRef<THREE.Group>(null);

  const rig = useMemo(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // The source asks for metalness 0.4, which reads as muddy without a studio env map.
      mat.metalness = 0;
      mat.roughness = 0.75;
      if (mat.map) {
        // The texture is a tiny colour-swatch atlas; nearest filtering keeps the swatches crisp.
        mat.map.magFilter = THREE.NearestFilter;
        mat.map.minFilter = THREE.NearestFilter;
        mat.map.generateMipmaps = false;
        mat.map.needsUpdate = true;
      }
    });
    // Measure from the skeleton: skinned bounding boxes on this FBX-converted rig are unreliable.
    scene.updateWorldMatrix(true, true);
    const worldY = (name: string) => {
      const node = scene.getObjectByName(name);
      return node ? scene.worldToLocal(node.getWorldPosition(new THREE.Vector3())).y : undefined;
    };
    const footY = Math.min(...['LeftToe_End', 'RightToe_End', 'LeftFoot', 'RightFoot'].map((n) => worldY(n) ?? Infinity));
    const topY = worldY('HeadTop_End') ?? NaN;
    const height = (topY - footY) * 1.03;
    const valid = Number.isFinite(height) && height > 0;
    const scale = valid ? HOST.height / height : 1;
    const minY = valid ? footY : 0;
    const chain = LOOK_CHAIN.map(([name, w]) => [scene.getObjectByName(name), w] as const).filter(
      (entry): entry is readonly [THREE.Object3D, number] => !!entry[0]?.parent,
    );
    return {
      scale,
      offsetY: -minY * scale,
      chain,
      head: scene.getObjectByName('Head') ?? null,
      headTop: scene.getObjectByName('HeadTop_End') ?? null,
    };
  }, [scene]);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  useEffect(() => {
    const clip = animations.find((a) => /(^|\|)Idle$/.test(a.name)) ?? animations[0];
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.time = Math.random() * clip.duration;
    action.play();
    return () => {
      action.stop();
      mixer.uncacheClip(clip);
    };
  }, [animations, mixer]);

  useEffect(() => {
    const { head, headTop } = rig;
    const group = root.current;
    if (!head || !headTop || !group) return;
    group.updateMatrixWorld(true);
    const headPos = head.getWorldPosition(new THREE.Vector3());
    const topPos = headTop.getWorldPosition(new THREE.Vector3());
    const headLen = headPos.distanceTo(topPos);
    if (!(headLen > 0)) return;

    const hat = buildHat();
    const up = new THREE.Vector3(0, 1, 0);
    const worldPos = topPos.clone().addScaledVector(up, -headLen * 0.34);
    const worldQuat = group
      .getWorldQuaternion(new THREE.Quaternion())
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0, 0.06)));
    const world = new THREE.Matrix4().compose(worldPos, worldQuat, new THREE.Vector3().setScalar(headLen * 1.05));
    const local = new THREE.Matrix4().copy(head.matrixWorld).invert().multiply(world);
    local.decompose(hat.position, hat.quaternion, hat.scale);
    head.add(hat);
    return () => {
      head.remove(hat);
    };
  }, [rig]);

  const look = useMemo(
    () => ({
      yaw: 0,
      pitch: 0,
      target: new THREE.Vector3(),
      headWorld: new THREE.Vector3(),
      hostQ: new THREE.Quaternion(),
      hostQInv: new THREE.Quaternion(),
      parentQ: new THREE.Quaternion(),
      parentQInv: new THREE.Quaternion(),
      delta: new THREE.Quaternion(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    }),
    [],
  );

  useFrame(({ camera }, dt) => {
    mixer.update(dt);
    const group = root.current;
    const { head, chain } = rig;
    if (!group || !head) return;

    const id = hotspotStore.get();
    if (id) look.target.set(...HOTSPOT_BY_ID[id].lookTarget);
    else look.target.copy(camera.position);

    group.updateMatrixWorld(true);
    head.getWorldPosition(look.headWorld);
    group.worldToLocal(look.target);
    group.worldToLocal(look.headWorld);
    const d = look.target.sub(look.headWorld);
    const weight = id ? 1 : NEUTRAL_WEIGHT;
    const yawGoal = THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -MAX_YAW, MAX_YAW) * weight;
    const pitchGoal =
      THREE.MathUtils.clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)), -MAX_PITCH_DOWN, MAX_PITCH_UP) * weight;
    look.yaw = THREE.MathUtils.damp(look.yaw, yawGoal, 3.2, dt);
    look.pitch = THREE.MathUtils.damp(look.pitch, pitchGoal, 3.2, dt);

    // Layer the look rotation on top of the animated pose, expressed in host space
    // and converted into each bone's parent space: q' = P⁻¹ · (H·R·H⁻¹) · P · q.
    group.getWorldQuaternion(look.hostQ);
    look.hostQInv.copy(look.hostQ).invert();
    for (const [bone, w] of chain) {
      look.euler.set(-look.pitch * w, look.yaw * w, 0);
      look.delta.setFromEuler(look.euler).premultiply(look.hostQ).multiply(look.hostQInv);
      bone.parent!.getWorldQuaternion(look.parentQ);
      look.parentQInv.copy(look.parentQ).invert();
      look.delta.premultiply(look.parentQInv).multiply(look.parentQ);
      bone.quaternion.premultiply(look.delta);
    }
  });

  return (
    <group ref={root} position={HOST.position}>
      <group scale={rig.scale} position-y={rig.offsetY}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload(HOST_URL);
