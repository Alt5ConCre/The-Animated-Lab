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
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.12, 0.28, 1.2);
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

  useFrame((_, delta) => composerRef.current?.render(delta), 1);
  return null;
}

function RealWatch({ progress }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const root = useRef();
  const mixerRef = useRef();

  const parts = useMemo(() => {
    scene.updateMatrixWorld(true);
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
      const centerWorld = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const relative = centerWorld.clone().sub(modelCenter);

      // Watches read best as a precision exploded stack: thickness/depth is the main
      // separation axis, while X/Y only receive a tiny authored offset for readability.
      const axialSign = relative.z >= 0 ? 1 : -1;
      const depthRatio = THREE.MathUtils.clamp(Math.abs(relative.z) / maxDimension, 0, 1);
      const radial = relative.clone().normalize();
      const worldDirection = new THREE.Vector3(
        radial.x * 0.16,
        radial.y * 0.16,
        axialSign * (0.86 + depthRatio * 0.2),
      ).normalize();

      // IMPORTANT: meshes in a GLB can have nested parents. Convert the world-space
      // explosion direction back into the mesh parent's local coordinate system.
      const parent = node.parent;
      let localDirection = worldDirection.clone();
      if (parent) {
        const origin = parent.worldToLocal(centerWorld.clone());
        const point = parent.worldToLocal(centerWorld.clone().add(worldDirection));
        localDirection = point.sub(origin).normalize();
      }

      list.push({
        node,
        original: node.position.clone(),
        localDirection,
        size,
        depthRatio,
        phase: list.length * 1.618,
      });
    });

    // Sort by physical depth so the explosion reads as a deliberate mechanical stack.
    list.sort((a, b) => a.depthRatio - b.depthRatio);
    return list;
  }, [scene]);

  useEffect(() => {
    scene.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (!mat) return;
        mat.envMapIntensity = Math.max(mat.envMapIntensity || 1, 1.8);
        if ('roughness' in mat) mat.roughness = THREE.MathUtils.clamp(mat.roughness * 0.88, 0.18, 0.52);
        if ('metalness' in mat && mat.metalness > 0.2) mat.metalness = Math.min(1, mat.metalness + 0.04);
        if ('clearcoat' in mat) mat.clearcoat = Math.max(mat.clearcoat, 0.42);
        if ('clearcoatRoughness' in mat) mat.clearcoatRoughness = Math.min(mat.clearcoatRoughness || 0.2, 0.22);
        if ('ior' in mat) mat.ior = 1.5;
        if ('reflectivity' in mat) mat.reflectivity = 0.62;
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

    // One deterministic scroll timeline: hero -> inspection -> axial explosion -> hold -> assembly.
    const intro = THREE.MathUtils.smoothstep(progress, 0.0, 0.2);
    const inspection = THREE.MathUtils.smoothstep(progress, 0.18, 0.38);
    const explode = THREE.MathUtils.smoothstep(progress, 0.36, 0.64);
    const explodedHold = THREE.MathUtils.smoothstep(progress, 0.60, 0.72);
    const assembly = THREE.MathUtils.smoothstep(progress, 0.74, 0.96);
    const spread = explode * (1 - assembly);

    // Subtle hero rotation only. Scroll should control the story, not spin the product wildly.
    const idle = Math.sin(state.clock.elapsedTime * 0.14) * 0.006;
    root.current.rotation.x = THREE.MathUtils.lerp(-0.045, 0.035, intro) + idle;
    root.current.rotation.y = THREE.MathUtils.lerp(-0.16, 0.16, inspection) + Math.sin(state.clock.elapsedTime * 0.2) * 0.012;
    root.current.rotation.z = THREE.MathUtils.lerp(0.008, -0.008, progress);
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.005;

    // Controlled product-camera dolly. During the exploded hold we move to a subtle 3/4 view
    // so the separated layers are legible without making the watch feel like a spinning toy.
    const cameraProgress = THREE.MathUtils.smoothstep(progress, 0.03, 0.7);
    const orbit = THREE.MathUtils.smoothstep(progress, 0.52, 0.72);
    state.camera.position.x = THREE.MathUtils.lerp(0.0, 0.34, cameraProgress) + Math.sin(orbit * Math.PI) * 0.16;
    state.camera.position.y = THREE.MathUtils.lerp(0.015, 0.16, cameraProgress);
    state.camera.position.z = THREE.MathUtils.lerp(7.35, 5.95, cameraProgress);
    state.camera.fov = THREE.MathUtils.lerp(46, 40, cameraProgress);
    state.camera.lookAt(0, 0.02, 0);
    state.camera.updateProjectionMatrix();

    parts.forEach(({ node, original, localDirection, size, depthRatio, phase }) => {
      // Uneven axial spacing gives the same visual hierarchy as a real watch teardown:
      // crystal/bezel first, dial/case next, movement deeper, rear components last.
      const layerSpacing = 0.34 + depthRatio * 1.05;
      const depthReveal = 0.9 + depthRatio * 0.65;
      const target = original.clone().add(localDirection.clone().multiplyScalar(spread * layerSpacing * depthReveal));

      // Tiny lateral drift prevents coplanar parts from visually merging, but the dominant
      // movement remains along the watch's mechanical thickness axis.
      target.x += spread * Math.sin(phase) * 0.035;
      target.y += spread * Math.cos(phase * 0.7) * 0.035;
      node.position.lerp(target, 0.13);

      // Almost imperceptible component tilt — no random particle-like tumbling.
      const micro = THREE.MathUtils.clamp(size.length() * 0.06, 0.008, 0.045);
      node.rotation.x += spread * Math.sin(phase) * micro * 0.012;
      node.rotation.z += spread * Math.cos(phase) * micro * 0.012;
    });

    root.current.scale.setScalar(1.58 + Math.sin(state.clock.elapsedTime * 0.65) * 0.002 * explodedHold);
  });

  return <primitive ref={root} object={scene} scale={1.58} />;
}

useGLTF.preload(MODEL_URL);

function Scene({ progress }) {
  return <>
    <PerspectiveCamera makeDefault position={[0, 0.015, 7.35]} fov={46} near={0.1} far={100} />
    <ambientLight intensity={0.04} />

    <rectAreaLight position={[0, 5.2, 4.5]} width={6.5} height={2.4} intensity={8.0} />
    <rectAreaLight position={[4.6, 1.2, 3.1]} rotation={[0, 0.95, 0]} width={2.0} height={5.2} intensity={6.0} />
    <rectAreaLight position={[-4.6, 1.0, 2.8]} rotation={[0, -0.95, 0]} width={2.0} height={5.0} intensity={5.0} />
    <rectAreaLight position={[0, -3.0, 3.4]} width={4.5} height={1.2} intensity={2.6} />
    <spotLight position={[3.2, 4.8, 5.5]} intensity={8.0} angle={0.28} penumbra={0.98} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.00002} />
    <spotLight position={[-3.0, 3.0, 4.5]} intensity={5.0} angle={0.34} penumbra={1} />

    <Environment preset="studio" environmentIntensity={1.0} />
    <RealWatch progress={progress} />
    <ContactShadows position={[0, -1.05, 0]} opacity={0.3} scale={4.8} blur={2.6} far={4.2} resolution={768} />
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
      end: '+=6200',
      pin: true,
      scrub: 1.15,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        if (self.progress < 0.18) setActiveLabel('THE ICON');
        else if (self.progress < 0.36) setActiveLabel('PRECISION CASE');
        else if (self.progress < 0.60) setActiveLabel('MECHANICAL CORE');
        else if (self.progress < 0.78) setActiveLabel('EXPLODED ASSEMBLY');
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
    <div className={`${styles.labels} ${progress > 0.25 ? styles.visible : ''}`}>
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
