'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './CinematicCar.module.css';

gsap.registerPlugin(ScrollTrigger);

const BODY = '#15181c';
const BODY_HIGHLIGHT = '#343a40';
const CARBON = '#07090b';
const METAL = '#b9bec4';
const GLASS = '#071016';
const RED = '#b21f2d';

function Material({ color, metalness = .8, roughness = .2, clearcoat = 0 }) {
  return <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={clearcoat} clearcoatRoughness={.08} />;
}

function Wheel({ position, explode }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z -= d * .15; });
  const x = position[0] * (1 + explode * .55);
  return <group ref={ref} position={[x, position[1] + explode * .08, position[2]]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.78, .78, .38, 64]} /><Material color={CARBON} metalness={.92} roughness={.2} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .21]}><torusGeometry args={[.59, .12, 20, 72]} /><Material color={METAL} metalness={1} roughness={.12} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .28]}><cylinderGeometry args={[.39, .39, .055, 48]} /><Material color={CARBON} metalness={.85} roughness={.18} /></mesh>
    {Array.from({ length: 10 }).map((_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 5) * .3, Math.sin(i * Math.PI / 5) * .3, .33]} rotation={[0, 0, i * Math.PI / 5]}><boxGeometry args={[.045, .52, .035]} /><Material color={METAL} metalness={1} roughness={.14} /></mesh>)}
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .37]}><torusGeometry args={[.22, .035, 12, 40]} /><Material color={RED} metalness={.7} roughness={.18} /></mesh>
  </group>;
}

function CarBody({ explode }) {
  const bodyRef = useRef();
  return <group ref={bodyRef} position={[0, explode * .16, 0]}>
    <mesh castShadow receiveShadow scale={[2.95, .5, 1.22]} position={[0, .55, 0]}><sphereGeometry args={[1, 64, 32]} /><Material color={BODY} metalness={.92} roughness={.16} clearcoat={1} /></mesh>
    <mesh castShadow position={[0, .42, -.06]} scale={[3.15, .27, 1.28]}><sphereGeometry args={[1, 64, 24]} /><Material color={BODY_HIGHLIGHT} metalness={.9} roughness={.2} clearcoat={.9} /></mesh>
    <mesh castShadow position={[0, .84, .02]} scale={[1.65, .32, .98]}><sphereGeometry args={[1, 64, 32]} /><Material color={GLASS} metalness={.15} roughness={.07} clearcoat={1} /></mesh>
    <mesh position={[0, .67, .98]} scale={[2.1, .035, .035]}><boxGeometry args={[1, 1, 1]} /><Material color={METAL} metalness={1} roughness={.13} /></mesh>
    <mesh position={[2.68, .5, 0]} scale={[.22, .18, .82]}><boxGeometry args={[1, 1, 1]} /><Material color={RED} metalness={.75} roughness={.16} clearcoat={1} /></mesh>
    <mesh position={[-2.68, .5, 0]} scale={[.16, .15, .82]}><boxGeometry args={[1, 1, 1]} /><Material color={RED} metalness={.75} roughness={.16} clearcoat={1} /></mesh>
    <mesh position={[0, .42, -1.28]} scale={[2.15, .055, .04]}><boxGeometry args={[1, 1, 1]} /><Material color={METAL} metalness={1} roughness={.15} /></mesh>
  </group>;
}

function Interior({ explode }) {
  return <group position={[0, .92 + explode * .85, 0]} rotation={[explode * -.08, 0, 0]}>
    <mesh position={[0, 0, 0]} scale={[1.35, .07, .72]}><boxGeometry args={[1, 1, 1]} /><Material color="#17191c" metalness={.2} roughness={.48} /></mesh>
    {[-.62, .62].map((x, i) => <group key={i} position={[x, .16, 0]}>
      <mesh scale={[.34, .42, .46]}><sphereGeometry args={[1, 32, 20]} /><Material color="#202328" metalness={.25} roughness={.36} /></mesh>
      <mesh position={[0, .18, -.08]} scale={[.27, .32, .28]}><sphereGeometry args={[1, 32, 20]} /><Material color="#7f858b" metalness={.15} roughness={.5} /></mesh>
    </group>)}
    <mesh position={[0, .22, .3]} scale={[.35, .12, .12]}><boxGeometry args={[1, 1, 1]} /><Material color={METAL} metalness={1} roughness={.16} /></mesh>
  </group>;
}

function Powertrain({ explode }) {
  const rotor = useRef();
  useFrame((_, d) => { if (rotor.current) rotor.current.rotation.y += d * .8; });
  return <group position={[0, .68 - explode * .9, -1.05]}>
    <mesh ref={rotor} scale={[.7, .28, .7]}><torusGeometry args={[.55, .12, 20, 64]} /><Material color={METAL} metalness={1} roughness={.16} /></mesh>
    {[-.42, 0, .42].map((x, i) => <mesh key={i} position={[x, 0, 0]} scale={[.15, .22, .48]}><boxGeometry args={[1, 1, 1]} /><Material color={RED} metalness={.7} roughness={.2} /></mesh>)}
  </group>;
}

function Chassis({ explode }) {
  return <group position={[0, -.02 - explode * .45, 0]}>
    <mesh scale={[2.45, .09, .72]}><boxGeometry args={[1, 1, 1]} /><Material color={CARBON} metalness={.85} roughness={.2} /></mesh>
    {[-1.8, 1.8].map(x => <mesh key={x} position={[x, .05, 0]} rotation={[0, 0, x > 0 ? -.08 : .08]} scale={[.9, .055, .09]}><boxGeometry args={[1, 1, 1]} /><Material color={METAL} metalness={1} roughness={.18} /></mesh>)}
  </group>;
}

function Car({ progress }) {
  const root = useRef();
  useFrame((state) => {
    const p = progress;
    const intro = THREE.MathUtils.smoothstep(p, 0, .1);
    const orbit = THREE.MathUtils.smoothstep(p, .08, .32);
    const detail = THREE.MathUtils.smoothstep(p, .22, .42);
    const explode = THREE.MathUtils.smoothstep(p, .42, .63);
    const rebuild = THREE.MathUtils.smoothstep(p, .72, .91);
    const final = THREE.MathUtils.smoothstep(p, .9, 1);
    const e = THREE.MathUtils.clamp(explode * (1 - rebuild), 0, 1);
    root.current.position.y = THREE.MathUtils.lerp(-.7, 0, intro) + Math.sin(p * Math.PI) * .04;
    root.current.rotation.y = -.35 + orbit * Math.PI * 1.55 - rebuild * .25 + final * .35;
    root.current.rotation.x = -.04 + detail * .08;
    root.current.scale.setScalar(1.35 + detail * .08);
    const angle = orbit * Math.PI * 1.45;
    state.camera.position.x = Math.sin(angle) * (7.8 - detail * 2.1);
    state.camera.position.y = 2.1 + Math.sin(p * Math.PI) * .7 + e * .55;
    state.camera.position.z = Math.cos(angle) * (7.8 - detail * 2.1) + .4;
    if (p > .64 && p < .9) { state.camera.position.x += Math.sin(e * Math.PI * 2) * .7; state.camera.position.z += e * 1.1; }
    state.camera.fov = THREE.MathUtils.lerp(45, 30, detail) + final * 6;
    state.camera.lookAt(0, .55, 0);
    state.camera.updateProjectionMatrix();
  });
  return <group ref={root}>
    <Chassis explode={e} />
    <CarBody explode={e} />
    <Interior explode={e} />
    <Powertrain explode={e} />
    {[[-2.15,.22,.9],[-2.15,.22,-.9],[2.15,.22,.9],[2.15,.22,-.9]].map((pos,i)=><Wheel key={i} position={pos} explode={e}/>) }
  </group>;
}

function Lighting({ progress }) {
  const key = useRef(); const rim = useRef(); const strip = useRef();
  useFrame(() => {
    const p = progress; const e = THREE.MathUtils.smoothstep(p, .35, .7);
    if (key.current) { key.current.position.x = THREE.MathUtils.lerp(-5, 5, p); key.current.position.z = 4.5 + Math.sin(p * Math.PI) * 2; key.current.intensity = 7 + e * 5; }
    if (rim.current) { rim.current.position.x = THREE.MathUtils.lerp(5, -5, p); rim.current.intensity = 5 + e * 5; }
    if (strip.current) strip.current.intensity = 2 + Math.sin(p * Math.PI) * 5;
  });
  return <>
    <ambientLight intensity={.025}/>
    <rectAreaLight ref={key} position={[-5,5,4.5]} width={7} height={2} intensity={7}/>
    <rectAreaLight ref={rim} position={[5,2,3]} rotation={[0,1,0]} width={2} height={6} intensity={5}/>
    <rectAreaLight ref={strip} position={[0,5,-3]} rotation={[0,0,Math.PI]} width={5} height={1} intensity={2}/>
    <spotLight position={[0,7,4]} intensity={9} angle={.32} penumbra={.95} castShadow shadow-mapSize={[2048,2048]}/>
    <Environment preset="studio" environmentIntensity={.75}/>
  </>;
}

function Scene({ progress }) {
  return <>
    <Lighting progress={progress}/>
    <Car progress={progress}/>
    <ContactShadows position={[0,-.78,0]} opacity={.42} scale={9} blur={2.8} far={7} resolution={1024}/>
  </>;
}

const chapters = [
  [0, .12, 'THE REVEAL'], [ .12, .3, 'FORM / LIGHT'], [ .3, .43, 'DETAIL'], [ .43, .68, 'ENGINEERING'], [ .68, .91, 'REASSEMBLY'], [ .91, 1.01, 'THE AURION X1']
];

export default function CinematicCar() {
  const section = useRef();
  const [progress, setProgress] = useState(0);
  const [chapter, setChapter] = useState('THE REVEAL');
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: section.current, start: 'top top', end: '+=10500', pin: true, scrub: .22, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => {
        const p = self.progress; setProgress(p);
        const found = chapters.find(([a,b]) => p >= a && p < b); if (found) setChapter(found[2]);
      }
    });
    return () => trigger.kill();
  }, []);
  const dpr = useMemo(() => [1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)], []);
  return <section ref={section} className={styles.section}>
    <div className={styles.canvas}><Canvas dpr={dpr} shadows camera={{position:[0,2,8],fov:45}} gl={{antialias:true,powerPreference:'high-performance',alpha:false,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}}><color attach="background" args={['#010101']}/><Scene progress={progress}/></Canvas></div>
    <div className={styles.vignette}/>
    <header className={styles.header}><strong>AURION</strong><span>MODEL X1 / CINEMATIC OBJECT</span></header>
    <div className={styles.hero}><p>ROVIXE AUTOMOTIVE / 001</p><h1>THE<br/><em>ART OF MOTION.</em></h1></div>
    <div className={styles.chapter}><strong>{chapter}</strong><small>SCROLL TO DIRECT</small></div>
    <div className={styles.progress}><i style={{transform:`scaleX(${Math.max(.01,progress)})`}}/></div>
    <div className={styles.specs}><span>V12 / AWD</span><span>CARBON MONOCOQUE</span><span>01 / 99</span></div>
    <div className={styles.scroll}>SCROLL / PLAY FILM</div>
    <footer className={styles.footer}><span>AURION X1</span><span>HANDCRAFTED / DUBAI</span><span>{String(Math.round(progress*100)).padStart(2,'0')}%</span></footer>
  </section>;
}
