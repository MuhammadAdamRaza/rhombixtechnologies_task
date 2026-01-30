import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Sphere, Torus, Cone } from '@react-three/drei'
import * as THREE from 'three'

// Floating particles component
function FloatingParticles() {
  const particlesRef = useRef()
  const particleCount = 50
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3498db" />
    </points>
  )
}

// Animated geometric shapes
function AnimatedShapes() {
  const boxRef = useRef()
  const sphereRef = useRef()
  const torusRef = useRef()
  const coneRef = useRef()

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Animate box
    if (boxRef.current) {
      boxRef.current.rotation.x = time * 0.5
      boxRef.current.rotation.y = time * 0.3
      boxRef.current.position.y = Math.sin(time) * 0.5
    }
    
    // Animate sphere
    if (sphereRef.current) {
      sphereRef.current.rotation.z = time * 0.4
      sphereRef.current.position.x = Math.cos(time * 0.8) * 2
      sphereRef.current.position.y = Math.sin(time * 0.6) * 0.8
    }
    
    // Animate torus
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.6
      torusRef.current.rotation.y = time * 0.4
      torusRef.current.position.z = Math.sin(time * 0.5) * 1.5
    }
    
    // Animate cone
    if (coneRef.current) {
      coneRef.current.rotation.y = time * 0.8
      coneRef.current.position.x = Math.sin(time * 0.7) * 1.5
      coneRef.current.position.z = Math.cos(time * 0.5) * 1.2
    }
  })

  return (
    <group>
      <Box ref={boxRef} position={[-2, 0, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#3498db" />
      </Box>
      
      <Sphere ref={sphereRef} position={[2, 0, 0]} args={[0.8]}>
        <meshStandardMaterial color="#e74c3c" />
      </Sphere>
      
      <Torus ref={torusRef} position={[0, 2, -2]} args={[0.6, 0.2, 16, 32]}>
        <meshStandardMaterial color="#f39c12" />
      </Torus>
      
      <Cone ref={coneRef} position={[0, -2, 1]} args={[0.5, 1.5, 8]}>
        <meshStandardMaterial color="#9b59b6" />
      </Cone>
    </group>
  )
}

// Main enhanced 3D scene
export default function Enhanced3DScene() {
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3498db" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Animated shapes */}
      <AnimatedShapes />
      
      {/* Welcome text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.6}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        Welcome to My Portfolio
      </Text>
      
      {/* Subtitle */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="#7f8c8d"
        anchorX="center"
        anchorY="middle"
      >
        Interactive 3D Experience
      </Text>
    </>
  )
}

