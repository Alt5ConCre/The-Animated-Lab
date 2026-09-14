'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

const parts = [
  { id: 'case', label: '904L STEEL CASE', pos: [0, 0, 0], scale: [1, 1, 0.28], color: '#171717', metalness: 0.95, roughness: 0.16 },
  { id: 'bezel', label: 'POLISHED BEZEL', pos: [0, 0, 0.34], scale: [0.86, 0.86, 0.08], color: '#d4af37', metalness: 1, roughness: 0.1 },
  { id: 'dial', label: 'SUNBURST DIAL', pos: [0, 0, 0.46], scale: [0.72, 0.72, 0.045], color: '#151515', metalness: 0.35, roughness: 0.24 },
  { id: 'crystal', label: 'SAPPHIRE CRYSTAL', pos: [0, 0, 0.57], scale: [0.76, 0.76, 0.025], color: '#b7d6e8', metalness: 0.05, roughness: 0.04, transparent: true },
  { id: 'movement', label: 'AUTOMATIC CALIBRE', pos: [0, 0, -0.4], scale: [0.58, 0.58, 0.08], color: '#c8a951', metalness: 0.95, roughness: 0.18 },
  { id: 'crown', label: 'PRECISION CROWN', pos: [0.98, 0, 0.04], scale: [0.16, 0.16, 0.16], color: '#b9922e', metalness: 1, roughness: 0.13 },
];

function WatchPart({ part, progress }) {
  const ref = useRef();
  const [x, y, z] = part.pos;
  useFrame(() => {
    if (!ref.current) return;
    const explode = THREE.MathUtils.smoothstep(progress, 0.34, 0.62);
    const reassemble = THREE.MathUtils.smoothstep(progress, 0.72, 0.94);
    const spread = explode * (1 - reassemble);
    const factor = part.id === 'movement' ? 2.2 : part.id === 'crown' ? 2.8 : 1.45;
    ref.current.position.x = x + Math.sin(progress * 7 + factor) * 0.06 + (part.id === 'crown' ? spread * 0.7 : 0);
    ref.current.position.y = y + (part.id === 'bezel' ? spread * 0.85 : part.id === 'dial' ? spread * 0.45 : part.id === 'crystal' ? spread * 1.1 : part.id === 'movement' ? -spread * 0.9 : 0);
    ref.current.position.z = z + spread * factor;
    ref.current.rotation.x = Math.PI / 2 + progress * 0.55 + spread * factor * 0.5;
    ref.current.rotation.y = progress * 1.8 + spread * factor;
    ref.current.rotation.z = Math.sin(progress * 4) * 0.06;
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <cylinderGeometry args={[part.scale[0], part.scale[1], part.scale[2], 64]} />
      <meshPhysicalMaterial color={part.color} metalness={part.metalness} roughness={part.roughness} transmission={part.transparent ? 0.75 : 0} thickness={0.2} transparent={part.transparent} opacity={part.transparent ? 0.28 : 1} clearcoat={0.7} clearcoatRoughness={0.08} />
    </mesh>
  );
}

function WatchHands({ progress }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const explode = THREE.MathUtils.smoothstep(progress, 0.34, 0.62);
    group.current.position.z = 0.52 + explode * 0.9;
    group.current.rotation.z = progress * 5;
  });
  return (
    <group ref={group}>
      <mesh position={[0.02, 0.22, 0]} castShadow><boxGeometry args={[0.035, 0.38, 0.018]} /><meshStandardMaterial color="#f5f1df" metalness={0.9} roughness={0.2} /></mesh>
      <mesh position={[0.28, -0.02, 0.01]} rotation={[0, 0, -1.0]} castShadow><boxGeometry args={[0.03, 0.52, 0.018]} /><meshStandardMaterial color="#f5f1df" metalness={0.9} roughness={0.2} /></mesh>
      <mesh position={[-0.24, 0.02, 0.02]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.018, 0.36, 0.014]} /><meshStandardMaterial color="#d4af37" metalness={1} roughness={0.12} /></mesh>
    </group>
  );
}

function WatchScene({ progress }) {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.x = -0.14 + progress * 0.34;
    group.current.rotation.y = progress * Math.PI * 1.65;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.035;
    const camera = state.camera;
    camera.position.z = THREE.MathUtils.lerp(4.7, 2.8, THREE.MathUtils.smoothstep(progress, 0.1, 0.45));
    camera.position.y = THREE.MathUtils.lerp(0.1, 0.35, progress);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.1, 4.7]} fov={38} />
      <ambientLight intensity={0.22} />
      <spotLight position={[3, 4, 5]} intensity={9} angle={0.34} penumbra={0.8} castShadow />
      <spotLight position={[-4, 1, 2]} intensity={5} angle={0.45} penumbra={1} />
      <pointLight position={[0, -2, 2]} intensity={3} color="#d4af37" />
      <Environment preset="studio" environmentIntensity={0.65} />
      <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.16}>
        <group ref={group}>{parts.map((part) => <WatchPart key={part.id} part={part} progress={progress} />)}<WatchHands progress={progress} /></group>
      </Float>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={5} blur={2.5} far={4} />
    </>
  );
}

export default function ExplodingWatch() {
  const section = useRef();
  const [progress, setProgress] = useState(0);
  const [activeLabel, setActiveLabel] = useState('THE ICON');

  useEffect(() => {
    const trigger = ScrollTrigger.create({ trigger: section.current, start: 'top top', end: '+=4200', pin: true, scrub: 1.1, onUpdate: (self) => { setProgress(self.progress); setActiveLabel(self.progress < 0.3 ? 'THE ICON' : self.progress < 0.58 ? 'THE MECHANISM' : self.progress < 0.82 ? 'ENGINEERED IN DETAIL' : 'TIME, REASSEMBLED'); } });
    return () => trigger.kill();
  }, []);

  const exploded = progress > 0.34 && progress < 0.82;
  return (
    <section ref={section} className={styles.watchSection}>
      <div className={styles.grain} />
      <div className={styles.copy}><p className={styles.eyebrow}>THE ANIMATED LAB / HOROLOGY</p><h1>{activeLabel}</h1><p className={styles.description}>A mechanical study in precision. Scroll to enter the case, separate every layer, and watch the architecture of time come alive.</p><div className={styles.progress}><span style={{ transform: `scaleX(${progress})` }} /></div></div>
      <div className={styles.canvasWrap}><Canvas dpr={[1, 1.75]} shadows gl={{ antialias: true, alpha: true }}><WatchScene progress={progress} /></Canvas></div>
      <div className={`${styles.labels} ${exploded ? styles.visible : ''}`}><span>904L STEEL</span><span>SAPPHIRE</span><span>AUTOMATIC CALIBRE</span></div>
      <div className={styles.scrollHint}>{progress < 0.06 ? 'SCROLL TO DISCOVER' : `${Math.round(progress * 100)}%`}</div>
      <div className={styles.cta}><button>DISCOVER THE MOVEMENT <span>↗</span></button></div>
    </section>
  );
}
