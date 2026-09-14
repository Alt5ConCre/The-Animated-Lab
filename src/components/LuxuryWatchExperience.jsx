'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = 'https://cdn.3dassets.dev/assets/99/v1/model.glb';

function WatchModel({ progress }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef();
  const parts = useMemo(() => {
    const result = [];
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        result.push({
          object,
          origin: object.position.clone(),
          rotation: object.rotation.clone(),
          center: new THREE.Vector3(),
        });
      }
    });
    return result;
  }, [scene]);

  useFrame((state, delta) => {
    const p = progress.current;
    const explode = THREE.MathUtils.smoothstep(p, 0.25, 0.58);
    const reassemble = p > 0.72 ? 1 - THREE.MathUtils.smoothstep(p, 0.72, 0.92) : 1;
    const amount = explode * reassemble;

    if (group.current) {
      group.current.rotation.y += delta * (0.12 + p * 0.45);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, p * 0.12, 0.035);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(state.clock.elapsedTime * 0.55) * 0.025, 0.03);
    }

    parts.forEach((part, index) => {
      const object = part.object;
      const world = object.getWorldPosition(part.center);
      const radial = new THREE.Vector3(world.x, world.y * 0.45, world.z).normalize();
      if (!Number.isFinite(radial.x)) radial.set((index % 3) - 1, 0.2, 0.4);
      const distance = 0.12 + (index % 7) * 0.035;
      object.position.lerp(part.origin.clone().add(radial.multiplyScalar(distance * amount)), 0.12);
      object.rotation.x = part.rotation.x + Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.018 * amount;
      object.rotation.z = part.rotation.z + Math.cos(state.clock.elapsedTime * 0.55 + index) * 0.018 * amount;
    });
  });

  return <primitive ref={group} object={scene} scale={2.9} />;
}

function Scene({ progress }) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <PerspectiveCamera makeDefault position={[0, 0.2, 5.5]} fov={38} />
      <color attach="background" args={['#030303']} />
      <ambientLight intensity={0.32} />
      <spotLight position={[3.5, 4.5, 4]} intensity={14} angle={0.34} penumbra={0.8} castShadow shadow-mapSize={[2048, 2048]} />
      <spotLight position={[-4, 1.5, 2]} intensity={9} angle={0.45} penumbra={1} color="#c7d7ff" />
      <pointLight position={[0, -2, -2]} intensity={4} color="#b58a42" />
      <Environment preset="studio" environmentIntensity={0.7} />
      <Float speed={0.65} rotationIntensity={0.08} floatIntensity={0.15}>
        <Suspense fallback={null}>
          <WatchModel progress={progress} />
        </Suspense>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.28} />
      </mesh>
    </Canvas>
  );
}

export default function LuxuryWatchExperience() {
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const target = window.scrollY / max;
      progress.current += (target - progress.current) * 0.085;
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="luxury-watch-page">
      <div className="watch-stage"><Scene progress={progress} /></div>

      <header className="watch-header">
        <span className="watch-brand">AURELIS</span>
        <span className="watch-index">01 / 01</span>
      </header>

      <section className="watch-copy watch-hero-copy">
        <p className="eyebrow">HOROLOGICAL OBJECT · 01</p>
        <h1>ENGINEERED<br /><em>TO BE SEEN.</em></h1>
        <p className="intro">A cinematic study of precision, material and mechanical motion.</p>
      </section>

      <section className="watch-copy watch-detail-copy">
        <p className="eyebrow">THE ARCHITECTURE</p>
        <h2>Every layer.<br />Exposed.</h2>
        <p>Scroll through the construction as the case, dial, crystal and mechanical elements separate into a floating technical composition.</p>
      </section>

      <section className="watch-copy watch-final-copy">
        <p className="eyebrow">AURELIS · SIGNATURE SERIES</p>
        <h2>PRECISION<br /><em>REASSEMBLED.</em></h2>
        <button type="button">DISCOVER THE WATCH <span>↗</span></button>
      </section>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
