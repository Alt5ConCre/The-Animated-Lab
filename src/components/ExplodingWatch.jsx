'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

// High-detail CC BY 4.0 prototype asset. Replace with a cleared commercial asset before launch.
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChronographWatch/glTF-Binary/ChronographWatch.glb';

function RealWatch({ progress }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const root = useRef();
  const mixerRef = useRef();

  const parts = useMemo(() => {
    const list = [];
    scene.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = true;
      const original = node.position.clone();
      const world = new THREE.Vector3();
      node.getWorldPosition(world);
      const box = new THREE.Box3().setFromObject(node);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      list.push({ node, original, world, center, size });

      const name = (node.name || '').toLowerCase();
      if (name.includes('khronos') || name.includes('dgg') || name.includes('3dcommerce') || name.includes('3d_commerce')) node.visible = false;
    });
    return list;
  }, [scene]);

  useEffect(() => {
    scene.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (!mat) return;
        mat.envMapIntensity = 2.15;
        if ('roughness' in mat) mat.roughness = THREE.MathUtils.clamp(mat.roughness * 0.72, 0.12, 0.48);
        if ('metalness' in mat && mat.metalness > 0.25) mat.metalness = Math.min(1, mat.metalness + 0.08);
        if ('clearcoat' in mat) mat.clearcoat = Math.max(mat.clearcoat, 0.65);
        if ('clearcoatRoughness' in mat) mat.clearcoatRoughness = 0.16;
        if ('ior' in mat) mat.ior = 1.5;
        if ('reflectivity' in mat) mat.reflectivity = 0.7;
        mat.needsUpdate = true;
      });
    });
  }, [scene]);

  useEffect(() => {
    if (!animations?.length) return;
    mixerRef.current = new THREE.AnimationMixer(scene);
    animations.forEach((clip) => mixerRef.current.clipAction(clip).play());
    return () => mixerRef.current?.stopAllAction();
  }, [scene, animations]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);
    const intro = THREE.MathUtils.smoothstep(progress, 0, 0.24);
    const explosion = THREE.MathUtils.smoothstep(progress, 0.38, 0.62);
    const reassemble = THREE.MathUtils.smoothstep(progress, 0.76, 0.96);
    const spread = explosion * (1 - reassemble);

    // Cinematic product rotation: deliberate and slow, never arcade-like.
    root.current.rotation.x = THREE.MathUtils.lerp(-0.08, 0.08, progress);
    root.current.rotation.y += delta * (0.055 + progress * 0.075);
    root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.006;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.008;

    // Wider, more photographic framing instead of an artificial zoom.
    state.camera.position.x = Math.sin(progress * Math.PI * 1.2) * 0.22;
    state.camera.position.y = THREE.MathUtils.lerp(0.03, 0.12, progress);
    state.camera.position.z = THREE.MathUtils.lerp(7.1, 5.15, intro);
    state.camera.fov = THREE.MathUtils.lerp(47, 40, THREE.MathUtils.smoothstep(progress, 0.08, 0.5));
    state.camera.lookAt(0, 0.02, 0);
    state.camera.updateProjectionMatrix();

    parts.forEach(({ node, original, world, center, size }, i) => {
      const radial = new THREE.Vector3(world.x, world.y, world.z);
      radial.z *= 0.65;
      if (radial.lengthSq() < 0.0001) radial.set(0, 0, 1);
      radial.normalize();
      const layer = i % 5;
      const distance = layer === 0 ? 1.25 : layer === 1 ? 0.9 : layer === 2 ? 0.68 : layer === 3 ? 0.48 : 0.32;
      const depthBias = Math.sin(i * 1.73) * 0.18;
      const target = original.clone().add(radial.multiplyScalar(spread * (distance + depthBias)));
      target.y += spread * Math.sin(i * 0.73) * 0.08;
      node.position.lerp(target, 0.075);

      // Tiny physical component motion during disassembly.
      const motion = Math.min(1, size.length() * 0.15);
      node.rotation.x += spread * motion * 0.0008;
      node.rotation.z += spread * 0.0012 * (i % 2 ? 1 : -1);
    });
  });

  return <primitive ref={root} object={scene} scale={1.58} />;
}

useGLTF.preload(MODEL_URL);

function Scene({ progress }) {
  return <>
    <PerspectiveCamera makeDefault position={[0, 0.03, 7.1]} fov={47} near={0.1} far={100} />
    <ambientLight intensity={0.08} />

    {/* Large soft sources create the long controlled highlights seen in luxury watch photography. */}
    <rectAreaLight position={[0, 5.5, 4]} width={7} height={2.2} intensity={10} />
    <rectAreaLight position={[4.8, 1.5, 2.8]} rotation={[0, 0.9, 0]} width={2.2} height={5.5} intensity={8} />
    <rectAreaLight position={[-4.8, 1.2, 2.4]} rotation={[0, -0.9, 0]} width={2.2} height={5.5} intensity={7} />
    <rectAreaLight position={[0, -3.2, 3]} width={5} height={1.4} intensity={4} />
    <spotLight position={[3.5, 5.8, 5]} intensity={12} angle={0.32} penumbra={0.96} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.00002} />
    <spotLight position={[-3.5, 3.5, 4]} intensity={8} angle={0.4} penumbra={1} castShadow shadow-mapSize={[2048, 2048]} />
    <pointLight position={[0, 0, 3]} intensity={1.5} />

    <Environment preset="studio" environmentIntensity={1.25} />
    <RealWatch progress={progress} />
    <ContactShadows position={[0, -1.05, 0]} opacity={0.38} scale={5} blur={2.8} far={4.5} resolution={1024} />
  </>;
}

export default function ExplodingWatch() {
  const section = useRef();
  const [progress, setProgress] = useState(0);
  const [activeLabel, setActiveLabel] = useState('THE ICON');

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: '+=5600',
      pin: true,
      scrub: 1.4,
      onUpdate: (self) => {
        setProgress(self.progress);
        if (self.progress < 0.2) setActiveLabel('THE ICON');
        else if (self.progress < 0.42) setActiveLabel('PRECISION CASE');
        else if (self.progress < 0.68) setActiveLabel('MECHANICAL CORE');
        else if (self.progress < 0.88) setActiveLabel('COMPONENTS');
        else setActiveLabel('FINAL ASSEMBLY');
      },
    });
    return () => trigger.kill();
  }, []);

  return <section ref={section} className={styles.watchSection}>
    <div className={styles.canvasWrap}>
      <Canvas dpr={[1, 2]} shadows gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#010101']} />
        <Scene progress={progress} />
      </Canvas>
    </div>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>HOROLOGICAL OBJECT 01</p>
      <h1>TIME<br />ENGINEERED.</h1>
      <p className={styles.description}>A cinematic mechanical chronograph rendered with photographic lighting, polished surfaces and controlled microscopic motion.</p>
      <div className={styles.progress}><span style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} /></div>
    </div>
    <div className={`${styles.labels} ${progress > 0.28 ? styles.visible : ''}`}>
      <span>{activeLabel}</span>
      <span>PHOTOREAL PBR</span>
      <span>STUDIO HDR LIGHTING</span>
      <span>PRECISION EXPLODED VIEW</span>
    </div>
    <div className={styles.scrollHint}>SCROLL TO DISASSEMBLE ↓</div>
    <div className={styles.cta}><button type="button">DISCOVER THE MOVEMENT <span>→</span></button></div>
    <div className={styles.grain} />
  </section>;
}
