'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  progressRef: React.MutableRefObject<number>;
}

export default function FixedIntroSphereCanvas({ progressRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071011, 0.035);

    const isMobile = width < 768;
    const baseCameraZ = isMobile ? 8.2 : 6.6;

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
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x071011, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x73D8C4, 1.8);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xA5E8DE, 1.0);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    // Interior cluster point lights
    const corePointLight1 = new THREE.PointLight(0x73D8C4, 0, 16);
    corePointLight1.position.set(0, 0, 0);
    scene.add(corePointLight1);

    const corePointLight2 = new THREE.PointLight(0xA5E8DE, 0, 14);
    corePointLight2.position.set(0, 0.5, 0);
    scene.add(corePointLight2);

    // 3. Master Groups
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Group for the outer dividing shell
    const outerShellGroup = new THREE.Group();
    masterGroup.add(outerShellGroup);

    // Group for the inner transparent glowing glass sphere cluster
    const clusterGroup = new THREE.Group();
    clusterGroup.scale.setScalar(0.001); // starts invisible
    masterGroup.add(clusterGroup);

    // 4. Outer Sphere Shell Segments (8 Quadrants)
    // Symmetrical, tight seamless sphere of radius 2.0 when closed
    const shellRadius = 2.0;
    const petals: {
      group: THREE.Group;
      dir: THREE.Vector3;
      rotAxis: THREE.Vector3;
      innerMat: THREE.MeshBasicMaterial;
      outerMat: THREE.MeshPhysicalMaterial;
    }[] = [];

    const baseShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x091618,
      emissive: 0x040D0E,
      emissiveIntensity: 0.4,
      roughness: 0.22,
      metalness: 0.88,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 1.0,
      reflectivity: 0.85
    });

    for (let isLower = 0; isLower <= 1; isLower++) {
      const thetaStart = isLower === 0 ? 0 : Math.PI / 2;
      const thetaLength = Math.PI / 2;

      for (let q = 0; q < 4; q++) {
        const phiStart = (q * Math.PI) / 2;
        const phiLength = Math.PI / 2;

        const petalGroup = new THREE.Group();

        // Outer surface
        const petalGeo = new THREE.SphereGeometry(
          shellRadius,
          26,
          18,
          phiStart,
          phiLength,
          thetaStart,
          thetaLength
        );
        const petalMesh = new THREE.Mesh(petalGeo, baseShellMat.clone());
        petalGroup.add(petalMesh);

        // Inner glowing lining
        const innerGeo = new THREE.SphereGeometry(
          shellRadius - 0.04,
          14,
          10,
          phiStart,
          phiLength,
          thetaStart,
          thetaLength
        );
        const innerMat = new THREE.MeshBasicMaterial({
          color: 0x73D8C4,
          wireframe: true,
          transparent: true,
          opacity: 0.2
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        petalGroup.add(innerMesh);

        // Calculate quadrant center direction vector
        const midPhi = phiStart + phiLength / 2;
        const midTheta = thetaStart + thetaLength / 2;
        const dir = new THREE.Vector3(
          Math.sin(midTheta) * Math.cos(midPhi),
          Math.cos(midTheta),
          Math.sin(midTheta) * Math.sin(midPhi)
        ).normalize();

        const rotAxis = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

        outerShellGroup.add(petalGroup);
        petals.push({
          group: petalGroup,
          dir,
          rotAxis,
          innerMat,
          outerMat: petalMesh.material as THREE.MeshPhysicalMaterial
        });
      }
    }

    // Glowing Seam Lines (visible as cracks before opening)
    const seamGroup = new THREE.Group();
    outerShellGroup.add(seamGroup);

    const seamMat = new THREE.LineBasicMaterial({
      color: 0x73D8C4,
      transparent: true,
      opacity: 0.0
    });

    // Equator ring
    const equatorGeo = new THREE.BufferGeometry();
    const eqPts: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      eqPts.push(shellRadius * 1.002 * Math.cos(a), 0, shellRadius * 1.002 * Math.sin(a));
    }
    equatorGeo.setAttribute('position', new THREE.Float32BufferAttribute(eqPts, 3));
    seamGroup.add(new THREE.Line(equatorGeo, seamMat));

    // Meridian ring 1
    const m1Geo = new THREE.BufferGeometry();
    const m1Pts: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      m1Pts.push(shellRadius * 1.002 * Math.cos(a), shellRadius * 1.002 * Math.sin(a), 0);
    }
    m1Geo.setAttribute('position', new THREE.Float32BufferAttribute(m1Pts, 3));
    seamGroup.add(new THREE.Line(m1Geo, seamMat));

    // Meridian ring 2
    const m2Geo = new THREE.BufferGeometry();
    const m2Pts: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      m2Pts.push(0, shellRadius * 1.002 * Math.sin(a), shellRadius * 1.002 * Math.cos(a));
    }
    m2Geo.setAttribute('position', new THREE.Float32BufferAttribute(m2Pts, 3));
    seamGroup.add(new THREE.Line(m2Geo, seamMat));

    // 5. INNER GLASS SPHERE CLUSTER (Forms at 3.0–4.0s / progress 0.40–0.70)
    // Central primary glass sphere + orbiting satellite glass spheres
    const glassSphereMeshes: {
      mesh: THREE.Mesh;
      targetPos: THREE.Vector3;
      baseRadius: number;
      orbitSpeed: number;
      orbitOffset: number;
    }[] = [];

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x73D8C4,
      emissive: 0x1B6B5D,
      emissiveIntensity: 0.6,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.92,
      ior: 1.52,
      thickness: 1.2,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06
    });

    // Central Glass Sphere
    const centerGeo = new THREE.SphereGeometry(0.78, 32, 32);
    const centerMesh = new THREE.Mesh(centerGeo, glassMat.clone());
    clusterGroup.add(centerMesh);
    glassSphereMeshes.push({
      mesh: centerMesh,
      targetPos: new THREE.Vector3(0, 0, 0),
      baseRadius: 0.78,
      orbitSpeed: 0,
      orbitOffset: 0
    });

    // Satellite Glass Spheres forming the celestial cluster
    const clusterDefinitions = [
      { radius: 0.42, target: new THREE.Vector3(1.15, 0.4, 0.3), speed: 0.4, offset: 0 },
      { radius: 0.36, target: new THREE.Vector3(-1.05, -0.35, 0.4), speed: -0.35, offset: 1.2 },
      { radius: 0.32, target: new THREE.Vector3(0.3, 1.1, -0.35), speed: 0.5, offset: 2.1 },
      { radius: 0.38, target: new THREE.Vector3(-0.4, -1.05, -0.3), speed: -0.45, offset: 3.4 },
      { radius: 0.26, target: new THREE.Vector3(0.85, -0.75, 0.5), speed: 0.6, offset: 4.2 },
      { radius: 0.28, target: new THREE.Vector3(-0.8, 0.8, -0.4), speed: -0.5, offset: 5.1 },
      { radius: 0.22, target: new THREE.Vector3(0.0, 0.2, 1.2), speed: 0.3, offset: 0.8 }
    ];

    clusterDefinitions.forEach((def) => {
      const gGeo = new THREE.SphereGeometry(def.radius, 24, 24);
      const gMat = glassMat.clone();
      const gMesh = new THREE.Mesh(gGeo, gMat);
      clusterGroup.add(gMesh);
      glassSphereMeshes.push({
        mesh: gMesh,
        targetPos: def.target,
        baseRadius: def.radius,
        orbitSpeed: def.speed,
        orbitOffset: def.offset
      });
    });

    // Inner wireframe energy ring inside cluster
    const clusterWireGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const clusterWireMat = new THREE.MeshBasicMaterial({
      color: 0xA5E8DE,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const clusterWireMesh = new THREE.Mesh(clusterWireGeo, clusterWireMat);
    clusterGroup.add(clusterWireMesh);

    // 6. Floating Ambient & Core Stardust Particle System
    const particleCount = 320;
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
        x: px * 0.0025 + (Math.random() - 0.5) * 0.0015,
        y: py * 0.0025 + (Math.random() - 0.5) * 0.0015,
        z: pz * 0.0025 + (Math.random() - 0.5) * 0.0015
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xA5E8DE,
      size: 0.032,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // 7. Mouse Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.35;
      targetMouseY = y * 0.25;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      const isMob = w < 768;
      camera.position.z = isMob ? 8.2 : 6.6;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. ANIMATION LOOP SYNCHRONIZED TO SCROLL PROGRESS
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const scroll = Math.min(Math.max(progressRef.current, 0), 1);

      // Smooth mouse lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Master rotation (base organic rotation + scroll acceleration)
      masterGroup.rotation.y = elapsedTime * 0.08 + scroll * Math.PI * 1.5 + currentMouseX * 0.5;
      masterGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.06 + scroll * 0.35 + currentMouseY * 0.35;

      // =========================================================================
      // STEP 3 PHASES (Exact timeline mapped from 0.0 to 1.0)
      // =========================================================================

      // Phase 1 (0.0 to 0.10): Closed sphere, subtle rotation, minimal particles
      // Seam cracks illuminate between 0.07 and 0.25
      const crackProgress = Math.min(Math.max((scroll - 0.06) / 0.18, 0), 1);
      seamMat.opacity = crackProgress * 0.9;

      // Phase 2 & 3 (0.15 to 0.55): Shell opens, outer fragments move outward
      const openProgress = Math.min(Math.max((scroll - 0.14) / 0.36, 0), 1);
      const easedOpen = 1 - Math.pow(1 - openProgress, 3);

      // Camera pushes slightly closer
      const isMob = container.clientWidth < 768;
      const baseZ = isMob ? 8.2 : 6.6;
      camera.position.z = baseZ - easedOpen * (isMob ? 0.9 : 1.3);

      // Petal translation & outward tilt
      const petalDisp = easedOpen * 2.4;
      const petalTilt = easedOpen * 0.5;

      // Outer petals dissolve/fade as the cluster takes center stage (0.40 to 0.65)
      const shellFadeProgress = Math.min(Math.max((scroll - 0.38) / 0.24, 0), 1);
      const shellOpacity = Math.max(0, 1 - shellFadeProgress);

      petals.forEach((p) => {
        p.group.position.copy(p.dir.clone().multiplyScalar(petalDisp));
        p.group.quaternion.setFromAxisAngle(p.rotAxis, p.dir.y > 0 ? petalTilt : -petalTilt);
        p.outerMat.opacity = shellOpacity;
        p.innerMat.opacity = shellOpacity * 0.25;
      });

      // Seam lines disappear once separated
      if (openProgress > 0.05) {
        seamMat.opacity = Math.max(0, 0.9 - (openProgress - 0.05) * 6);
      }

      // Phase 4: Inner Core Transforms into Cluster of Transparent Glass Spheres (0.30 to 0.70)
      const clusterFormProgress = Math.min(Math.max((scroll - 0.28) / 0.32, 0), 1);
      const easedCluster = 1 - Math.pow(1 - clusterFormProgress, 3);

      clusterGroup.scale.setScalar(easedCluster);

      // Core lights intensify
      corePointLight1.intensity = easedCluster * 8.0;
      corePointLight2.intensity = easedCluster * 5.0;

      // Satellite spheres spread out smoothly to their cluster targets
      glassSphereMeshes.forEach((g) => {
        if (g.orbitSpeed === 0) {
          // Central sphere pulses gently
          const cScale = 1 + Math.sin(elapsedTime * 2.0) * 0.03;
          g.mesh.scale.setScalar(cScale);
        } else {
          // Satellite spheres interpolate to targets + gentle orbital rotation
          const orbitAngle = elapsedTime * g.orbitSpeed * 0.25 + g.orbitOffset;
          const curTarget = g.targetPos.clone();
          curTarget.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitAngle * 0.2);
          g.mesh.position.copy(curTarget.multiplyScalar(easedCluster));
        }
      });

      clusterWireMesh.rotation.y = elapsedTime * 0.15;
      clusterWireMesh.rotation.z = elapsedTime * 0.08;

      // Phase 5 & 6 (0.65 to 0.88): Cluster settles in center, frames typography
      if (scroll > 0.65 && scroll < 0.92) {
        // Floating gentle breathing
        clusterGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.08;
      }

      // Phase 7: Intro Completion (0.92 to 1.0):
      // Fade cluster into particles and hand off cleanly to next section
      if (scroll >= 0.92) {
        const exitProgress = (scroll - 0.92) / 0.08;
        const exitScale = Math.max(0, 1 - exitProgress * 0.85);
        clusterGroup.scale.setScalar(exitScale * easedCluster);
        
        glassSphereMeshes.forEach((g) => {
          (g.mesh.material as THREE.MeshPhysicalMaterial).opacity = Math.max(0, 0.95 * (1 - exitProgress));
        });
        clusterWireMat.opacity = Math.max(0, 0.35 * (1 - exitProgress));
        corePointLight1.intensity = 8.0 * (1 - exitProgress);
        corePointLight2.intensity = 5.0 * (1 - exitProgress);
      } else {
        glassSphereMeshes.forEach((g) => {
          (g.mesh.material as THREE.MeshPhysicalMaterial).opacity = 0.95;
        });
        clusterWireMat.opacity = 0.35;
      }

      // Particles flow and sparkle
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        posAttr.setXYZ(
          i,
          posAttr.getX(i) + vel.x * (1 + easedOpen * 2.5),
          posAttr.getY(i) + vel.y * (1 + easedOpen * 2.5),
          posAttr.getZ(i) + vel.z * (1 + easedOpen * 2.5)
        );
      }
      posAttr.needsUpdate = true;
      particleMat.opacity = 0.3 + easedCluster * 0.35;

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
  }, [progressRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
