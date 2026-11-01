import { useEffect, useRef } from "react";
import * as THREE from "three";
import { animateRobot, createRobot, disposeRobot, type RobotMode } from "./robot";
import type { LevelPalette } from "../game/levels";

interface RobotStageProps {
  mode?: RobotMode;
  colors: LevelPalette;
  className?: string;
  compact?: boolean;
}

export default function RobotStage({ mode = "idle", colors, className = "", compact = false }: RobotStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<RobotMode>(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    const cameraY = compact ? 1.45 : 1.72;
    camera.position.set(0, cameraY, compact ? -4.2 : -5.2);
    camera.lookAt(0, 1.05, 0);

    scene.add(new THREE.HemisphereLight(0xd8ecff, 0x17102e, 2.1));

    const key = new THREE.DirectionalLight(0xfff4dd, 3.1);
    key.position.set(-2.8, 5, -4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 14;
    key.shadow.camera.left = -3.5;
    key.shadow.camera.right = 3.5;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -1;
    scene.add(key);

    const rim = new THREE.PointLight(new THREE.Color(colors.accent), 22, 12, 2);
    rim.position.set(2.6, 2.2, 2.4);
    scene.add(rim);

    const warm = new THREE.PointLight(new THREE.Color(colors.glow), 15, 10, 2);
    warm.position.set(-2.4, 1.1, -2);
    scene.add(warm);

    // Pedestal
    const pedestal = new THREE.Group();
    scene.add(pedestal);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.32, 1.5, 0.22, 48),
      new THREE.MeshStandardMaterial({ color: 0x121a35, roughness: 0.3, metalness: 0.65 }),
    );
    base.position.y = -0.1;
    base.receiveShadow = true;
    pedestal.add(base);

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.24, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: 0x1c2b4f, roughness: 0.22, metalness: 0.6 }),
    );
    top.position.y = 0.03;
    top.receiveShadow = true;
    pedestal.add(top);

    const rimRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.19, 0.035, 10, 64),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors.accent),
        emissive: new THREE.Color(colors.accent),
        emissiveIntensity: 2.4,
        roughness: 0.3,
      }),
    );
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.y = 0.09;
    pedestal.add(rimRing);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.012, 8, 72),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(colors.glow), transparent: true, opacity: 0.5 }),
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.02;
    pedestal.add(outerRing);

    // Holographic arc behind the robot
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.018, 8, 72, Math.PI * 1.25),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.accent),
        transparent: true,
        opacity: 0.55,
      }),
    );
    arc.position.set(0, 1.55, 0.55);
    arc.rotation.z = Math.PI * 0.38;
    scene.add(arc);

    // Floating decorative geometry
    const floating: THREE.Mesh[] = [];
    const gemColors = [colors.accent, colors.glow, "#ffffff"];
    for (let i = 0; i < 9; i += 1) {
      const size = 0.05 + Math.random() * 0.075;
      const mesh = new THREE.Mesh(
        i % 3 === 0 ? new THREE.OctahedronGeometry(size, 0) : new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(gemColors[i % gemColors.length]),
          emissive: new THREE.Color(gemColors[i % gemColors.length]),
          emissiveIntensity: 1.1,
          roughness: 0.3,
        }),
      );
      const angle = (i / 9) * Math.PI * 2;
      const radius = 1.7 + Math.random() * 0.65;
      mesh.position.set(Math.cos(angle) * radius, 0.5 + Math.random() * 2.2, Math.sin(angle) * radius * 0.55);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      mesh.userData.speed = 0.25 + Math.random() * 0.5;
      mesh.userData.phase = Math.random() * Math.PI * 2;
      mesh.userData.baseY = mesh.position.y;
      scene.add(mesh);
      floating.push(mesh);
    }

    const rig = createRobot();
    rig.group.scale.setScalar(compact ? 0.92 : 1.08);
    rig.group.position.y = compact ? 0.06 : 0.09;
    scene.add(rig.group);

    // A soft blob shadow under the robot
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.82, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.075;
    scene.add(shadow);

    const clock = new THREE.Clock();
    let frame = 0;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const render = () => {
      const time = clock.getElapsedTime();
      animateRobot(rig, time, modeRef.current, 1);
      rig.group.position.y = 0.09 + (modeRef.current === "celebrate" ? Math.abs(Math.sin(time * 5.2)) * 0.16 : 0);

      pedestal.rotation.y = time * 0.08;
      arc.rotation.y = Math.sin(time * 0.35) * 0.16;
      rimRing.material as THREE.MeshStandardMaterial;
      (rimRing.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(time * 2.2) * 0.6;

      floating.forEach((mesh) => {
        mesh.rotation.x += 0.004;
        mesh.rotation.y += 0.007;
        mesh.position.y =
          (mesh.userData.baseY as number) + Math.sin(time * (mesh.userData.speed as number) + (mesh.userData.phase as number)) * 0.09;
      });

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      disposeRobot(rig);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [colors, compact]);

  return <div ref={mountRef} className={`h-full w-full ${className}`} aria-hidden="true" />;
}
