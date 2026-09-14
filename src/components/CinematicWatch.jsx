'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import styles from './CinematicWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

const GOLD = '#d5b36a';
const STEEL = '#8b9197';
const DARK = '#090b0d';

function PostFX() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();
  useEffect(() => {
    const fx = new EffectComposer(gl);
    fx.addPass(new RenderPass(scene, camera));
    fx.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.11, 0.32, 1.18));
    fx.addPass(new OutputPass());
    fx.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.25));
    fx.setSize(size.width, size.height);
    composer.current = fx;
    return () => fx.dispose();
  }, [gl, scene, camera]);
  useEffect(() => composer.current?.setSize(size.width, size.height), [size]);
  useFrame((_, delta) => composer.current?.render(delta), 1);
  return null;
}

function Gear({ radius, teeth, speed, offset = [0, 0, 0] }) {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * speed; });
  return <group ref={ref} position={offset}>
    <mesh castShadow><cylinderGeometry args={[radius * .78, radius * .78, .055, 64]} /><meshStandardMaterial color="#3d4247" metalness={.98} roughness={.2} /></mesh>
    {Array.from({ length: teeth }).map((_, i) => { const a = i / teeth * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]} rotation={[0, 0, a]}><boxGeometry args={[radius * .18, radius * .34, .065]} /><meshStandardMaterial color="#767b80" metalness={1} roughness={.18} /></mesh>; })}
    <mesh position={[0, 0, .045]}><torusGeometry args={[radius * .2, .025, 12, 32]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={.13} /></mesh>
  </group>;
}

function MechanicalCore() {
  return <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[1.02, 1.02, .12, 96]} /><meshPhysicalMaterial color="#25292d" metalness={.96} roughness={.2} clearcoat={.5} /></mesh>
    <Gear radius={.34} teeth={16} speed={.75} />
    <Gear radius={.22} teeth={12} speed={-1.05} offset={[.5, .27, .11]} />
    <Gear radius={.25} teeth={14} speed={.8} offset={[-.47, -.22, .11]} />
    <Gear radius={.18} teeth={10} speed={-1.3} offset={[.15, -.48, .12]} />
    <mesh position={[.1, .05, .16]} rotation={[Math.PI / 2, 0, .12]}><torusGeometry args={[.57, .035, 16, 96]} /><meshStandardMaterial color="#a8adb1" metalness={1} roughness={.17} /></mesh>
    {[-.6, .6, -.45, .46].map((x, i) => <mesh key={i} position={[x, i < 2 ? .55 : -.55, .17]}><cylinderGeometry args={[.045, .045, .04, 24]} /><meshStandardMaterial color="#8d1c2c" metalness={.25} roughness={.13} /></mesh>)}
  </group>;
}

function Dial() {
  return <group position={[0, 0, .42]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.3, 1.3, .055, 96]} /><meshPhysicalMaterial color="#07090b" metalness={.55} roughness={.25} clearcoat={.55} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .04]}><torusGeometry args={[1.18, .025, 12, 96]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={.14} /></mesh>
    {Array.from({ length: 12 }).map((_, i) => { const a = i * Math.PI / 6; return <mesh key={i} position={[Math.sin(a) * .98, Math.cos(a) * .98, .07]} scale={i % 3 === 0 ? [.08, .18, .035] : [.045, .12, .035]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#e8e1d2" metalness={.86} roughness={.2} /></mesh>; })}
    <mesh position={[0, 0, .12]}><cylinderGeometry args={[.055, .055, .06, 32]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={.12} /></mesh>
  </group>;
}

function Bracelet() {
  return <group>{Array.from({ length: 17 }).map((_, i) => { const y = (i - 8) * .19; return <mesh key={i} position={[0, y * 1.1, -.08]} castShadow><boxGeometry args={[.82, .16, .15]} /><meshPhysicalMaterial color="#4c5156" metalness={.98} roughness={.18} clearcoat={.5} /></mesh>; })}</group>;
}

function Watch({ progress }) {
  const root = useRef();
  const crystal = useRef(); const bezel = useRef(); const dial = useRef(); const core = useRef(); const caseRef = useRef(); const bracelet = useRef(); const crown = useRef();
  useFrame((state) => {
    const p = progress;
    const intro = THREE.MathUtils.smoothstep(p, 0, .12);
    const orbit = THREE.MathUtils.smoothstep(p, .08, .38);
    const macro = THREE.MathUtils.smoothstep(p, .22, .42);
    const explode = THREE.MathUtils.smoothstep(p, .4, .66);
    const reassemble = THREE.MathUtils.smoothstep(p, .72, .94);
    const final = THREE.MathUtils.smoothstep(p, .91, 1);
    const spread = explode * (1 - reassemble);
    const e = spread * spread * (3 - 2 * spread);

    root.current.position.y = THREE.MathUtils.lerp(-.4, 0, intro);
    root.current.rotation.x = -.1 + macro * .14;
    root.current.rotation.y = -.35 + orbit * 2.0 + macro * .3 - reassemble * .35 + final * .35;
    root.current.rotation.z = .025 - p * .055;
    root.current.scale.setScalar(1.55 + macro * .12 - e * .08);

    crystal.current.position.z = THREE.MathUtils.lerp(.65, 1.28, e);
    crystal.current.rotation.y = e * .13;
    bezel.current.position.z = THREE.MathUtils.lerp(.48, .88, e);
    bezel.current.rotation.y = -e * .1;
    dial.current.position.z = THREE.MathUtils.lerp(.31, .68, e);
    dial.current.rotation.z = e * .04;
    core.current.position.z = THREE.MathUtils.lerp(-.02, -.42, e);
    core.current.rotation.y = -e * .09;
    caseRef.current.position.z = THREE.MathUtils.lerp(-.18, -.72, e);
    bracelet.current.position.z = THREE.MathUtils.lerp(-.08, -.95, e);
    bracelet.current.rotation.y = e * .1;
    crown.current.position.x = THREE.MathUtils.lerp(1.56, 2.02, e);
    crown.current.rotation.y = state.clock.elapsedTime * .22;

    const camOrbit = THREE.MathUtils.smoothstep(p, .15, .75);
    const theta = camOrbit * Math.PI * .68;
    state.camera.position.x = Math.sin(theta) * (.12 + macro * .72);
    state.camera.position.y = .05 + Math.sin(camOrbit * Math.PI) * .28 + e * .12;
    state.camera.position.z = THREE.MathUtils.lerp(8.8, 5.0, macro);
    if (p > .76) state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 7.1, THREE.MathUtils.smoothstep(p, .76, 1));
    state.camera.fov = THREE.MathUtils.lerp(49, 33, macro) + final * 7;
    state.camera.lookAt(0, .02, 0);
    state.camera.updateProjectionMatrix();
  });

  return <group ref={root}>
    <group ref={bracelet}><Bracelet /></group>
    <group ref={caseRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[1.56, 1.56, .46, 112]} /><meshPhysicalMaterial color={DARK} metalness={.98} roughness={.17} clearcoat={.82} clearcoatRoughness={.08} /></mesh>
      <mesh position={[1.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[.22, .22, .34, 40]} /><meshPhysicalMaterial color={STEEL} metalness={1} roughness={.13} /></mesh>
    </group>
    <group ref={core}><MechanicalCore /></group>
    <group ref={dial}><Dial /></group>
    <group ref={bezel}><mesh rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[1.42, .13, 24, 112]} /><meshPhysicalMaterial color={GOLD} metalness={1} roughness={.11} clearcoat={.9} clearcoatRoughness={.07} /></mesh></group>
    <group ref={crystal}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.39, 1.39, .08, 112]} /><meshPhysicalMaterial color="#dce9ef" transparent opacity={.18} transmission={.98} thickness={.18} roughness={.035} ior={1.52} /></mesh></group>
    <group ref={crown} position={[1.56, 0, 0]}><mesh rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[.18, .18, .32, 40]} /><meshPhysicalMaterial color={GOLD} metalness={1} roughness={.12} /></mesh>{Array.from({ length: 5 }).map((_, i) => <mesh key={i} position={[.16 + i * .035, 0, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[.18, .018, 8, 32]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={.14} /></mesh>)}</group>
  </group>;
}

function Scene({ progress }) {
  const key = useRef(); const rim = useRef(); const fill = useRef();
  useFrame(() => {
    const p = progress; const e = THREE.MathUtils.smoothstep(p, .4, .7);
    if (key.current) { key.current.position.x = THREE.MathUtils.lerp(-2.4, 3.8, p); key.current.position.z = THREE.MathUtils.lerp(5.8, 3.1, e); key.current.intensity = THREE.MathUtils.lerp(7.5, 12, e); }
    if (rim.current) { rim.current.position.x = THREE.MathUtils.lerp(4.8, -4.4, p); rim.current.position.y = 2.3 + Math.sin(p * Math.PI) * 2.1; rim.current.intensity = THREE.MathUtils.lerp(4.5, 9, e); }
    if (fill.current) fill.current.intensity = THREE.MathUtils.lerp(1.5, 4.2, e);
  });
  return <>
    <ambientLight intensity={.025} />
    <rectAreaLight ref={key} position={[-2.4, 5.2, 5.8]} width={7} height={2.4} intensity={7.5} />
    <rectAreaLight ref={rim} position={[4.8, 2.3, 3.4]} rotation={[0, .95, 0]} width={2.2} height={5.8} intensity={4.5} />
    <rectAreaLight ref={fill} position={[-4.5, .8, 3.5]} rotation={[0, -.95, 0]} width={2.4} height={5} intensity={1.5} />
    <rectAreaLight position={[0, -3.2, 4]} width={5.5} height={1.5} intensity={2.5} />
    <spotLight position={[3.2, 5, 5.5]} intensity={8} angle={.28} penumbra={.98} castShadow shadow-mapSize={[2048, 2048]} />
    <Environment preset="studio" environmentIntensity={1.05} />
    <Watch progress={progress} />
    <ContactShadows position={[0, -1.05, 0]} opacity={.3} scale={5.5} blur={2.3} far={4.5} resolution={1024} />
    <PostFX />
  </>;
}

export default function CinematicWatch() {
  const section = useRef();
  const [progress, setProgress] = useState(0);
  const [chapter, setChapter] = useState('THE ICON');
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: section.current, start: 'top top', end: '+=9800', pin: true, scrub: .28, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => { const p = self.progress; setProgress(p); setChapter(p < .14 ? 'THE ICON' : p < .31 ? 'MACRO' : p < .46 ? 'CASE OPENING' : p < .7 ? 'EXPLODED CALIBRE' : p < .9 ? 'REASSEMBLY' : 'FINAL HERO'); },
    });
    return () => trigger.kill();
  }, []);
  const dpr = useMemo(() => [1, Math.min(window.devicePixelRatio || 1, 2.25)], []);
  return <section ref={section} className={styles.section}>
    <div className={styles.canvas}><Canvas dpr={dpr} shadows gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, outputColorSpace: THREE.SRGBColorSpace, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}><color attach="background" args={['#010101']} /><Scene progress={progress} /></Canvas></div>
    <div className={styles.overlay} />
    <div className={styles.copy}><p>ROVIXE / HOROLOGICAL OBJECT 01</p><h1>TIME<br /><span>IN MOTION.</span></h1><div className={styles.line}><i style={{ transform: `scaleX(${Math.max(.015, progress)})` }} /></div></div>
    <div className={styles.chapter}><strong>{chapter}</strong><span>SCROLL / SCRUB</span></div>
    <div className={styles.meta}><span>CINEMATIC 3D</span><span>{String(Math.round(progress * 100)).padStart(2, '0')}%</span><span>4K READY</span></div>
  </section>;
}
