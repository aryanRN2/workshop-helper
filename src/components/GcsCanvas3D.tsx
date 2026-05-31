"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GcsCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 40;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- Geometries & Materials ---
    
    // Central Wireframe Sphere (Cloud Storage)
    const sphereGeo = new THREE.IcosahedronGeometry(12, 1);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const mainSphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(mainSphere);

    // Outer Orbiting Nodes
    const nodesGroup = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xa155e8 });
    const nodesCount = 15;
    const nodePositions: THREE.Vector3[] = [];

    for (let i = 0; i < nodesCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 16 + Math.random() * 4; // Orbit radius
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      nodesGroup.add(node);
      nodePositions.push(node.position);
    }
    scene.add(nodesGroup);

    // Dynamic Connections (Orbit Lines)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.05,
    });

    nodePositions.forEach((pos) => {
      const points = [new THREE.Vector3(0, 0, 0), pos];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });

    // Particle Cloud (Eventarc Data Packets)
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const speeds: number[] = [];

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Random coordinates in a shell
      const r = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
      
      speeds.push(0.02 + Math.random() * 0.05);
    }

    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.6,
    });

    const starField = new THREE.Points(particlesGeo, particlesMat);
    scene.add(starField);

    // --- Interactive Mouse Effect ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / 100;
      mouseY = (e.clientY - window.innerHeight / 2) / 100;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Sphere Rotations
      mainSphere.rotation.y += 0.001;
      mainSphere.rotation.x += 0.0005;

      // Group Orbits
      nodesGroup.rotation.y -= 0.0015;
      nodesGroup.rotation.z += 0.0005;

      // Mouse Interpolation (Camera Tilt)
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose Geometries and Materials
      sphereGeo.dispose();
      sphereMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="canvas-container" />;
}
