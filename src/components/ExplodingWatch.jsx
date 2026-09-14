'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import styles from './ExplodingWatch.module.css';

gsap.registerPlugin(ScrollTrigger);
const GOLD = '#c9a35b';
const STEEL = '#777b80';
const RUBY = '#8d1729';

function PostFX() {
  const { gl, scene, camera, size } = useThree();
  const ref = useRef();
  useEffect(() => {
    const fx = new EffectComposer(gl);
    fx.addPass(new RenderPass(scene, camera));
    fx.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), .14, .3, 1.2));
    fx.addPass(new OutputPass());
    fx.setPixelRatio(Math.min(devicePixelRatio, 1.8)); fx.setSize(size.width, size.height); ref.current = fx;
    return () => fx.dispose();
  }, [gl, scene, camera]);
  useEffect(() => ref.current?.setSize(size.width, size.height), [size]);
  useFrame((_, d) => ref.current?.render(d), 1);
  return null;
}

function Gear({ r=.28, teeth=12, speed=1, color=STEEL }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.z += d * speed * .8; });
  return <group ref={ref}>
    <mesh castShadow><cylinderGeometry args={[r*.86,r*.86,.07,48]}/><meshStandardMaterial color={color} metalness={.95} roughness={.2}/></mesh>
    {Array.from({length:teeth}).map((_,i)=>{const a=i/teeth*Math.PI*2; return <mesh key={i} position={[Math.cos(a)*r,Math.sin(a)*r,0]} rotation={[0,0,a]}><boxGeometry args={[r*.18,r*.45,.07]}/><meshStandardMaterial color={color} metalness={.95} roughness={.2}/></mesh>})}
    <mesh position={[0,0,.055]}><cylinderGeometry args={[r*.2,r*.2,.025,24]}/><meshStandardMaterial color={GOLD} metalness={1} roughness={.16}/></mesh>
  </group>;
}

function Movement() {
  return <group>
    <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[1.05,1.05,.12,64]}/><meshStandardMaterial color="#303438" metalness={.9} roughness={.25}/></mesh>
    <mesh position={[0,0,.09]}><circleGeometry args={[.94,64]}/><meshStandardMaterial color="#111315" metalness={.72} roughness={.28}/></mesh>
    <Gear r={.34} teeth={14} speed={.9}/><group position={[.5,.27,.12]}><Gear r={.23} teeth={11} speed={-1.15}/></group>
    <group position={[-.46,-.18,.12]}><Gear r={.25} teeth={13} speed={.78}/></group><group position={[.12,-.45,.12]}><Gear r={.19} teeth={10} speed={-1.3}/></group>
    {[-.62,.62,-.48,.48].map((x,i)=><mesh key={i} position={[x,i<2?.54:-.55,.14]}><cylinderGeometry args={[.055,.055,.035,20]}/><meshStandardMaterial color={RUBY} metalness={.3} roughness={.15}/></mesh>)}
    <mesh position={[.18,.05,.2]} rotation={[Math.PI/2,.1,.2]}><torusGeometry args={[.57,.045,12,64]}/><meshStandardMaterial color="#999da0" metalness={.96} roughness={.2}/></mesh>
    <mesh position={[.22,.02,.25]} rotation={[Math.PI/2,.1,.2]}><torusGeometry args={[.38,.025,10,48]}/><meshStandardMaterial color={GOLD} metalness={1} roughness={.16}/></mesh>
  </group>;
}

function Dial() {
  const seconds = useRef();
  useFrame((s)=>{if(seconds.current) seconds.current.rotation.z=-s.clock.elapsedTime*.08;});
  return <group position={[0,0,.43]}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.31,1.31,.055,96]}/><meshStandardMaterial color="#0b0d0f" metalness={.42} roughness={.27}/></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,0,.035]}><torusGeometry args={[1.18,.025,12,96]}/><meshStandardMaterial color={GOLD} metalness={1} roughness={.16}/></mesh>
    {Array.from({length:12}).map((_,i)=>{const a=i*Math.PI/6; return <mesh key={i} position={[Math.sin(a)*.98,Math.cos(a)*.98,.07]} scale={i%3===0?[.08,.18,.035]:[.045,.12,.035]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#ded7c7" metalness={.82} roughness={.22}/></mesh>})}
    <mesh position={[0,.33,.075]}><circleGeometry args={[.2,48]}/><meshStandardMaterial color="#151719" metalness={.65} roughness={.28}/></mesh>
    <mesh position={[0,-.34,.075]}><circleGeometry args={[.2,48]}/><meshStandardMaterial color="#151719" metalness={.65} roughness={.28}/></mesh>
    <mesh ref={seconds} position={[0,.15,.12]}><boxGeometry args={[.025,.95,.018]}/><meshStandardMaterial color="#eeeae0" metalness={.75} roughness={.2}/></mesh>
    <mesh position={[.15,0,.13]} rotation={[0,0,Math.PI/2.7]}><boxGeometry args={[.028,.76,.018]}/><meshStandardMaterial color={GOLD} metalness={1} roughness={.15}/></mesh>
    <mesh position={[0,0,.15]}><cylinderGeometry args={[.055,.055,.06,32]}/><meshStandardMaterial color={GOLD} metalness={1} roughness={.15}/></mesh>
  </group>;
}

function Bracelet() {
  const items=[];
  for(let i=-7;i<=7;i++) items.push(<mesh key={i} position={[0,i>0?1.72+(i-1)*.2:-1.72+(i+1)*.2,-.08]} rotation={[Math.PI/2,0,0]}><boxGeometry args={[.82,.22,.16]}/><meshStandardMaterial color="#55595d" metalness={.95} roughness={.19}/></mesh>);
  return <group>{items}</group>;
}

function Watch({ progress }) {
  const root=useRef(), crystal=useRef(), bezel=useRef(), dial=useRef(), movement=useRef(), body=useRef(), bracelet=useRef(), crown=useRef();
  useFrame((state)=>{
    const p=progress, intro=THREE.MathUtils.smoothstep(p,0,.13), macro=THREE.MathUtils.smoothstep(p,.16,.38), explode=THREE.MathUtils.smoothstep(p,.36,.66), reassemble=THREE.MathUtils.smoothstep(p,.72,.94), hold=THREE.MathUtils.smoothstep(p,.58,.72);
    const spread=explode*(1-reassemble);
    root.current.rotation.x=THREE.MathUtils.lerp(-.11,.05,macro)+THREE.MathUtils.smoothstep(p,.34,.55)*.05;
    root.current.rotation.y=-.25+p*Math.PI*1.18-reassemble*.25; root.current.rotation.z=.03-p*.05;
    root.current.position.y=THREE.MathUtils.lerp(-.3,0,intro)+Math.sin(p*Math.PI)*.035; root.current.scale.setScalar(1.48+macro*.13-hold*.03);
    const e=spread*spread*(3-2*spread);
    crystal.current.position.z=THREE.MathUtils.lerp(.63,1.35,e); crystal.current.rotation.y=e*.16;
    bezel.current.position.z=THREE.MathUtils.lerp(.48,.92,e); bezel.current.rotation.y=-e*.12;
    dial.current.position.z=THREE.MathUtils.lerp(.32,.7,e); dial.current.rotation.z=e*.05;
    movement.current.position.z=THREE.MathUtils.lerp(-.02,-.34,e); movement.current.rotation.y=-e*.1;
    body.current.position.z=THREE.MathUtils.lerp(-.18,-.72,e); body.current.rotation.x=e*.06;
    bracelet.current.position.z=THREE.MathUtils.lerp(-.08,-.9,e); bracelet.current.rotation.y=e*.12;
    crown.current.position.x=THREE.MathUtils.lerp(1.57,2.02,e); crown.current.rotation.y=state.clock.elapsedTime*.25;
    const orbit=THREE.MathUtils.smoothstep(p,.28,.72), pull=THREE.MathUtils.smoothstep(p,.74,1), angle=orbit*Math.PI*.65;
    const cam=state.camera; cam.position.x=THREE.MathUtils.lerp(.05,Math.sin(angle)*.8,orbit); cam.position.y=THREE.MathUtils.lerp(.02,.28,macro)+Math.sin(orbit*Math.PI)*.22; cam.position.z=THREE.MathUtils.lerp(8.5,5.2,macro); cam.position.z=THREE.MathUtils.lerp(cam.position.z,7.5,pull); cam.fov=THREE.MathUtils.lerp(48,32,macro); cam.fov=THREE.MathUtils.lerp(cam.fov,45,pull); cam.lookAt(0,.02,0); cam.updateProjectionMatrix();
  });
  return <group ref={root}>
    <group ref={bracelet}><Bracelet/></group>
    <group ref={body}>
      <mesh rotation={[Math.PI/2,0,0]} castShadow receiveShadow><cylinderGeometry args={[1.56,1.56,.46,96]}/><meshPhysicalMaterial color="#292d31" metalness={.97} roughness={.19} clearcoat={.72} clearcoatRoughness={.1}/></mesh>
      <mesh position={[1.55,0,0]} rotation={[0,Math.PI/2,0]}><cylinderGeometry args={[.23,.23,.34,32]}/><meshPhysicalMaterial color={STEEL} metalness={1} roughness={.16}/></mesh>
    </group>
    <group ref={movement}><Movement/></group><group ref={dial}><Dial/></group>
    <group ref={bezel}><mesh rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[1.42,.13,20,96]}/><meshPhysicalMaterial color={GOLD} metalness={1} roughness={.12} clearcoat={.8}/></mesh></group>
    <group ref={crystal}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.39,1.39,.08,96]}/><meshPhysicalMaterial color="#dce9ef" transparent opacity={.2} transmission={.96} thickness={.16} roughness={.045} ior={1.5}/></mesh></group>
    <group ref={crown} position={[1.57,0,0]}><mesh rotation={[0,Math.PI/2,0]}><cylinderGeometry args={[.18,.18,.3,32]}/><meshPhysicalMaterial color={GOLD} metalness={1} roughness={.14}/></mesh>{Array.from({length:5}).map((_,i)=><mesh key={i} position={[.16+i*.035,0,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.18,.018,8,32]}/><meshStandardMaterial color={GOLD} metalness={1} roughness={.17}/></mesh>)}</group>
  </group>;
}

function Scene({progress}) {
  const key=useRef(), rim=useRef(), fill=useRef();
  useFrame(()=>{const e=THREE.MathUtils.smoothstep(progress,.4,.68); if(key.current){key.current.position.x=THREE.MathUtils.lerp(-2,3.5,progress);key.current.intensity=THREE.MathUtils.lerp(7,11,e)} if(rim.current){rim.current.position.x=THREE.MathUtils.lerp(4.5,-4,progress);rim.current.intensity=THREE.MathUtils.lerp(4,8,e)} if(fill.current)fill.current.intensity=THREE.MathUtils.lerp(1.5,4,e)});
  return <><PerspectiveCamera makeDefault position={[0,.02,8.5]} fov={48} near={.1} far={100}/><ambientLight intensity={.035}/><rectAreaLight ref={key} position={[-2,5,5]} width={7} height={2.5} intensity={7}/><rectAreaLight ref={rim} position={[4.5,2.5,3.5]} rotation={[0,.95,0]} width={2.2} height={5.5} intensity={4}/><rectAreaLight ref={fill} position={[-4,.8,3.5]} rotation={[0,-.95,0]} width={2.2} height={5} intensity={1.5}/><rectAreaLight position={[0,-3,3.8]} width={5} height={1.4} intensity={2.4}/><spotLight position={[3.2,4.8,5.5]} intensity={7.5} angle={.28} penumbra={.98} castShadow shadow-mapSize={[2048,2048]}/><Environment preset="studio" environmentIntensity={1}/><Watch progress={progress}/><ContactShadows position={[0,-1.05,0]} opacity={.28} scale={5} blur={2.5} far={4.5} resolution={768}/><PostFX/></>;
}

export default function ExplodingWatch(){
  const section=useRef(); const [progress,setProgress]=useState(0); const [label,setLabel]=useState('THE ICON');
  useEffect(()=>{const trigger=ScrollTrigger.create({trigger:section.current,start:'top top',end:'+=9000',pin:true,scrub:.35,anticipatePin:1,invalidateOnRefresh:true,onUpdate:s=>{setProgress(s.progress);setLabel(s.progress<.15?'THE ICON':s.progress<.34?'MACRO INSPECTION':s.progress<.52?'CASE OPENING':s.progress<.75?'EXPLODED MOVEMENT':s.progress<.92?'REASSEMBLY':'FINAL HERO')}});return()=>trigger.kill()},[]);
  return <section ref={section} className={styles.watchSection}><div className={styles.canvasWrap}><Canvas dpr={[1,1.8]} shadows gl={{antialias:true,powerPreference:'high-performance',alpha:false}}><color attach="background" args={['#010101']}/><Scene progress={progress}/></Canvas></div><div className={styles.copy}><p className={styles.eyebrow}>ROVIXE / HOROLOGICAL OBJECT 01</p><h1>TIME<br/><span>IN MOTION.</span></h1><p className={styles.description}>A cinematic mechanical chronograph where the camera, watch, movement and lighting behave like one continuous film timeline. Scroll is the playhead.</p><div className={styles.progress}><span style={{transform:`scaleX(${Math.max(.02,progress)})`}}/></div></div><div className={styles.chapter}><span>{label}</span><b>SCROLL / SCRUB</b></div><div className={styles.bottom}><span>MECHANICAL CHRONOGRAPH</span><span>{String(Math.round(progress*100)).padStart(2,'0')}%</span></div><div className={styles.grain}/><div className={styles.vignette}/></section>;
}
