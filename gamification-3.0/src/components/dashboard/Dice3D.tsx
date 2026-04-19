'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

interface Dice3DProps {
  isRolling: boolean
  onRollComplete?: () => void
}

function D20({ isRolling }: { isRolling: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Custom material for the cyber-dice
  const material = new THREE.MeshPhysicalMaterial({
    color: '#8b5cf6', // Cyber Purple
    metalness: 0.5,
    roughness: 0.1,
    transmission: 0.5, // glass-like
    thickness: 1.5,
    emissive: '#06b6d4', // Cyan glow
    emissiveIntensity: 0.2,
  })

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return

    if (isRolling) {
      // Fast chaotic spin
      meshRef.current.rotation.x += delta * 15
      meshRef.current.rotation.y += delta * 20
      meshRef.current.rotation.z += delta * 10
    } else {
      // Slow idle float
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <group>
      <Icosahedron ref={meshRef} args={[1, 0]} material={material}>
        <lineSegments>
          <edgesGeometry args={[new THREE.IcosahedronGeometry(1, 0)]} />
          <lineBasicMaterial color="#06b6d4" linewidth={2} />
        </lineSegments>
      </Icosahedron>
    </group>
  )
}

export function Dice3D({ isRolling }: Dice3DProps) {
  return (
    <div className="w-full h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        
        <D20 isRolling={isRolling} />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#8b5cf6" />
      </Canvas>
    </div>
  )
}
