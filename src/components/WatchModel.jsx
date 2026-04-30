'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';
import gsap from 'gsap';

export default function WatchModel() {
  const groupRef = useRef();
  
  // Refs for individual parts to animate assembly
  const caseRef = useRef();
  const gear1Ref = useRef();
  const gear2Ref = useRef();
  const handsRef = useRef();

  useEffect(() => {
    // Assembly animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.5 } });
    
    // Initial states (exploded view)
    gsap.set(caseRef.current.position, { z: -5, opacity: 0 });
    gsap.set(gear1Ref.current.position, { x: 5, y: 2 });
    gsap.set(gear2Ref.current.position, { x: -5, y: -2 });
    gsap.set(handsRef.current.position, { z: 5 });

    tl.to(caseRef.current.position, { z: 0 }, 0)
      .to(gear1Ref.current.position, { x: 0.5, y: 0.2 }, 0.2)
      .to(gear2Ref.current.position, { x: -0.5, y: -0.3 }, 0.4)
      .to(handsRef.current.position, { z: 0.5 }, 0.6);
  }, []);

  useFrame((state, delta) => {
    // Constant ticking/rotating of gears
    if (gear1Ref.current) gear1Ref.current.rotation.z -= delta * 0.5;
    if (gear2Ref.current) gear2Ref.current.rotation.z += delta * 0.8;
    if (handsRef.current) handsRef.current.rotation.z -= delta * 0.1;
  });

  return (
    <PresentationControls 
      global={false} 
      config={{ mass: 2, tension: 500 }} 
      snap={{ mass: 4, tension: 1500 }} 
      rotation={[0, 0, 0]} 
      polar={[-Math.PI / 4, Math.PI / 4]} 
      azimuth={[-Math.PI / 4, Math.PI / 4]}
    >
      <Float rotationIntensity={0.2} floatIntensity={0.5} speed={2}>
        <group ref={groupRef} rotation={[0, 0, 0]}>
          
          {/* Watch Case */}
          <mesh ref={caseRef} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[2.5, 2.5, 0.4, 64]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
            {/* Inner Gold Bezel */}
            <mesh position={[0, 0.21, 0]}>
              <ringGeometry args={[2.3, 2.5, 64]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
          </mesh>

          {/* Gears */}
          <group ref={gear1Ref} position={[0.5, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} wireframe />
            </mesh>
          </group>

          <group ref={gear2Ref} position={[-0.5, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
              <meshStandardMaterial color="#a3a3a3" metalness={0.9} roughness={0.2} wireframe />
            </mesh>
          </group>

          {/* Hands */}
          <group ref={handsRef} position={[0, 0, 0.5]}>
            {/* Minute Hand */}
            <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.05, 1.6, 0.05]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
            </mesh>
            {/* Hour Hand */}
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.08, 1.0, 0.05]} />
              <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Center Pin */}
            <mesh>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
            </mesh>
          </group>

        </group>
      </Float>
    </PresentationControls>
  );
}
