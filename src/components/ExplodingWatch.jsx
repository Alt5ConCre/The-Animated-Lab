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
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.11, 0.28, 1.15));
    composer.addPass(new OutputPass());
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    composer.setSize(size.width, size.height);
    composerRef.current = composer;
    return () => {
      composer.dispose();
      composerRef.current = undefined;
    };
  }, [gl, scene, camera]);

  useEffect(() => composerRef.current?.setSize(size.width, size.height), [size]);
  useFrame((_, delta) => composerRef.current?.render(delta), 1);
  return null;
}

const smooth = (value, start, end) => THREE.MathUtils.smoothstep(value, start, end);
const ease = (value) => THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(value, 0, 1), 0, 1);

function RealWatch({ progress }) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const root = useRef();
  const mixerRef = useRef();
  const animationDuration = useRef(0);

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
      const axialSign = relative.z >= 0 ? 1 : -1;
      const depthRatio = THREE.MathUtils.clamp(Math.abs(relative.z) / maxDimension, 0, 1);
      const radial = relative.clone().normalize();
      const worldDirection = new THREE.Vector3(radial.x * 0.13, radial.y * 0.13, axialSign * (0.9 + depthRatio * 0.16)).normalize();

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
        originalRotation: node.rotation.clone(),
        localDirection,
        size,
        depthRatio,
        phase: list.length * 1.618,
      });
    });

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
        if ('roughness' in mat) mat.roughness = THREE.MathUtils.clamp(mat.roughness * 0.88, 0.17, 0.5);
        if ('metalness' in mat && mat.metalness > 0.2) mat.metalness = Math.min(1, mat.metalness + 0.04);
        if ('clearcoat' in mat) mat.clearcoat = Math.max(mat.clearcoat, 0.42);
        if ('clearcoatRoughness' in mat) mat.clearcoatRoughness = Math.min(mat.clearcoatRoughness || 0.2, 0.2);
        if ('ior' in mat) mat.ior = 1.5;
        if ('reflectivity' in mat) mat.reflectivity = 0.64;
        mat.needsUpdate = true;
      });
    });
  }, [scene]);

  useEffect(() => {
    if (!animations?.length) return;
    mixerRef.current = new THREE.AnimationMixer(scene);
    animations.forEach((clip) => mixerRef.current.clipAction(clip).play());
    animationDuration.current = Math.max(...animations.map((clip) => clip.duration), 0);
    return () => mixerRef.current?.stopAllAction();
  }, [scene, animations]);

  useFrame((state) => {
    // The GLB animation itself is now SCRUBBED by scroll, like a video frame.
    // This keeps hands/rotors/animated mechanical details synchronized with the master timeline.
    if (mixerRef.current && animationDuration.current > 0) {
      mixerRef.current.setTime(progress * animationDuration.current);
    }

    const heroIn = ease(smooth(progress, 0.0, 0.13));
    const heroRotate = ease(smooth(progress, 0.04, 0.28));
    const macro = ease(smooth(progress, 0.18, 0.38));
    const opening = ease(smooth(progress, 0.34, 0.52));
    const explode = ease(smooth(progress, 0.43, 0.67));
    const explodedTravel = ease(smooth(progress, 0.55, 0.76));
    const reassemble = ease(smooth(progress, 0.72, 0.93));
    const finale = ease(smooth(progress, 0.91, 1.0));

    // One continuous product-film camera path: enter -> orbit -> macro -> reveal -> pull out -> hero.
    const cameraPath = THREE.MathUtils.lerp(heroIn, 1, macro);
    const orbitAngle = heroRotate * Math.PI * 0.34 + macro * Math.PI * 0.18 + explodedTravel * Math.PI * 0.22;
    const orbitRadius = THREE.MathUtils.lerp(0.0, 0.62, macro) + THREE.MathUtils.lerp(0, 0.22, explodedTravel);
    const targetX = Math.sin(orbitAngle) * orbitRadius;
    const targetY = 0.02 + Math.sin(macro * Math.PI) * 0.22 + explodedTravel * 0.08;
    const targetZ = THREE.MathUtils.lerp(7.55, 5.35, cameraPath) + Math.sin(explodedTravel * Math.PI) * 0.28;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.12);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.12);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.12);
    state.camera.fov = THREE.MathUtils.lerp(48, 37, macro) + reassemble * 4;
    state.camera.lookAt(
      Math.sin(explodedTravel * Math.PI) * 0.12,
      0.02 + explodedTravel * 0.06,
      0,
    );
    state.camera.updateProjectionMatrix();

    // The watch itself follows a designed hero-film rotation, not an idle spinner.
    root.current.rotation.x = THREE.MathUtils.lerp(-0.09, 0.045, macro) + opening * 0.06;
    root.current.rotation.y = -0.22 + heroRotate * 0.7 + macro * 0.52 - reassemble * 0.32;
    root.current.rotation.z = THREE.MathUtils.lerp(0.035, -0.025, progress);
    root.current.position.x = THREE.MathUtils.lerp(-0.12, 0.0, heroIn) + Math.sin(orbitAngle) * 0.06 * macro;
    root.current.position.y = Math.sin(progress * Math.PI) * 0.035;
    root.current.scale.setScalar(1.52 + macro * 0.13 - explodedTravel * 0.04);

    // Synchronized mechanical teardown. The separation is primarily axial, like a real watch.
    const spread = explode * (1 - reassemble);
    parts.forEach(({ node, original, originalRotation, localDirection, size, depthRatio, phase }) => {
      const layer = 0.42 + depthRatio * 1.35;
      const depth = 0.92 + depthRatio * 0.7;
      const reveal = spread * layer * depth;
      const target = original.clone().add(localDirection.clone().multiplyScalar(reveal));

      // Camera movement and component movement peak together during the teardown.
      target.x += spread * Math.sin(phase) * 0.045;
      target.y += spread * Math.cos(phase * 0.7) * 0.045;
      node.position.lerp(target, 0.18);

      const tilt = spread * THREE.MathUtils.clamp(size.length() * 0.045, 0.006, 0.035);
      node.rotation.x = originalRotation.x + Math.sin(phase) * tilt;
      node.rotation.z = originalRotation.z + Math.cos(phase * 0.8) * tilt;
      node.rotation.y = originalRotation.y + Math.sin(phase * 0.55) * tilt * 0.6;
    });
  });

  return <primitive ref={root} object={scene} />;
}

useGLTF.preload(MODEL_URL);

function Scene({ progress }) {
  const keyLight = useRef();
  const rimLight = useRef();
  const fillLight = useRef();

  useFrame(() => {
    const p = progress;
    const explode = smooth(p, 0.43, 0.67);
    const finale = smooth(p, 0.9, 1);
    if (keyLight.current) {
      keyLight.current.position.x = THREE.MathUtils.lerp(-1.8, 3.6, p);
      keyLight.current.position.z = THREE.MathUtils.lerp(5.5, 3.2, explode);
      keyLight.current.intensity = THREE.MathUtils.lerp(7.5, 11, explode);
    }
    if (rimLight.current) {
      rimLight.current.position.x = THREE.MathUtils.lerp(4.8, -4.2, p);
      rimLight.current.position.y = 2.4 + Math.sin(p * Math.PI) * 2.0;
      rimLight.current.intensity = THREE.MathUtils.lerp(4.5, 8, explode);
    }
    if (fillLight.current) {
      fillLight.current.intensity = THREE.MathUtils.lerp(1.8, 3.8, explode) + finale * 1.5;
    }
  });

  return <>
    <PerspectiveCamera makeDefault position={[0, 0.02, 7.55]} fov={48} near={0.1} far={100} />
    <ambientLight intensity={0.035} />

    <rectAreaLight ref={keyLight} position={[-1.8, 5.2, 5.5]} width={7} height={2.5} intensity={7.5} />
    <rectAreaLight ref={rimLight} position={[4.8, 2.4, 3.5]} rotation={[0, 0.95, 0]} width={2.2} height={5.5} intensity={4.5} />
    <rectAreaLight ref={fillLight} position={[-4.4, 0.7, 3.5]} rotation={[0, -0.95, 0]} width={2.2} height={5.0} intensity={2.0} />
    <rectAreaLight position={[0, -3.0, 3.8]} width={5.0} height={1.4} intensity={2.4} />
    <spotLight position={[3.2, 4.8, 5.5]} intensity={7.5} angle={0.28} penumbra={0.98} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.00002} />

    <Environment preset="studio" environmentIntensity={1.0} />
    <RealWatch progress={progress} />
    <ContactShadows position={[0, -1.05, 0]} opacity={0.28} scale={5} blur={2.5} far={4.5} resolution={768} />
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
      end: '+=7600',
      pin: true,
      scrub: 0.35,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(self.progress);
        if (self.progress < 0.16) setActiveLabel('THE ICON');
        else if (self.progress < 0.34) setActiveLabel('MACRO INSPECTION');
        else if (self.progress < 0.54) setActiveLabel('CASE OPENING');
        else if (self.progress < 0.76) setActiveLabel('EXPLODED MOVEMENT');
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
      <p className={styles.description}>Scroll through a cinematic mechanical chronograph film — camera, watch, movement and lighting are all synchronized to the same continuous timeline.</p>
      <div className={styles.progress}><span style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} /></div>
    </div>

    <div className={`${styles.labels} ${progress > 0.2 ? styles.visible : ''}`}>
      <span>{activeLabel}</span>
      <span>SCROLL-SCRUBBED MOTION</span>
      <span>PHOTOREAL PBR</span>
      <span>CINEMATIC CAMERA</span>
    </div>

    <div className={styles.scrollHint}>SCROLL TO PLAY THE FILM ↓</div>
    <div className={styles.cta}><button type="button">DISCOVER THE MOVEMENT <span>→</span></button></div>
    <div className={styles.grain} />
  </section>;
}
