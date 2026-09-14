'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

const gold = '#c9a45a';
const steel = '#9da3a6';
const darkSteel = '#202326';
const dial = '#0a1014';

function Metal({ color = steel, roughness = 0.18, metalness = 0.95, clearcoat = 0.7 }) {
  return <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={clearcoat} clearcoatRoughness={0.08} envMapIntensity={1.8} />;
}

function Gear({ radius, teeth, depth, color, progress, index }) {
  const ref = useRef();
  const tooth = useMemo(() => Array.from({ length: teeth }, (_, i) => i), [teeth]);
  useFrame(() => {
    if (!ref.current) return;
    const e = THREE.MathUtils.smoothstep(progress, 0.4, 0.64);
    const r = radius + e * (0.12 + index * 0.035);
    ref.current.position.z = -0.42 - e * (0.12 + index * 0.04);
    ref.current.rotation.z += 0.0018 * (index % 2 ? -1 : 1);
    ref.current.scale.setScalar(1 + e * 0.08);
    tooth.forEach((_, i) => {
      const child = ref.current.children[i];
      if (child) {
        const a = (i / teeth) * Math.PI * 2;
        child.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        child.rotation.z = a;
      }
    });
  });
  return (
    <group ref={ref} position={[index * 0.18 - 0.2, index % 2 ? -0.1 : 0.12, -0.42]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[radius * 0.45, radius * 0.45, depth, 48]} /><Metal color={color} roughness={0.22} /></mesh>
      {tooth.map((_, i) => <mesh key={i} position={[Math.cos((i / teeth) * Math.PI * 2) * radius, Math.sin((i / teeth) * Math.PI * 2) * radius, 0]} rotation={[0, 0, (i / teeth) * Math.PI * 2]}><boxGeometry args={[radius * 0.16, radius * 0.42, depth]} /><Metal color={color} roughness={0.2} /></mesh>)}
    </group>
  );
}

function Movement({ progress }) {
  const rotor = useRef();
  useFrame(() => {
    if (rotor.current) rotor.current.rotation.z += 0.008;
  });
  const exploded = THREE.MathUtils.smoothstep(progress, 0.4, 0.64);
  return (
    <group position={[0, 0, -0.34 - exploded * 0.5]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.66, 0.66, 0.11, 96]} /><Metal color="#b6a36c" roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.57, 0.57, 0.035, 96]} /><meshStandardMaterial color="#252a2d" metalness={0.8} roughness={0.22} /></mesh>
      <Gear radius={0.16} teeth={16} depth={0.035} color="#d8c18a" progress={progress} index={0} />
      <Gear radius={0.12} teeth={14} depth={0.032} color="#aeb4b5" progress={progress} index={1} />
      <Gear radius={0.1} teeth={12} depth={0.03} color="#d2b66e" progress={progress} index={2} />
      <mesh ref={rotor} position={[0.08, -0.03, 0.14]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.42, 0.045, 12, 64, Math.PI * 1.55]} /><Metal color="#8f9699" roughness={0.24} /></mesh>
      {[-0.38, 0.38, 0, 0].map((x, i) => <mesh key={i} position={[x, i < 2 ? 0 : i === 2 ? 0.38 : -0.38, 0.13]}><sphereGeometry args={[0.035, 20, 20]} /><meshPhysicalMaterial color="#f4f1e5" metalness={0.4} roughness={0.1} /></mesh>)}
    </group>
  );
}

function Watch({ progress }) {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    const intro = THREE.MathUtils.smoothstep(progress, 0, 0.3);
    const exploded = THREE.MathUtils.smoothstep(progress, 0.4, 0.64);
    const reassembled = THREE.MathUtils.smoothstep(progress, 0.76, 0.96);
    group.current.rotation.x = -0.12 + progress * 0.25;
    group.current.rotation.y = progress * Math.PI * 1.7;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.025;
    const camera = state.camera;
    camera.position.z = THREE.MathUtils.lerp(5.0, 3.0, intro);
    camera.position.y = THREE.MathUtils.lerp(0.12, 0.34, progress);
    camera.fov = THREE.MathUtils.lerp(42, 34, THREE.MathUtils.smoothstep(progress, 0.12, 0.42));
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    const spread = exploded * (1 - reassembled);
    group.current.scale.setScalar(1 + spread * 0.06);
  });

  const spread = THREE.MathUtils.smoothstep(progress, 0.4, 0.64) * (1 - THREE.MathUtils.smoothstep(progress, 0.76, 0.96));
  const caseOffset = spread * 0.16;
  const bezelOffset = spread * 0.45;
  const dialOffset = spread * 0.78;
  const crystalOffset = spread * 1.12;

  return (
    <group ref={group} rotation={[0, 0, 0]}>
      <group position={[0, 0, -caseOffset]}>
        <RoundedBox args={[2.12, 2.42, 0.34]} radius={0.34} smoothness={8} castShadow receiveShadow><Metal color={darkSteel} roughness={0.16} /></RoundedBox>
        <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.9, 0.9, 0.07, 96]} /><Metal color="#111417" roughness={0.25} /></mesh>
        <mesh position={[1.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.16, 0.16, 0.14, 48]} /><Metal color={gold} roughness={0.12} /></mesh>
      </group>

      <group position={[0, 0, 0.17 + bezelOffset]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.91, 0.105, 24, 128]} /><Metal color={gold} roughness={0.1} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.88, 0.88, 0.08, 128]} /><meshStandardMaterial color="#171b1e" metalness={0.72} roughness={0.18} /></mesh>
      </group>

      <group position={[0, 0, 0.25 + dialOffset]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.79, 0.79, 0.045, 128]} /><meshPhysicalMaterial color={dial} metalness={0.45} roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} /></mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.65, Math.sin(a) * 0.65, 0.045]} rotation={[0, 0, a]}><boxGeometry args={[0.035, i % 3 === 0 ? 0.16 : 0.1, 0.025]} /><meshPhysicalMaterial color={i % 3 === 0 ? '#e8e1d0' : gold} metalness={0.85} roughness={0.16} /></mesh>;
        })}
        <mesh position={[0, 0, 0.055]}><sphereGeometry args={[0.045, 24, 24]} /><meshPhysicalMaterial color="#eee9dc" metalness={0.85} roughness={0.12} /></mesh>
        <mesh position={[0, 0.16, 0.055]}><boxGeometry args={[0.035, 0.34, 0.018]} /><meshPhysicalMaterial color="#eee9dc" metalness={0.9} roughness={0.15} /></mesh>
        <mesh position={[0.22, 0, 0.056]} rotation={[0, 0, -0.95]}><boxGeometry args={[0.03, 0.5, 0.018]} /><meshPhysicalMaterial color="#eee9dc" metalness={0.9} roughness={0.15} /></mesh>
        <mesh position={[0, 0, 0.07]}><cylinderGeometry args={[0.69, 0.69, 0.012, 96]} /><meshPhysicalMaterial color="#a6d2e3" transmission={0.88} thickness={0.12} roughness={0.035} transparent opacity={0.2} /></mesh>
      </group>

      <group position={[0, 0, -0.15 - crystalOffset]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.91, 0.91, 0.055, 128]} /><meshPhysicalMaterial color="#cdeaf7" transmission={0.92} thickness={0.18} roughness={0.025} ior={1.52} transparent opacity={0.34} /></mesh>
      </group>

      <Movement progress={progress} />
    </group>
  );
}

function Scene({ progress }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.12, 5]} fov={42} />
      <ambientLight intensity={0.16} />
      <spotLight position={[3.5, 4.5, 5]} intensity={13} angle={0.3} penumbra={0.9} castShadow shadow-mapSize={[2048, 2048]} />
      <spotLight position={[-4, 2, 3]} intensity={9} angle={0.38} penumbra={1} />
      <spotLight position={[0, -3, 1]} intensity={6} angle={0.5} penumbra={1} />
      <pointLight position={[2, 0, 2]} intensity={4} color="#d8b86c" />
      <Environment preset="studio" environmentIntensity={1.15} />
      <Watch progress={progress} />
      <ContactShadows position={[0, -1.35, 0]} opacity={0.5} scale={5} blur={2.8} far={5} />
    </>
  );
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
      scrub: 1.05,
      onUpdate: (self) => {
        setProgress(self.progress);
        setActiveLabel(self.progress < 0.3 ? 'THE ICON' : self.progress < 0.58 ? 'THE MECHANISM' : self.progress < 0.82 ? 'ENGINEERED IN DETAIL' : 'TIME, REASSEMBLED');
      },
    });
    return () => trigger.kill();
  }, []);

  const exploded = progress > 0.4 && progress < 0.82;

  return (
    <section ref={section} className={styles.watchSection}>
      <div className={styles.grain} />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>THE ANIMATED LAB / HOROLOGY</p>
        <h1>{activeLabel}</h1>
        <p className={styles.description}>A cinematic mechanical study. Enter the case, reveal the architecture, then watch precision return to one complete timepiece.</p>
        <div className={styles.progress}><span style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
      <div className={styles.canvasWrap}><Canvas dpr={[1, 2]} shadows gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}><Scene progress={progress} /></Canvas></div>
      <div className={`${styles.labels} ${exploded ? styles.visible : ''}`}><span>POLISHED STEEL</span><span>SAPPHIRE CRYSTAL</span><span>AUTOMATIC CALIBRE</span><span>PRECISION CASE</span></div>
      <div className={styles.scrollHint}>{progress < 0.06 ? 'SCROLL TO DISCOVER' : `${Math.round(progress * 100)}%`}</div>
      <div className={styles.cta}><button>DISCOVER THE MOVEMENT <span>↗</span></button></div>
    </section>
  );
}
