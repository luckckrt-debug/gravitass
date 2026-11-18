'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function EcosystemNetworkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071011, 0.05);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x071011, 2.0);
    scene.add(ambientLight);

    const tealP1 = new THREE.PointLight(0x73D8C4, 4.0, 18);
    tealP1.position.set(3, 4, 3);
    scene.add(tealP1);

    const tealP2 = new THREE.PointLight(0xA5E8DE, 3.0, 15);
    tealP2.position.set(-4, -3, 2);
    scene.add(tealP2);

    // 6 Primary Nodes representing Core Disciplines:
    // AI, Code, Design, Video, Business, Creativity
    const nodesData = [
      { label: 'AI & Automation', pos: new THREE.Vector3(-2.8, 1.8, 0), size: 0.65, color: 0x73D8C4 },
      { label: 'Code & Tech', pos: new THREE.Vector3(2.6, 2.0, -0.5), size: 0.75, color: 0xA5E8DE },
      { label: 'Design & Visual', pos: new THREE.Vector3(-3.2, -1.6, -0.8), size: 0.6, color: 0x73D8C4 },
      { label: 'Video & Motion', pos: new THREE.Vector3(3.0, -1.4, 0.2), size: 0.68, color: 0xA5E8DE },
      { label: 'Business & Ops', pos: new THREE.Vector3(0.1, -2.4, -1.0), size: 0.55, color: 0x73D8C4 },
      { label: 'Creativity & Logic', pos: new THREE.Vector3(-0.2, 2.8, -1.2), size: 0.58, color: 0xA5E8DE }
    ];

    const group = new THREE.Group();
    scene.add(group);

    const sphereMeshes: { mesh: THREE.Mesh; initialY: number; speed: number; rotSpeed: number }[] = [];

    // Glass material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x091C1E,
      emissive: 0x0C2829,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.85
    });

    // Inner wireframe glow
    const innerWireMat = new THREE.MeshBasicMaterial({
      color: 0x73D8C4,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });

    nodesData.forEach((node, i) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(node.pos);

      // Glass sphere
      const sphGeo = new THREE.SphereGeometry(node.size, 24, 24);
      const sphMesh = new THREE.Mesh(sphGeo, glassMat.clone());
      nodeGroup.add(sphMesh);

      // Inner wireframe sphere
      const innerGeo = new THREE.IcosahedronGeometry(node.size * 0.75, 1);
      const innerMesh = new THREE.Mesh(innerGeo, innerWireMat.clone());
      nodeGroup.add(innerMesh);

      // Subtle outer orbital ring
      const ringGeo = new THREE.RingGeometry(node.size * 1.3, node.size * 1.32, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x73D8C4,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / (2 + i * 0.2);
      nodeGroup.add(ringMesh);

      group.add(nodeGroup);
      sphereMeshes.push({
        mesh: nodeGroup as any,
        initialY: node.pos.y,
        speed: 0.4 + Math.random() * 0.3,
        rotSpeed: 0.005 + (i % 2 === 0 ? 0.004 : -0.004)
      });
    });

    // Thin glowing connection lines between nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x73D8C4,
      transparent: true,
      opacity: 0.25
    });

    const linePositions: number[] = [];
    for (let i = 0; i < nodesData.length; i++) {
      for (let j = i + 1; j < nodesData.length; j++) {
        linePositions.push(
          nodesData[i].pos.x, nodesData[i].pos.y, nodesData[i].pos.z,
          nodesData[j].pos.x, nodesData[j].pos.y, nodesData[j].pos.z
        );
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Parallax rotation
      group.rotation.y += (mouseX * 0.25 - group.rotation.y) * 0.05;
      group.rotation.x += (-mouseY * 0.2 - group.rotation.x) * 0.05;

      // Floating spheres
      sphereMeshes.forEach((item, idx) => {
        item.mesh.position.y = item.initialY + Math.sin(elapsed * item.speed + idx) * 0.12;
        item.mesh.rotation.y += item.rotSpeed;
      });

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />
  );
}
