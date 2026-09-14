'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, PerspectiveCamera, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

// High-detail source: Khronos glTF Sample Assets / Chronograph Watch.
// Source model: Eric Chadwick / Darmstadt Graphics Group GmbH, CC BY 4.0.
// The source also contains Khronos / 3D Commerce / DGG marks; this is a prototype asset,
// not the final commercial-branded ROVIXE asset. Replace with a cleared/licensed asset before launch.
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChronographWatch/glTF-Binary/ChronographWatch.glb';

function RealWatch({ progress }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const root = useRef();
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
      list.push({ node, original, world });

      // Hide explicit source-brand logo meshes where the asset exposes them as nodes.
      const name = (node.name || '').toLowerCase();
      if (name.includes('khronos') || name.includes('dgg') || name.includes('3dcommerce') || name.includes('3d_commerce')) {
        node.visible = false;
      }
    });
    return list;
  }, [scene]);

  useEffect(() => {
    scene.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (!mat) return;
        mat.envMapIntensity = 1.65;
        if ('roughness' in mat && mat.roughness > 0.55) mat.roughness = 0.42;
        if ('metalness' in mat && mat.metalness > 0.4) mat.metalness = Math.min(1, mat.metalness + 0.12);
      });
    });
  }, [scene]);

  useEffect(() => {
    if (!animations?.length) return;
    const mixer = new THREE.AnimationMixer(scene);
    const actions = animations.map((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
      return action;
    });
    return () => {
      actions.forEach((action) => action.stop());
      mixer.stopAllAction();
    };
  }, [scene, animations]);

  useFrame((state, delta) => {
    const intro = THREE.MathUtils.smoothstep(progress, 0, 0.22);
    const explosion = THREE.MathUtils.smoothstep(progress, 0.38, 0.62);
    const reassemble = THREE.MathUtils.smoothstep(progress, 0.76, 0.96);
    const spread = explosion * (1 - reassemble);

    root.current.rotation.x = THREE.MathUtils.lerp(-0.12, 0.12, progress);
    root.current.rotation.y += delta * (0.14 + progress * 0.18);
    root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.012;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.012;

    state.camera.position.z = THREE.MathUtils.lerp(5.2, 3.0, intro);
    state.camera.position.y = THREE.MathUtils.lerp(0.05, 0.18, progress);
    state.camera.fov = THREE.MathUtils.lerp(39, 28, THREE.MathUtils.smoothstep(progress, 0.1, 0.48));
    state.camera.lookAt(0, 0, 0);
    state.camera.updateProjectionMatrix();

    parts.forEach(({ node, original, world }, i) => {
      const radial = new THREE.Vector3(world.x, world.y, world.z).normalize();
      const alternating = i % 3 === 0 ? 1.08 : i % 3 === 1 ? 0.78 : 0.56;
      const target = original.clone().add(radial.multiplyScalar(spread * alternating));
      node.position.lerp(target, 0.12);
      node.rotation.z += spread * 0.002 * (i % 2 ? 1 : -1);
    });
  });

  return <Float speed={0.55} rotationIntensity={0.05} floatIntensity={0.08}>
    <primitive ref={root} object={scene} scale={1.72} />
  </Float>;
}

useGLTF.preload(MODEL_URL);

function Scene({ progress }) {
  return <>
    <PerspectiveCamera makeDefault position={[0, 0.05, 5.2]} fov={39} />
    <ambientLight intensity={0.16} />
    <spotLight position={[4.8, 5.5, 5]} intensity={20} angle={0.24} penumbra={0.9} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.00003} />
    <spotLight position={[-4.5, 2.8, 3.5]} intensity={15} angle={0.3} penumbra={0.95} castShadow />
    <spotLight position={[0, -3.5, 2]} intensity={7} angle={0.45} penumbra={1} />
    <rectAreaLight position={[0, 4, 4]} width={6} height={2.5} intensity={9} />
    <rectAreaLight position={[-4, 0, 1]} rotation={[0, Math.PI / 2, 0]} width={3} height={5} intensity={6} />
    <pointLight position={[2, -1, 3]} intensity={3.5} color="#d7b66c" />
    <Environment preset="studio" environmentIntensity={1.7} />
    <RealWatch progress={progress} />
    <ContactShadows position={[0, -1.25, 0]} opacity={0.52} scale={5.5} blur={2.2} far={5} resolution={1024} />
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
      end: '+=5200',
      pin: true,
      scrub: 1.2,
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
        <color attach="background" args={['#030303']} />
        <Scene progress={progress} />
      </Canvas>
    </div>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>HOROLOGICAL OBJECT 01</p>
      <h1>TIME<br />ENGINEERED.</h1>
      <p className={styles.description}>A high-detail mechanical chronograph presented as a cinematic, scroll-controlled product experience.</p>
      <div className={styles.progress}><span style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} /></div>
    </div>
    <div className={`${styles.labels} ${progress > 0.28 ? styles.visible : ''}`}>
      <span>{activeLabel}</span>
      <span>HIGH-DETAIL GLB</span>
      <span>PBR / HDR STUDIO</span>
      <span>SCROLL EXPLODED VIEW</span>
    </div>
    <div className={styles.scrollHint}>SCROLL TO DISASSEMBLE ↓</div>
    <div className={styles.cta}><button type="button">DISCOVER THE MOVEMENT <span>→</span></button></div>
    <div className={styles.grain} />
  </section>;
}
