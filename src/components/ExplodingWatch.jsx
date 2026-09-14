'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, MeshTransmissionMaterial, PerspectiveCamera, RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);

const GOLD = '#b9954f';
const GOLD_HIGHLIGHT = '#e0c27a';
const STEEL = '#a9afb1';
const DARK = '#111417';
const DIAL = '#080c10';
const RUBY = '#7e101b';

function LuxuryMetal({ color = STEEL, roughness = 0.16, clearcoat = 0.8, env = 2.2 }) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.97}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.045}
      envMapIntensity={env}
      reflectivity={1}
    />
  );
}

function Screw({ position, size = 0.035, color = STEEL }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size, size * 0.9, size * 0.22, 20]} />
        <LuxuryMetal color={color} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0, size * 0.13]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <boxGeometry args={[size * 1.25, size * 0.13, size * 0.08]} />
        <meshStandardMaterial color="#25282a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Gear({ radius, teeth, depth, color, progress, index }) {
  const ref = useRef();
  const teethArray = useMemo(() => Array.from({ length: teeth }, (_, i) => i), [teeth]);

  useFrame(() => {
    if (!ref.current) return;
    const exploded = THREE.MathUtils.smoothstep(progress, 0.38, 0.63);
    ref.current.position.z = -0.42 - exploded * (0.16 + index * 0.055);
    ref.current.rotation.z += 0.0015 * (index % 2 ? -1 : 1);
  });

  return (
    <group ref={ref} position={[index * 0.19 - 0.25, index % 2 ? -0.12 : 0.1, -0.42]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.5, radius * 0.5, depth, 64]} />
        <LuxuryMetal color={color} roughness={0.18} />
      </mesh>
      {teethArray.map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[radius * 0.14, radius * 0.34, depth]} />
            <LuxuryMetal color={color} roughness={0.16} />
          </mesh>
        );
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, depth * 0.55]}>
        <torusGeometry args={[radius * 0.36, radius * 0.018, 10, 48]} />
        <LuxuryMetal color={GOLD_HIGHLIGHT} roughness={0.11} />
      </mesh>
    </group>
  );
}

function Movement({ progress }) {
  const rotor = useRef();
  useFrame(() => {
    if (rotor.current) rotor.current.rotation.z += 0.006;
  });

  const exploded = THREE.MathUtils.smoothstep(progress, 0.38, 0.63);

  return (
    <group position={[0, 0, -0.36 - exploded * 0.48]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.69, 0.69, 0.1, 128]} />
        <LuxuryMetal color="#b29a60" roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.59, 0.59, 0.035, 128]} />
        <meshStandardMaterial color="#1c2022" metalness={0.88} roughness={0.2} />
      </mesh>

      <Gear radius={0.18} teeth={18} depth={0.038} color="#d6bd7b" progress={progress} index={0} />
      <Gear radius={0.135} teeth={16} depth={0.034} color="#b9bec0" progress={progress} index={1} />
      <Gear radius={0.105} teeth={14} depth={0.03} color="#d8c184" progress={progress} index={2} />
      <Gear radius={0.075} teeth={12} depth={0.026} color="#b7bcbd" progress={progress} index={3} />

      <group ref={rotor} position={[0.08, -0.04, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.43, 0.045, 16, 96, Math.PI * 1.62]} />
          <LuxuryMetal color="#b9bdbe" roughness={0.15} />
        </mesh>
        <mesh rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.7, 0.055, 0.025]} />
          <LuxuryMetal color="#8f9699" roughness={0.17} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.09, 0.09, 0.045, 48]} />
          <LuxuryMetal color={GOLD} roughness={0.12} />
        </mesh>
      </group>

      {[[-0.42, 0.27], [0.42, 0.27], [-0.42, -0.27], [0.42, -0.27]].map(([x, y], i) => (
        <React.Fragment key={i}>
          <Screw position={[x, y, 0.13]} size={0.032} />
          <mesh position={[x * 0.58, y * 0.58, 0.15]}>
            <sphereGeometry args={[0.028, 20, 20]} />
            <meshPhysicalMaterial color={RUBY} metalness={0.15} roughness={0.08} clearcoat={1} />
          </mesh>
        </React.Fragment>
      ))}

      <mesh position={[-0.2, 0.3, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.012, 10, 48]} />
        <LuxuryMetal color="#c9b77f" roughness={0.2} />
      </mesh>
    </group>
  );
}

function Bracelet({ progress }) {
  const exploded = THREE.MathUtils.smoothstep(progress, 0.38, 0.63) * (1 - THREE.MathUtils.smoothstep(progress, 0.76, 0.96));
  const links = Array.from({ length: 7 }, (_, i) => i);
  return (
    <group position={[0, -1.23, -0.03]}>
      {links.map((i) => (
        <group key={i} position={[0, -i * 0.23 - exploded * i * 0.04, -exploded * 0.08]}>
          <RoundedBox args={[1.28 - i * 0.05, 0.2, 0.28]} radius={0.045} smoothness={5}>
            <LuxuryMetal color={i % 2 ? '#8f9597' : '#b4b8b8'} roughness={0.19} />
          </RoundedBox>
          <mesh position={[0, 0, 0.145]}>
            <boxGeometry args={[0.7, 0.06, 0.018]} />
            <LuxuryMetal color={GOLD} roughness={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Dial({ progress }) {
  const exploded = THREE.MathUtils.smoothstep(progress, 0.38, 0.63);
  return (
    <group position={[0, 0, 0.26 + exploded * 0.78]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.045, 160]} />
        <meshPhysicalMaterial color={DIAL} metalness={0.55} roughness={0.2} clearcoat={1} clearcoatRoughness={0.045} />
      </mesh>
      <mesh position={[0, 0, 0.027]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.725, 0.018, 12, 128]} />
        <LuxuryMetal color={GOLD} roughness={0.12} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const major = i % 3 === 0;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.64, Math.sin(a) * 0.64, 0.045]} rotation={[0, 0, a]}>
            <boxGeometry args={[major ? 0.045 : 0.026, major ? 0.17 : 0.095, 0.028]} />
            <LuxuryMetal color={major ? '#e5dfd1' : GOLD_HIGHLIGHT} roughness={0.13} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.27, 0.05]}>
        <boxGeometry args={[0.22, 0.11, 0.018]} />
        <meshStandardMaterial color="#f0ece2" metalness={0.25} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <cylinderGeometry args={[0.043, 0.043, 0.02, 32]} />
        <LuxuryMetal color={GOLD_HIGHLIGHT} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.17, 0.062]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.036, 0.34, 0.018]} />
        <LuxuryMetal color="#eee9dc" roughness={0.12} />
      </mesh>
      <mesh position={[0.2, 0, 0.063]} rotation={[0, 0, -0.94]}>
        <boxGeometry args={[0.032, 0.5, 0.018]} />
        <LuxuryMetal color="#eee9dc" roughness={0.12} />
      </mesh>
    </group>
  );
}

function Watch({ progress }) {
  const group = useRef();
  useFrame((state) => {
    if (!group.current) return;
    const intro = THREE.MathUtils.smoothstep(progress, 0, 0.28);
    const exploded = THREE.MathUtils.smoothstep(progress, 0.4, 0.64);
    const reassembled = THREE.MathUtils.smoothstep(progress, 0.76, 0.96);
    group.current.rotation.x = -0.1 + progress * 0.18;
    group.current.rotation.y = progress * Math.PI * 1.45;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.018;
    const camera = state.camera;
    camera.position.z = THREE.MathUtils.lerp(5.3, 3.05, intro);
    camera.position.y = THREE.MathUtils.lerp(0.05, 0.28, progress);
    camera.fov = THREE.MathUtils.lerp(41, 31, THREE.MathUtils.smoothstep(progress, 0.1, 0.42));
    camera.updateProjectionMatrix();
    camera.lookAt(0, -0.08, 0);
    const spread = exploded * (1 - reassembled);
    group.current.scale.setScalar(1 + spread * 0.035);
  });

  const spread = THREE.MathUtils.smoothstep(progress, 0.4, 0.64) * (1 - THREE.MathUtils.smoothstep(progress, 0.76, 0.96));
  const caseOffset = spread * 0.13;
  const bezelOffset = spread * 0.38;
  const crystalOffset = spread * 1.15;

  return (
    <group ref={group}>
      <group position={[0, 0, -caseOffset]}>
        <RoundedBox args={[2.15, 2.45, 0.38]} radius={0.35} smoothness={10} castShadow receiveShadow>
          <LuxuryMetal color={DARK} roughness={0.12} />
        </RoundedBox>
        <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.93, 0.93, 0.08, 128]} />
          <LuxuryMetal color="#080a0b" roughness={0.23} />
        </mesh>
        <mesh position={[1.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.16, 64]} />
          <LuxuryMetal color={GOLD} roughness={0.1} />
        </mesh>
        {[-0.06, 0, 0.06].map((y) => (
          <mesh key={y} position={[1.215, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.135, 0.008, 8, 48]} />
            <LuxuryMetal color={GOLD_HIGHLIGHT} roughness={0.08} />
          </mesh>
        ))}
      </group>

      <group position={[0, 0, 0.19 + bezelOffset]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.92, 0.115, 32, 160]} />
          <LuxuryMetal color={GOLD} roughness={0.075} clearcoat={1} env={2.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.06, 160]} />
          <LuxuryMetal color="#15191c" roughness={0.17} />
        </mesh>
      </group>

      <Dial progress={progress} />

      <group position={[0, 0, -0.12 - crystalOffset]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.92, 0.92, 0.075, 160]} />
          <MeshTransmissionMaterial backside samples={8} resolution={512} thickness={0.18} roughness={0.025} ior={1.52} chromaticAberration={0.018} anisotropy={0.1} transmission={1} />
        </mesh>
      </group>

      <Movement progress={progress} />
      <Bracelet progress={progress} />
    </group>
  );
}

function Scene({ progress }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.05, 5.3]} fov={41} />
      <ambientLight intensity={0.09} />
      <spotLight position={[4.5, 5, 5]} intensity={18} angle={0.25} penumbra={0.92} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.00005} />
      <spotLight position={[-4.5, 2.5, 3]} intensity={12} angle={0.32} penumbra={0.95} castShadow />
      <spotLight position={[0, -4, 1]} intensity={8} angle={0.45} penumbra={1} />
      <rectAreaLight position={[0, 3, 4]} rotation={[0, 0, 0]} width={5} height={2} intensity={7} />
      <rectAreaLight position={[-4, 0, 2]} rotation={[0, Math.PI / 2, 0]} width={3} height={5} intensity={5} />
      <pointLight position={[2.5, -1, 2.5]} intensity={3} color="#d6b56c" />
      <Environment preset="studio" environmentIntensity={1.5} />
      <Watch progress={progress} />
      <ContactShadows position={[0, -1.4, 0]} opacity={0.55} scale={5.5} blur={2.4} far={5} resolution={1024} />
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
      <div className={styles.canvasWrap}><Canvas dpr={[1, 2]} shadows gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}><Scene progress={progress} /></Canvas></div>
      <div className={`${styles.labels} ${exploded ? styles.visible : ''}`}><span>POLISHED STEEL</span><span>SAPPHIRE CRYSTAL</span><span>AUTOMATIC CALIBRE</span><span>PRECISION CASE</span></div>
      <div className={styles.scrollHint}>{progress < 0.06 ? 'SCROLL TO DISCOVER' : `${Math.round(progress * 100)}%`}</div>
      <div className={styles.cta}><button>DISCOVER THE MOVEMENT <span>↗</span></button></div>
    </section>
  );
}
