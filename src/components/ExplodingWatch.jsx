'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

// High-detail CC BY 4.0 prototype asset. Replace with a cleared commercial asset before launch.
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChronographWatch/glTF-Binary/ChronographWatch.glb';

function CinematicPostFX() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.18, 0.32, 1.15);
    const output = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bloom);
    composer.addPass(output);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    composer.setSize(size.width, size.height);
    composerRef.current = composer;

    return () => {
      composer.dispose();
      composerRef.current = undefined;
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size]);

  useFrame((_, delta) => {
    composerRef.current?.render(delta);
  }, 1);

  return null;
}

function RealWatch({ progress }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const root = useRef();
  const mixerRef = useRef();

  const parts = useMemo(() => {
    const list = [];
    const modelBox = new THREE.Box3().setFromObject(scene);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());
    const modelSize = modelBox.getSize(new THREE.Vector3());
    const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z) || 1;

    scene.traverse((node) => {
      if (!node.isMesh) return;
      const name = (node.name || '').toLowerCase();
      if (name.includes('khronos') || name.includes('dgg') || name.includes('3dcommerce') || name.includes('3d_commerce')) {
        node.visible = false;
        return;
      }

      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = true;

      const box = new THREE.Box3().setFromObject(node);
      const center = box.getCenter(new THREE.Vector3());
      const direction = center.sub(modelCenter);
      direction.z *= 0.72;
      if (direction.lengthSq() < 0.00001) direction.set(0, 0, 1);
      direction.normalize();

      list.push({
        node,
        original: node.position.clone(),
        direction,
        size: box.getSize(new THREE.Vector3()),
        phase: list.length * 1.618,
        depth: THREE.MathUtils.clamp(Math.abs(center.z - modelCenter.z) / maxDimension, 0, 1),
      });
    });

    return list;
  }, [scene]);

  useEffect(() => {
    scene.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (!mat) return;
        mat.envMapIntensity = Math.max(mat.envMapIntensity || 1, 2.0);
        if ('roughness' in mat) mat.roughness = THREE.MathUtils.clamp(mat.roughness * 0.82, 0.16, 0.5);
        if ('metalness' in mat && mat.metalness > 0.2) mat.metalness = Math.min(1, mat.metalness + 0.05);
        if ('clearcoat' in mat) mat.clearcoat = Math.max(mat.clearcoat, 0.5);
        if ('clearcoatRoughness' in mat) mat.clearcoatRoughness = Math.min(mat.clearcoatRoughness || 0.2, 0.2);
        if ('ior' in mat) mat.ior = 1.5;
        if ('reflectivity' in mat) mat.reflectivity = 0.65;
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

    const intro = THREE.MathUtils.smoothstep(progress, 0.0, 0.22);
    const reveal = THREE.MathUtils.smoothstep(progress, 0.24, 0.42);
    const explosion = THREE.MathUtils.smoothstep(progress, 0.42, 0.62);
    const hold = THREE.MathUtils.smoothstep(progress, 0.62, 0.73);
    const reassemble = THREE.MathUtils.smoothstep(progress, 0.74, 0.96);
    const spread = explosion * (1 - reassemble);

    // Scroll controls the hero pose; idle movement is deliberately tiny so the watch remains readable.
    const idle = Math.sin(state.clock.elapsedTime * 0.16) * 0.008;
    root.current.rotation.x = THREE.MathUtils.lerp(-0.055, 0.045, intro) + idle;
    root.current.rotation.y = THREE.MathUtils.lerp(-0.18, 0.22, reveal) + Math.sin(state.clock.elapsedTime * 0.22) * 0.018;
    root.current.rotation.z = THREE.MathUtils.lerp(0.012, -0.01, progress);
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.48) * 0.006;

    // Real-camera style dolly: mostly stable focal length, with a controlled macro push during the story.
    const cameraProgress = THREE.MathUtils.smoothstep(progress, 0.03, 0.72);
    state.camera.position.x = THREE.MathUtils.lerp(0.0, 0.18, cameraProgress) + Math.sin(progress * Math.PI) * 0.06;
    state.camera.position.y = THREE.MathUtils.lerp(0.02, 0.08, cameraProgress);
    state.camera.position.z = THREE.MathUtils.lerp(7.25, 5.65, cameraProgress);
    state.camera.fov = THREE.MathUtils.lerp(46, 39, cameraProgress);
    state.camera.lookAt(0, 0.03, 0);
    state.camera.updateProjectionMatrix();

    parts.forEach(({ node, original, direction, size, phase, depth }) => {
      // Layered explosion keeps the movement mechanical instead of looking like random particle debris.
      const depthFactor = 0.72 + depth * 0.52;
      const distance = 0.28 + depthFactor * 0.82;
      const target = original.clone().add(direction.clone().multiplyScalar(spread * distance));
      target.y += spread * Math.sin(phase) * 0.045;
      target.z += spread * Math.cos(phase * 0.7) * 0.08;
      node.position.lerp(target, 0.11);

      const motion = THREE.MathUtils.clamp(size.length() * 0.12, 0.015, 0.08);
      node.rotation.x += spread * Math.sin(phase) * motion * 0.018;
      node.rotation.z += spread * Math.cos(phase) * motion * 0.018;
    });

    // Slight breathing while the mechanical core is exposed.
    if (hold > 0) {
      root.current.scale.setScalar(1.58 + Math.sin(state.clock.elapsedTime * 0.7) * 0.004 * hold);
    } else {
      root.current.scale.setScalar(1.58);
    }
  });

  return <primitive ref={root} object={scene} scale={1.58} />;
}

useGLTF.preload(MODEL_URL);

function Scene({ progress }) {
  return <>
    <PerspectiveCamera makeDefault position={[0, 0.02, 7.25]} fov={46} near={0.1} far={100} />
    <ambientLight intensity={0.045} />

    {/* Product-photography rig: broad soft reflections + narrow specular accents. */}
    <rectAreaLight position={[0, 5.2, 4.5]} width={6.5} height={2.4} intensity={8.5} />
    <rectAreaLight position={[4.6, 1.2, 3.1]} rotation={[0, 0.95, 0]} width={2.0} height={5.2} intensity={6.5} />
    <rectAreaLight position={[-4.6, 1.0, 2.8]} rotation={[0, -0.95, 0]} width={2.0} height={5.0} intensity={5.5} />
    <rectAreaLight position={[0, -3.0, 3.4]} width={4.5} height={1.2} intensity={2.8} />
    <spotLight position={[3.2, 4.8, 5.5]} intensity={8.5} angle={0.28} penumbra={0.98} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.00002} />
    <spotLight position={[-3.0, 3.0, 4.5]} intensity={5.5} angle={0.34} penumbra={1} />

    <Environment preset="studio" environmentIntensity={1.05} />
    <RealWatch progress={progress} />
    <ContactShadows position={[0, -1.05, 0]} opacity={0.32} scale={4.8} blur={2.6} far={4.2} resolution={768} />
    <CinematicPostFX />
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
      end: '+=6000',
      pin: true,
      scrub: 1.1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        if (self.progress < 0.2) setActiveLabel('THE ICON');
        else if (self.progress < 0.42) setActiveLabel('PRECISION CASE');
        else if (self.progress < 0.68) setActiveLabel('MECHANICAL CORE');
        else if (self.progress < 0.88) setActiveLabel('COMPONENTS');
        else setActiveLabel('FINAL ASSEMBLY');
      },
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('resize', refresh);
    window.addEventListener('orientationchange', refresh);
    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('orientationchange', refresh);
      trigger.kill();
    };
  }, []);

  return <section ref={section} className={styles.watchSection}>
    <div className={styles.canvasWrap}>
      <Canvas dpr={[1, 1.75]} shadows gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}>
        <color attach="background" args={['#010101']} />
        <Scene progress={progress} />
      </Canvas>
    </div>
    <div className={styles.copy}>
      <p className={styles.eyebrow}>HOROLOGICAL OBJECT 01</p>
      <h1>TIME<br />ENGINEERED.</h1>
      <p className={styles.description}>A cinematic mechanical chronograph rendered like a luxury product campaign — controlled camera motion, physically based materials and a precision exploded movement.</p>
      <div className={styles.progress}><span style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} /></div>
    </div>
    <div className={`${styles.labels} ${progress > 0.28 ? styles.visible : ''}`}>
      <span>{activeLabel}</span>
      <span>PHOTOREAL PBR</span>
      <span>STUDIO HDR LIGHTING</span>
      <span>CINEMATIC POST FX</span>
    </div>
    <div className={styles.scrollHint}>SCROLL TO DISASSEMBLE ↓</div>
    <div className={styles.cta}><button type="button">DISCOVER THE MOVEMENT <span>→</span></button></div>
    <div className={styles.grain} />
  </section>;
}
