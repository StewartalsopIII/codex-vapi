'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDemoScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(6, 4, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x3b82f6, 1.2, 25, 2);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0b1120'),
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);

    const knotGeometry = new THREE.TorusKnotGeometry(1.2, 0.35, 180, 24);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#34d399'),
      emissive: new THREE.Color('#0f766e'),
      metalness: 0.45,
      roughness: 0.25,
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    knot.castShadow = true;
    scene.add(knot);

    const orbitGroup = new THREE.Group();
    const ringRadius = 3.5;
    const orbitCount = 20;
    for (let i = 0; i < orbitCount; i += 1) {
      const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const hue = (i / orbitCount + 0.6) % 1;
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.7, 0.6),
        emissive: new THREE.Color().setHSL(hue, 0.35, 0.35),
        metalness: 0.35,
        roughness: 0.4,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const angle = (i / orbitCount) * Math.PI * 2;
      sphere.position.set(
        Math.cos(angle) * ringRadius,
        Math.sin(angle * 2.5) * 0.8,
        Math.sin(angle) * ringRadius,
      );
      sphere.castShadow = true;
      orbitGroup.add(sphere);
    }
    scene.add(orbitGroup);

    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 1] = (Math.random() - 0.2) * 40;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      const width = Math.max(clientWidth, 1);
      const height = Math.max(clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    const clock = new THREE.Clock();
    let animationFrameId = 0;
    const animatedSpheres = orbitGroup.children as THREE.Mesh<
      THREE.SphereGeometry,
      THREE.MeshStandardMaterial
    >[];

    let controls: { update: () => void; dispose: () => void } | undefined;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      knot.rotation.x = elapsed * 0.35;
      knot.rotation.y = elapsed * 0.5;

      orbitGroup.rotation.y = elapsed * 0.25;
      animatedSpheres.forEach((sphere, index) => {
        sphere.position.y = Math.sin(elapsed * 1.8 + index * 0.4) * 0.8;
        sphere.rotation.y += delta * 0.6;
      });

      stars.rotation.y = elapsed * 0.02;

      controls?.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    let mounted = true;
    import('three/examples/jsm/controls/OrbitControls.js')
      .then(({ OrbitControls }) => {
        if (!mounted) {
          return;
        }
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.06;
        orbitControls.minDistance = 2;
        orbitControls.maxDistance = 14;
        orbitControls.target.set(0, 0, 0);
        controls = orbitControls;
      })
      .catch(() => {
        /* OrbitControls are optional; keep base animation if import fails. */
      });

    return () => {
      mounted = false;
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resize);
      }
      controls?.dispose();
      container.removeChild(renderer.domElement);

      knotGeometry.dispose();
      knotMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();

      animatedSpheres.forEach((sphere) => {
        sphere.geometry.dispose();
        sphere.material.dispose();
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-blue-950/40 to-emerald-950/60 shadow-2xl"
    >
      <div className="pointer-events-none absolute inset-x-12 bottom-10 z-10 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h3 className="text-lg font-semibold text-white">Three.js Showcase</h3>
        <p className="mt-2 text-sm text-slate-200/90">
          Explore a dynamic scene powered by physically based lighting, animated geometry, and star field
          particles. Drag to orbit, scroll to zoom, and highlight how Three.js brings WebGL to life.
        </p>
      </div>
    </div>
  );
}
