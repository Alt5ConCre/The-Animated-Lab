'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './CinematicCar.module.css';

gsap.registerPlugin(ScrollTrigger);

const BODY = '#101216';
const CARBON = '#08090b';
const METAL = '#b9bec4';
const RED = '#9e1721';

function Wheel({ position, exploded }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.x -= d * 0.28; });
  return (
    <group ref={ref} position={[position[0] * (1 + exploded * .35), position[1], position[2]]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.72, .72, .34, 64]} /><meshPhysicalMaterial color={CARBON} metalness={.95} roughness={.22} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .2]}><torusGeometry args={[.53, .105, 18, 64]} /><meshPhysicalMaterial color={METAL} metalness={1} roughness={.14} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .27]}><torusGeometry args={[.34, .055, 14, 48]} /><meshPhysicalMaterial color={RED} metalness={.72} roughness={.2} /></mesh>
      {Array.from({ length: 10 }).map((_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 5) * .31, Math.sin(i * Math.PI / 5) * .31, .3]} rotation={[0, 0, i * Math.PI / 5]}><boxGeometry args={[.035, .47, .035]} /><meshPhysicalMaterial color={METAL} metalness={1} roughness={.16} /></mesh>)}
    </group>
  );
}

function Car({ progress }) {
  const root = useRef();
  const body = useRef();
  const glass = useRef();
  const cabin = useRef();
  const front = useRef();
  const rear = useRef();
  const wheels = useRef();
  const interior = useRef();
  const p = progress;
  const intro = THREE.MathUtils.smoothstep(p, 0, .12);
  const orbit = THREE.MathUtils.smoothstep(p, .08, .36);
  const macro = THREE.MathUtils.smoothstep(p, .25, .43);
  const explode = THREE.MathUtils.smoothstep(p, .43, .67);
  const reassemble = THREE.MathUtils.smoothstep(p, .73, .93);
  const final = THREE.MathUtils.smoothstep(p, .91, 1);
  const e = explode * (1 - reassemble);

  useFrame((state) => {
    root.current.position.y = THREE.MathUtils.lerp(-.55, 0, intro);
    root.current.rotation.y = -.55 + orbit * Math.PI * 1.28 + final * .18;
    root.current.rotation.x = -.035 + macro * .08;
    root.current.scale.setScalar(1.32 + macro * .08 - e * .04);

    body.current.position.z = -e * .72;
    cabin.current.position.z = e * .7;
    cabin.current.position.y = e * .18;
    glass.current.position.z = e * .82;
    front.current.position.z = e * 1.25;
    rear.current.position.z = -e * 1.2;
    interior.current.position.z = e * .1;
    wheels.current.position.z = e * .2;

    const theta = orbit * Math.PI * .58;
    state.camera.position.x = Math.sin(theta) * (1.4 + macro * 2.8);
    state.camera.position.y = .72 + Math.sin(theta * 1.4) * .55 + e * .35;
    state.camera.position.z = THREE.MathUtils.lerp(9.4, 4.2, macro);
    if (p > .75) state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 8.4, THREE.MathUtils.smoothstep(p, .75, 1));
    state.camera.fov = THREE.MathUtils.lerp(48, 29, macro) + final * 5;
    state.camera.lookAt(0, .1, 0);
    state.camera.updateProjectionMatrix();
  });

  return <group ref={root}>
    <group ref={wheels}>
      <Wheel position={[-2.15, -.52, .72]} exploded={e} />
      <Wheel position={[2.15, -.52, .72]} exploded={e} />
      <Wheel position={[-2.15, -.52, -.72]} exploded={e} />
      <Wheel position={[2.15, -.52, -.72]} exploded={e} />
    </group>

    <group ref={body}>
      <mesh position={[0, -.05, 0]} castShadow receiveShadow><boxGeometry args={[5.15, .75, 1.82]} /><meshPhysicalMaterial color={BODY} metalness={.92} roughness={.17} clearcoat={1} clearcoatRoughness={.055} /></mesh>
      <mesh position={[.72, .25, 0]} rotation={[0, 0, -.025]} castShadow><boxGeometry args={[3.25, .62, 1.58]} /><meshPhysicalMaterial color="#16191d" metalness={.88} roughness={.19} clearcoat={1} /></mesh>
      <mesh position={[-1.98, .1, 0]}><boxGeometry args={[.78, .43, 1.84]} /><meshPhysicalMaterial color={CARBON} metalness={.95} roughness={.15} /></mesh>
      <mesh position={[2.35, .05, 0]}><boxGeometry args={[.4, .4, 1.86]} /><meshPhysicalMaterial color={CARBON} metalness={.95} roughness={.15} /></mesh>
      <mesh position={[0, -.47, 0]}><boxGeometry args={[4.7, .14, 1.62]} /><meshPhysicalMaterial color={CARBON} metalness={.97} roughness={.12} /></mesh>
    </group>

    <group ref={cabin}>
      <mesh position={[.45, .85, 0]} rotation={[0, 0, -.045]} castShadow><boxGeometry args={[2.65, 1.05, 1.4]} /><meshPhysicalMaterial color="#11151a" metalness={.35} roughness={.1} clearcoat={.7} /></mesh>
      <mesh position={[.92, .85, 0]} rotation={[0, 0, -.08]}><boxGeometry args={[1.35, .92, 1.46]} /><meshPhysicalMaterial color="#070a0e" metalness={.15} roughness={.04} transmission={.12} transparent opacity={.76} /></mesh>
      <mesh position={[-.48, .86, 0]} rotation={[0, 0, -.05]}><boxGeometry args={[.92, .9, 1.45]} /><meshPhysicalMaterial color="#070a0e" metalness={.15} roughness={.04} transmission={.12} transparent opacity={.7} /></mesh>
      <mesh position={[.2, .42, 0]}><boxGeometry args={[2.55, .08, 1.47]} /><meshPhysicalMaterial color={CARBON} metalness={.96} roughness={.13} /></mesh>
    </group>

    <group ref={glass}>
      <mesh position={[.5, .92, .75]} rotation={[0, .05, -.05]}><planeGeometry args={[1.95, .72]} /><meshPhysicalMaterial color="#090d12" transparent opacity={.72} metalness={.45} roughness={.08} /></mesh>
      <mesh position={[.5, .92, -.75]} rotation={[0, -.05, -.05]}><planeGeometry args={[1.95, .72]} /><meshPhysicalMaterial color="#090d12" transparent opacity={.72} metalness={.45} roughness={.08} /></mesh>
    </group>

    <group ref={front}>
      <mesh position={[2.63, .12, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[.7, .32, 1.55]} /><meshPhysicalMaterial color="#050608" metalness={.8} roughness={.18} /></mesh>
      <mesh position={[2.99, .22, .52]}><boxGeometry args={[.035, .13, .48]} /><meshPhysicalMaterial color="#e8eef5" emissive="#dcecff" emissiveIntensity={7} /></mesh>
      <mesh position={[2.99, .22, -.52]}><boxGeometry args={[.035, .13, .48]} /><meshPhysicalMaterial color="#e8eef5" emissive="#dcecff" emissiveIntensity={7} /></mesh>
      <mesh position={[3.01, -.02, 0]}><boxGeometry args={[.03, .13, 1.18]} /><meshPhysicalMaterial color="#9aa1aa" metalness={1} roughness={.16} /></mesh>
    </group>

    <group ref={rear}>
      <mesh position={[-2.65, .08, 0]}><boxGeometry args={[.08, .26, 1.55]} /><meshPhysicalMaterial color={RED} emissive={RED} emissiveIntensity={2.4} /></mesh>
      <mesh position={[-2.7, -.02, 0]}><boxGeometry args={[.1, .12, 1.1]} /><meshPhysicalMaterial color="#050607" metalness={.9} roughness={.15} /></mesh>
    </group>

    <group ref={interior}>
      <mesh position={[.25, .54, .48]} rotation={[0, 0, -.02]}><boxGeometry args={[.72, .7, .1]} /><meshPhysicalMaterial color="#17191b" metalness={.35} roughness={.3} /></mesh>
      <mesh position={[.25, .54, -.48]} rotation={[0, 0, -.02]}><boxGeometry args={[.72, .7, .1]} /><meshPhysicalMaterial color="#17191b" metalness={.35} roughness={.3} /></mesh>
    </group>
  </group>;
}

function Scene({ progress }) {
  const key = useRef(); const rim = useRef(); const strip = useRef();
  useFrame(() => {
    const p = progress; const e = THREE.MathUtils.smoothstep(p, .4, .72);
    if (key.current) { key.current.position.x = THREE.MathUtils.lerp(-5, 5, p); key.current.position.z = THREE.MathUtils.lerp(6.5, 2.5, e); key.current.intensity = THREE.MathUtils.lerp(9, 17, e); }
    if (rim.current) { rim.current.position.x = THREE.MathUtils.lerp(5, -5, p); rim.current.intensity = THREE.MathUtils.lerp(6, 14, e); }
    if (strip.current) strip.current.position.x = THREE.MathUtils.lerp(-6, 6, p);
  });
  return <>
    <color attach="background" args={['#020305']} />
    <ambientLight intensity={.025} />
    <rectAreaLight ref={key} position={[-5, 5, 6.5]} width={8} height={2.4} intensity={9} />
    <rectAreaLight ref={rim} position={[5, 2.8, 4]} width={2.4} height={7} intensity={6} />
    <rectAreaLight ref={strip} position={[-6, -1.2, 3]} width={7} height={.5} intensity={5} />
    <spotLight position={[0, 7, 5]} intensity={11} angle={.34} penumbra={1} castShadow shadow-mapSize={[2048, 2048]} />
    <Environment preset="city" environmentIntensity={.7} />
    <Float speed={.35} rotationIntensity={.05} floatIntensity={.12}><Car progress={progress} /></Float>
    <ContactShadows position={[0, -1.12, 0]} opacity={.42} scale={9} blur={2.8} far={6} resolution={1024} />
  </>;
}

export default function CinematicCar() {
  const section = useRef();
  const [progress, setProgress] = useState(0);
  const [chapter, setChapter] = useState('THE MACHINE');
  useEffect(() => {
    const trigger = ScrollTrigger.create({ trigger: section.current, start: 'top top', end: '+=10500', pin: true, scrub: .25, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => { const p = self.progress; setProgress(p); setChapter(p < .13 ? 'THE MACHINE' : p < .3 ? 'FORM / LIGHT' : p < .45 ? 'DETAIL' : p < .7 ? 'ENGINEERED APART' : p < .9 ? 'REASSEMBLY' : 'FINAL DRIVE'); } });
    return () => trigger.kill();
  }, []);
  const dpr = useMemo(() => [1, Math.min(window.devicePixelRatio || 1, 2)], []);
  return <section ref={section} className={styles.section}>
    <div className={styles.canvas}><Canvas dpr={dpr} shadows gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, outputColorSpace: THREE.SRGBColorSpace, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}><Scene progress={progress} /></Canvas></div>
    <div className={styles.vignette} />
    <header className={styles.header}><span>AURION</span><span>X1 / PERFORMANCE OBJECT</span></header>
    <div className={styles.hero}><p>ROVIXE AUTOMOTIVE / 01</p><h1>THE ART<br /><em>OF MOTION.</em></h1><div className={styles.progress}><i style={{ transform: `scaleX(${Math.max(.01, progress)})` }} /></div></div>
    <div className={styles.chapter}><strong>{chapter}</strong><small>SCROLL TO DRIVE</small></div>
    <div className={styles.specs}><span>V12 / HYBRID</span><span>820 HP</span><span>2.9 SEC</span><span>340 KM/H</span></div>
    <div className={styles.footer}><span>CINEMATIC 3D</span><span>{String(Math.round(progress * 100)).padStart(2, '0')}%</span><span>SCROLL / SCRUB</span></div>
  </section>;
}
