'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  scrollProgress: number; // 0 to 1
}

export default function ScrollOpeningSphereCanvas({ scrollProgress }: Props) {
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
    scene.fog = new THREE.FogExp2(0x071011, 0.04);

    const isMobile = width < 768;
    const baseCameraZ = isMobile ? 8.4 : 6.8;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, baseCameraZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x071011, 2.0);
    scene.add(ambientLight);

    // Subtle outer teal rim light
    const keyLight = new THREE.DirectionalLight(0x73D8C4, 1.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xA5E8DE, 0.9);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    // Glowing Inner Core Point Lights (brightens as sphere opens)
    const corePointLight1 = new THREE.PointLight(0x73D8C4, 0, 15);
    corePointLight1.position.set(0, 0, 0);
    scene.add(corePointLight1);

    const corePointLight2 = new THREE.PointLight(0xA5E8DE, 0, 12);
    corePointLight2.position.set(0, 0.2, 0);
    scene.add(corePointLight2);

    // 3. Central Sphere Master Group
    const masterSphereGroup = new THREE.Group();
    scene.add(masterSphereGroup);

    // 4. Inner Luminous Core (Hidden when closed, reveals when opening)
    const coreGeo = new THREE.IcosahedronGeometry(1.05, 5);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x73D8C4,
      emissive: 0x48B8A4,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterSphereGroup.add(coreMesh);

    // Core Wireframe Energy Shield
    const coreWireGeo = new THREE.IcosahedronGeometry(1.15, 2);
    const coreWireMat = new THREE.MeshBasicMaterial({
      color: 0xA5E8DE,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const coreWireMesh = new THREE.Mesh(coreWireGeo, coreWireMat);
    masterSphereGroup.add(coreWireMesh);

    // 5. Eight Symmetrical Outer Shell Petals
    // When closed at openingProgress = 0, these 8 segments fit seamlessly into a closed sphere (radius = 2.0)
    const radius = 2.0;
    const petals: {
      group: THREE.Group;
      dir: THREE.Vector3;
      rotAxis: THREE.Vector3;
      innerMat: THREE.MeshBasicMaterial;
      outerMat: THREE.MeshPhysicalMaterial;
    }[] = [];

    const outerShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x0A191B,
      emissive: 0x051314,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.2,
      reflectivity: 0.8
    });

    // 4 Upper Quadrants + 4 Lower Quadrants
    for (let isLower = 0; isLower <= 1; isLower++) {
      const thetaStart = isLower === 0 ? 0 : Math.PI / 2;
      const thetaLength = Math.PI / 2;
      const ySign = isLower === 0 ? 1 : -1;

      for (let q = 0; q < 4; q++) {
        const phiStart = (q * Math.PI) / 2;
        const phiLength = Math.PI / 2;

        const petalGroup = new THREE.Group();

        // Outer surface of the petal
        const petalGeo = new THREE.SphereGeometry(
          radius,
          24,
          16,
          phiStart,
          phiLength,
          thetaStart,
          thetaLength
        );
        const petalMesh = new THREE.Mesh(petalGeo, outerShellMat.clone());
        petalGroup.add(petalMesh);

        // Inner glowing lining & wireframe
        const innerGeo = new THREE.SphereGeometry(
          radius - 0.04,
          12,
          8,
          phiStart,
          phiLength,
          thetaStart,
          thetaLength
        );
        const innerWireMat = new THREE.MeshBasicMaterial({
          color: 0x73D8C4,
          wireframe: true,
          transparent: true,
          opacity: 0.15
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerWireMat);
        petalGroup.add(innerMesh);

        // Calculate quadrant normal direction vector
        const midPhi = phiStart + phiLength / 2;
        const midTheta = thetaStart + thetaLength / 2;
        const dir = new THREE.Vector3(
          Math.sin(midTheta) * Math.cos(midPhi),
          Math.cos(midTheta),
          Math.sin(midTheta) * Math.sin(midPhi)
        ).normalize();

        // Tangent rotation axis for blooming
        const rotAxis = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

        masterSphereGroup.add(petalGroup);
        petals.push({
          group: petalGroup,
          dir,
          rotAxis,
          innerMat: innerWireMat,
          outerMat: petalMesh.material as THREE.MeshPhysicalMaterial
        });
      }
    }

    // 6. Glowing Seam Lines (Cracks that illuminate right before opening)
    const seamGroup = new THREE.Group();
    masterSphereGroup.add(seamGroup);

    const seamMat = new THREE.LineBasicMaterial({
      color: 0x73D8C4,
      transparent: true,
      opacity: 0.0
    });

    // Equator circle
    const equatorGeo = new THREE.BufferGeometry();
    const equatorPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      equatorPts.push(radius * 1.002 * Math.cos(a), 0, radius * 1.002 * Math.sin(a));
    }
    equatorGeo.setAttribute('position', new THREE.Float32BufferAttribute(equatorPts, 3));
    const equatorLine = new THREE.Line(equatorGeo, seamMat);
    seamGroup.add(equatorLine);

    // Meridian circles
    const meridian1Geo = new THREE.BufferGeometry();
    const meridian1Pts: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      meridian1Pts.push(radius * 1.002 * Math.cos(a), radius * 1.002 * Math.sin(a), 0);
    }
    meridian1Geo.setAttribute('position', new THREE.Float32BufferAttribute(meridian1Pts, 3));
    const meridian1Line = new THREE.Line(meridian1Geo, seamMat);
    seamGroup.add(meridian1Line);

    const meridian2Geo = new THREE.BufferGeometry();
    const meridian2Pts: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      meridian2Pts.push(0, radius * 1.002 * Math.sin(a), radius * 1.002 * Math.cos(a));
    }
    meridian2Geo.setAttribute('position', new THREE.Float32BufferAttribute(meridian2Pts, 3));
    const meridian2Line = new THREE.Line(meridian2Geo, seamMat);
    seamGroup.add(meridian2Line);

    // 7. Floating Outer Stardust & Core Emitted Particles
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.0 + Math.random() * 6.5;

      const px = r * Math.sin(phi) * Math.cos(theta);
      const py = r * Math.sin(phi) * Math.sin(theta);
      const pz = r * Math.cos(phi);

      particlePositions[i] = px;
      particlePositions[i + 1] = py;
      particlePositions[i + 2] = pz;

      particleVelocities.push({
        x: px * 0.003 + (Math.random() - 0.5) * 0.002,
        y: py * 0.003 + (Math.random() - 0.5) * 0.002,
        z: pz * 0.003 + (Math.random() - 0.5) * 0.002
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xA5E8DE,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterSphereGroup.add(particles);

    // 8. Mouse Parallax
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

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop (Strictly synchronized with scroll progress)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const scroll = scrollRef.current; // 0.0 to 1.0

      // Mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Base slow organic idle rotation + scroll-driven acceleration
      masterSphereGroup.rotation.y = elapsedTime * 0.08 + scroll * Math.PI * 1.8 + currentMouseX * 0.6;
      masterSphereGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.08 + scroll * 0.4 + currentMouseY * 0.4;

      // =========================================================================
      // SCROLL STAGE 1 (0.0 to 0.15): CLOSED SPHERE
      // Sphere is completely closed, subtle crack glow starts near 0.12
      // =========================================================================
      const crackPhase = Math.min(Math.max((scroll - 0.05) / 0.15, 0), 1);
      seamMat.opacity = crackPhase * 0.85;

      // =========================================================================
      // SCROLL STAGE 2 & 3 (0.15 to 0.70): OPENING & BLOOMING
      // Outer petals detach and translate outward along normal vector
      // Core lights power up and radiate outward
      // =========================================================================
      const openProgress = Math.min(Math.max((scroll - 0.15) / 0.45, 0), 1);
      
      // Smooth easing (cubic-bezier out)
      const easedOpen = 1 - Math.pow(1 - openProgress, 3);

      // Camera subtly dollys in
      const isMobileNow = container.clientWidth < 768;
      const baseZ = isMobileNow ? 8.4 : 6.8;
      camera.position.z = baseZ - easedOpen * (isMobileNow ? 1.0 : 1.4);

      // Core lights intensify as the shell cracks open
      corePointLight1.intensity = easedOpen * 8.0;
      corePointLight2.intensity = easedOpen * 5.0;

      // Core pulse
      const coreScale = 1 + Math.sin(elapsedTime * 2.5) * 0.03 + easedOpen * 0.35;
      coreMesh.scale.setScalar(coreScale);
      coreWireMesh.scale.setScalar(coreScale * 1.08);
      coreWireMesh.rotation.y = elapsedTime * 0.2;
      coreWireMesh.rotation.z = elapsedTime * 0.1;

      // Translate & Tilt Each of the 8 Petals Outward Symmetrically
      const petalDisp = easedOpen * 2.2; // distance moved away from center
      const petalTilt = easedOpen * 0.45; // angle rotated outward

      petals.forEach((p) => {
        // Translation along normal vector
        p.group.position.copy(p.dir.clone().multiplyScalar(petalDisp));

        // Tilt rotation away from center
        p.group.quaternion.setFromAxisAngle(p.rotAxis, p.dir.y > 0 ? petalTilt : -petalTilt);

        // Enhance inner wireframe visibility when open
        p.innerMat.opacity = 0.15 + easedOpen * 0.45;
        p.outerMat.roughness = 0.25 - easedOpen * 0.1;
      });

      // Seam lines disappear once petals detach
      if (openProgress > 0.05) {
        seamMat.opacity = Math.max(0, 0.85 - (openProgress - 0.05) * 5);
      }

      // Particles flow outward from the core
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        const idx = i * 3;
        posAttr.setXYZ(
          i,
          posAttr.getX(i) + vel.x * (1 + easedOpen * 3.5),
          posAttr.getY(i) + vel.y * (1 + easedOpen * 3.5),
          posAttr.getZ(i) + vel.z * (1 + easedOpen * 3.5)
        );
      }
      posAttr.needsUpdate = true;
      particleMat.opacity = 0.35 + easedOpen * 0.4;

      // =========================================================================
      // SCROLL STAGE 4 & 5 (0.70 to 1.0): REPOSITION FOR TEXT & TRANSITION
      // Sphere gently floats slightly upward or recedes to frame the hero text
      // =========================================================================
      if (scroll > 0.65) {
        const recedePhase = Math.min((scroll - 0.65) / 0.35, 1);
        masterSphereGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.1 - recedePhase * 0.4;
      } else {
        masterSphereGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08;
      }

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
