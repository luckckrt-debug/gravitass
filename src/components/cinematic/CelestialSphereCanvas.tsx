'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  scrollProgress: number; // 0 to 1 based on scroll
}

export default function CelestialSphereCanvas({ scrollProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071011, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Soft ambient teal + directional rim)
    const ambientLight = new THREE.AmbientLight(0x0B1719, 2.5);
    scene.add(ambientLight);

    const tealLight = new THREE.PointLight(0x73D8C4, 4.5, 20);
    tealLight.position.set(4, 3, 5);
    scene.add(tealLight);

    const backRimLight = new THREE.DirectionalLight(0xA5E8DE, 2.0);
    backRimLight.position.set(-5, -4, -4);
    scene.add(backRimLight);

    // 3. Main Celestial Body / Organic Sphere
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Core textured geometry with subdivision for displacement/organic cracks
    const coreGeo = new THREE.IcosahedronGeometry(2.1, 12);
    
    // Add procedural organic noise displacement to vertices
    const pos = coreGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Subtle organic noise variation
      const noise = (Math.sin(x * 3.5) * Math.cos(y * 3.5) * Math.sin(z * 3.5)) * 0.08;
      pos.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise));
    }
    coreGeo.computeVertexNormals();

    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x091B1D,
      emissive: 0x062121,
      emissiveIntensity: 0.6,
      roughness: 0.55,
      metalness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
      wireframe: false,
    });

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    sphereGroup.add(coreMesh);

    // Cracked Wireframe Shell overlay
    const wireGeo = new THREE.IcosahedronGeometry(2.13, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x73D8C4,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    sphereGroup.add(wireMesh);

    // 4. Orbit Rings (Thin geometric celestial circular lines)
    const ringGeo1 = new THREE.RingGeometry(3.2, 3.22, 128);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x73D8C4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2.3;
    ringMesh1.rotation.y = Math.PI / 6;
    sphereGroup.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(3.8, 3.815, 128);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x91A09E,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 2.8;
    ringMesh2.rotation.z = Math.PI / 8;
    sphereGroup.add(ringMesh2);

    // 5. Exploding / Transforming Talent Fragments (Scene 2)
    // 36 small translucent glass spheres representing people, talent, creativity, opportunities
    const fragmentCount = 38;
    const fragmentGroup = new THREE.Group();
    scene.add(fragmentGroup);

    const fragments: {
      mesh: THREE.Mesh;
      baseRadius: number;
      phi: number;
      theta: number;
      speed: number;
    }[] = [];

    const fragGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const fragMat = new THREE.MeshPhysicalMaterial({
      color: 0x73D8C4,
      emissive: 0x3CAFA0,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < fragmentCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / fragmentCount);
      const theta = Math.sqrt(fragmentCount * Math.PI) * phi;
      const mesh = new THREE.Mesh(fragGeo, fragMat.clone());
      const r = 2.4;
      mesh.position.set(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      );
      fragmentGroup.add(mesh);
      fragments.push({
        mesh,
        baseRadius: r,
        phi,
        theta,
        speed: 0.3 + Math.random() * 0.4
      });
    }

    // 6. Floating Ambient Particles & Distant Stars
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 18;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xA5E8DE,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse Parallax Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.4;
      targetMouseY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const scroll = scrollRef.current; // 0 to 1

      // Mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Organic slow rotation
      sphereGroup.rotation.y = elapsedTime * 0.12 + currentMouseX * 0.8;
      sphereGroup.rotation.x = elapsedTime * 0.06 + currentMouseY * 0.6;

      // Scroll-driven Transformation (Scene 1 -> Scene 2)
      // When scroll increases:
      // 1. Core sphere contracts slightly and increases wireframe crack intensity
      // 2. Fragments disperse outward into a constellation of opportunities
      const explosionProgress = Math.min(Math.max((scroll - 0.05) * 2.2, 0), 1);
      
      coreMesh.scale.setScalar(1 - explosionProgress * 0.35);
      coreMat.opacity = 1 - explosionProgress * 0.4;
      wireMesh.scale.setScalar(1 + explosionProgress * 0.4);
      wireMat.opacity = 0.22 + explosionProgress * 0.45;

      ringMesh1.rotation.z = elapsedTime * 0.08;
      ringMesh2.rotation.z = -elapsedTime * 0.05;

      // Animate talent fragments expanding outward
      fragments.forEach((frag, idx) => {
        const radius = frag.baseRadius + explosionProgress * (3.5 + (idx % 5) * 0.8);
        const thetaOffset = frag.theta + elapsedTime * frag.speed * 0.3;
        frag.mesh.position.set(
          radius * Math.cos(thetaOffset) * Math.sin(frag.phi),
          radius * Math.sin(thetaOffset) * Math.sin(frag.phi),
          radius * Math.cos(frag.phi)
        );
        frag.mesh.scale.setScalar(1 + explosionProgress * 0.6);
      });

      // Subtle particle float
      particles.rotation.y = elapsedTime * 0.015;
      particles.rotation.x = elapsedTime * 0.008;

      // Camera parallax
      camera.position.x = currentMouseX * 0.8;
      camera.position.y = currentMouseY * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
