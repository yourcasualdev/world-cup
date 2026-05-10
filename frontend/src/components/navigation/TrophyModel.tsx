"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Bounds } from "@react-three/drei";
import * as THREE from "three";

function Trophy() {
  const ref = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/world-cup-trophy.glb");

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.2;
  });

  return (
    <Bounds fit clip observe>
      <Center>
        <primitive ref={ref} object={scene} />
      </Center>
    </Bounds>
  );
}

export default function TrophyModel() {
  return (
    <div style={{ width: 36, height: 36 }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 4, 2]} intensity={2} />
        <Trophy />
      </Canvas>
    </div>
  );
}
