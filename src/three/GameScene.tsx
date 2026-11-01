import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { LevelConfig } from "../game/levels";
import type { Question } from "../game/questions";
import { animateRobot, createRobot, disposeRobot, type RobotMode } from "./robot";

export type Feedback = "correct" | "wrong" | null;

export interface GameSceneProps {
  level: LevelConfig;
  question: Question;
  runId: number;
  commitId: number;
  committed: boolean;
  paused: boolean;
  mode: RobotMode;
  targetLane: number;
  feedback: Feedback;
  roundDuration: number;
  onGatePass: (lane: number) => void;
  onTime: (secondsLeft: number) => void;
}

const LANE_X = [-2.35, 0, 2.35];
const LANE_COLORS = [0xef445b, 0x3b82f6, 0x22c55e];
const LANE_HEX = ["#ef445b", "#3b82f6", "#22c55e"];
const LANE_LETTERS = ["A", "B", "C"];

type GateRig = {
  group: THREE.Group;
  sign: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  pillars: THREE.MeshStandardMaterial[];
  lanePad: THREE.MeshBasicMaterial;
  lane: number;
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function numberTexture(value: number, lane: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const color = LANE_HEX[lane];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = color;
    ctx.shadowBlur = 28;
    roundedRect(ctx, 18, 18, 604, 324, 62);
    ctx.fillStyle = "#071127";
    ctx.fill();
    ctx.shadowBlur = 0;

    const gradient = ctx.createLinearGradient(0, 0, 640, 360);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}aa`);
    roundedRect(ctx, 26, 26, 588, 308, 54);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    roundedRect(ctx, 26, 26, 588, 308, 54);
    ctx.stroke();

    // Letter chip
    ctx.beginPath();
    ctx.arc(92, 98, 43, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(5,12,28,0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 48px 'Fredoka', 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(LANE_LETTERS[lane], 92, 101);

    ctx.font = "700 205px 'Fredoka', 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 15;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.strokeText(String(value), 350, 190);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(value), 350, 190);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createGate(lane: number): GateRig {
  const group = new THREE.Group();
  group.position.set(LANE_X[lane], 0, -40);

  const color = new THREE.Color(LANE_COLORS[lane]);
  const pillars: THREE.MeshStandardMaterial[] = [];
  const pillarGeo = new THREE.BoxGeometry(0.17, 3.0, 0.2);

  [-1, 1].forEach((side) => {
    const material = new THREE.MeshStandardMaterial({
      color: 0x15223f,
      metalness: 0.65,
      roughness: 0.28,
      emissive: color,
      emissiveIntensity: 0.55,
    });
    pillars.push(material);
    const pillar = new THREE.Mesh(pillarGeo, material);
    pillar.position.set(side * 1.02, 1.5, 0);
    pillar.castShadow = true;
    group.add(pillar);

    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 2.65, 0.08),
      new THREE.MeshBasicMaterial({ color }),
    );
    strip.position.set(side * 0.91, 1.5, 0.11);
    group.add(strip);
  });

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(2.24, 0.17, 0.24),
    new THREE.MeshStandardMaterial({
      color: 0x1c2b49,
      metalness: 0.7,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.4,
    }),
  );
  beam.position.y = 2.93;
  beam.castShadow = true;
  group.add(beam);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.92, 1.08),
    new THREE.MeshBasicMaterial({ map: numberTexture(0, lane), transparent: false }),
  );
  sign.position.set(0, 3.62, 0.02);
  group.add(sign);

  // Holographic faint portal inside the arch
  const portal = new THREE.Mesh(
    new THREE.PlaneGeometry(1.86, 2.7),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.DoubleSide }),
  );
  portal.position.y = 1.45;
  group.add(portal);

  // Base pad
  const lanePad = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16 });
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 2.1), lanePad);
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.075;
  group.add(pad);

  group.scale.setScalar(0.92);
  return { group, sign, pillars, lanePad, lane };
}

function gateLabel(gate: GateRig, value: number): void {
  gate.sign.material.map?.dispose();
  gate.sign.material.map = numberTexture(value, gate.lane);
  gate.sign.material.needsUpdate = true;
}

function addWindows(
  group: THREE.Group,
  width: number,
  height: number,
  depth: number,
  color: THREE.Color,
  side: number,
) {
  const windowMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), windowMaterial);
      windowMesh.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      windowMesh.position.set(
        (side < 0 ? 1 : -1) * (width / 2 + 0.01),
        -height / 2 + 0.9 + row * (height / 5.4),
        -depth / 2 + 0.6 + column * (depth / 3),
      );
      group.add(windowMesh);
    }
  }
}

function createCityProp(level: LevelConfig): THREE.Group {
  const group = new THREE.Group();
  const width = 2.2 + Math.random() * 3.4;
  const height = 5 + Math.random() * 11;
  const depth = 2.4 + Math.random() * 3.2;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color: level.colors.prop,
      roughness: 0.45,
      metalness: 0.5,
    }),
  );
  body.position.y = height / 2;
  group.add(body);

  const rooftop = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.55, 0.22, depth * 0.55),
    new THREE.MeshStandardMaterial({
      color: level.colors.propAlt,
      emissive: new THREE.Color(level.colors.propAlt),
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.4,
    }),
  );
  rooftop.position.y = height + 0.11;
  group.add(rooftop);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 1.2, 8),
    new THREE.MeshBasicMaterial({ color: level.colors.accent }),
  );
  antenna.position.y = height + 0.8;
  group.add(antenna);

  addWindows(group, width, height, depth, new THREE.Color(level.colors.glow), 1);
  return group;
}

function createTechProp(level: LevelConfig): THREE.Group {
  const group = createCityProp(level);
  const neon = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 6, 0.08),
    new THREE.MeshBasicMaterial({ color: level.colors.accent }),
  );
  neon.position.set(0, 3.2, 0.8);
  group.add(neon);
  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.045, 8, 32),
    new THREE.MeshBasicMaterial({ color: level.colors.propAlt }),
  );
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 7.2;
  group.add(crown);
  return group;
}

function createTreeProp(level: LevelConfig): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 1.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x5b4630, roughness: 0.9 }),
  );
  trunk.position.y = 0.9;
  trunk.castShadow = true;
  group.add(trunk);

  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: level.colors.prop,
    emissive: new THREE.Color(level.colors.accent),
    emissiveIntensity: 0.12,
    roughness: 0.8,
  });
  for (let i = 0; i < 3; i += 1) {
    const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15 - i * 0.2, 1), foliageMaterial);
    foliage.scale.set(1, 0.8, 1);
    foliage.position.set((i - 1) * 0.34, 2.15 + i * 0.72, (i % 2) * 0.3);
    foliage.castShadow = true;
    group.add(foliage);
  }

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34),
    new THREE.MeshStandardMaterial({
      color: level.colors.propAlt,
      emissive: new THREE.Color(level.colors.propAlt),
      emissiveIntensity: 1.3,
      roughness: 0.2,
    }),
  );
  crystal.position.set(0.7, 0.55, 0.5);
  group.add(crystal);
  return group;
}

function createTunnelRing(level: LevelConfig): THREE.Group {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.TorusGeometry(5.1, 0.17, 8, 48),
    new THREE.MeshStandardMaterial({
      color: level.colors.prop,
      metalness: 0.7,
      roughness: 0.25,
      emissive: new THREE.Color(level.colors.accent),
      emissiveIntensity: 0.9,
    }),
  );
  frame.position.y = 2.4;
  group.add(frame);

  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.032, 6, 48),
    new THREE.MeshBasicMaterial({ color: level.colors.accent }),
  );
  inner.position.y = 2.4;
  group.add(inner);

  const markerMaterial = new THREE.MeshBasicMaterial({ color: level.colors.glow, transparent: true, opacity: 0.7 });
  [-1, 1].forEach((side) => {
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), markerMaterial);
    marker.position.set(side * 4.3, 2.7, 0);
    group.add(marker);
  });
  return group;
}

function createGalaxyProp(level: LevelConfig): THREE.Group {
  const group = new THREE.Group();
  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.8 + Math.random() * 1.6, 0),
    new THREE.MeshStandardMaterial({
      color: level.colors.prop,
      roughness: 0.9,
      metalness: 0.25,
      emissive: new THREE.Color(level.colors.accent),
      emissiveIntensity: 0.08,
    }),
  );
  rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  group.add(rock);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.04, 6, 48),
    new THREE.MeshBasicMaterial({ color: level.colors.propAlt, transparent: true, opacity: 0.75 }),
  );
  ring.rotation.x = Math.PI * 0.66;
  ring.rotation.z = Math.random() * 1.2;
  group.add(ring);
  return group;
}

function createSky(level: LevelConfig): THREE.Mesh {
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(level.colors.sky) },
      bottomColor: { value: new THREE.Color(level.colors.fog) },
      accent: { value: new THREE.Color(level.colors.accent) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 accent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        float blend = smoothstep(-0.15, 0.72, h);
        vec3 color = mix(bottomColor, topColor, blend);
        float horizon = smoothstep(-0.02, 0.18, h) * (1.0 - smoothstep(0.18, 0.4, h));
        color += accent * horizon * 0.2;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(150, 24, 16), skyMaterial);
}

export default function GameScene(props: GameSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const resetRef = useRef<((question: Question) => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const level = propsRef.current.level;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(level.colors.fog), 34, 132);
    scene.add(createSky(level));

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 320);
    let portrait = false;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      portrait = camera.aspect < 0.82;
      camera.fov = portrait ? 68 : 58;
      const cameraHeight = portrait ? 5.1 : 4.25;
      const cameraDistance = portrait ? 9.8 : 7.3;
      camera.position.set(0, cameraHeight, cameraDistance);
      camera.updateProjectionMatrix();
      camera.lookAt(0, portrait ? 1.2 : 1.3, -16);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const hemi = new THREE.HemisphereLight(0xcfe9ff, new THREE.Color(level.colors.ground), 2.0);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff3d8, 2.9);
    sun.position.set(-8, 16, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -2;
    scene.add(sun);

    const accentLight = new THREE.PointLight(new THREE.Color(level.colors.accent), 34, 32, 2);
    accentLight.position.set(6, 5, -8);
    scene.add(accentLight);
    const goldLight = new THREE.PointLight(new THREE.Color(level.colors.glow), 22, 24, 2);
    goldLight.position.set(-6, 3, 1);
    scene.add(goldLight);

    // Star field, visible in every theme but strongest in the galaxy.
    const starCount = 480;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 55 + Math.random() * 85;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = 6 + Math.random() * 65;
      starPositions[i * 3 + 2] = -30 + Math.sin(angle) * radius;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(level.colors.accentSoft),
      size: 0.5,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Ground and road
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 260),
      new THREE.MeshStandardMaterial({ color: level.colors.ground, roughness: 0.95, metalness: 0.1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    const roadMaterialA = new THREE.MeshStandardMaterial({
      color: new THREE.Color(level.colors.track),
      roughness: 0.52,
      metalness: 0.35,
    });
    const roadMaterialB = new THREE.MeshStandardMaterial({
      color: new THREE.Color(level.colors.trackAlt),
      roughness: 0.48,
      metalness: 0.4,
    });

    const segmentLength = 6;
    const segmentCount = 25;
    const totalRoad = segmentLength * segmentCount;
    const segments: THREE.Mesh[] = [];
    for (let i = 0; i < segmentCount; i += 1) {
      const segment = new THREE.Mesh(
        new THREE.BoxGeometry(8.8, 0.14, segmentLength + 0.02),
        i % 2 === 0 ? roadMaterialA : roadMaterialB,
      );
      segment.position.set(0, -0.01, 12 - i * segmentLength);
      segment.receiveShadow = true;
      scene.add(segment);
      segments.push(segment);
    }

    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b3453,
      metalness: 0.7,
      roughness: 0.3,
      emissive: new THREE.Color(level.colors.accent),
      emissiveIntensity: 1.2,
    });
    [-4.5, 4.5].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 170), railMaterial);
      rail.position.set(x, 0.2, -65);
      scene.add(rail);
      const glowRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.05, 170),
        new THREE.MeshBasicMaterial({ color: level.colors.accent }),
      );
      glowRail.position.set(x, 0.42, -65);
      scene.add(glowRail);
    });

    // Thin lane seams
    [-1.18, 1.18].forEach((x) => {
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.025, 170),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13 }),
      );
      seam.position.set(x, 0.075, -65);
      scene.add(seam);
    });

    // Moving lane dashes communicate speed.
    const dashes: THREE.Mesh[] = [];
    const dashMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(level.colors.accentSoft),
      transparent: true,
      opacity: 0.23,
    });
    for (let lane = 0; lane < 3; lane += 1) {
      for (let i = 0; i < 7; i += 1) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.025, 0.11), dashMaterial);
        dash.position.set(LANE_X[lane], 0.082, 10 - i * 12);
        scene.add(dash);
        dashes.push(dash);
      }
    }

    // Focused lane glow
    const laneGlowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(level.colors.accent),
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
    });
    const laneGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 16), laneGlowMaterial);
    laneGlow.rotation.x = -Math.PI / 2;
    laneGlow.position.set(0, 0.079, -8);
    scene.add(laneGlow);

    // Environment props
    const props3D: THREE.Object3D[] = [];
    const propCount = level.theme === "tunnel" ? 15 : 26;
    for (let i = 0; i < propCount; i += 1) {
      let prop: THREE.Group | THREE.Mesh;
      if (level.theme === "forest") prop = createTreeProp(level);
      else if (level.theme === "tunnel") prop = createTunnelRing(level);
      else if (level.theme === "tech") prop = createTechProp(level);
      else if (level.theme === "galaxy") prop = createGalaxyProp(level);
      else prop = createCityProp(level);

      if (level.theme === "tunnel") {
        prop.position.set(0, 0, 8 - i * 9);
      } else {
        const side = i % 2 === 0 ? -1 : 1;
        prop.position.set(
          side * (6.4 + Math.random() * 8.5),
          level.theme === "galaxy" ? 1.4 + Math.random() * 2 : 0,
          8 - i * 5.2,
        );
      }
      scene.add(prop);
      props3D.push(prop);
    }

    if (level.theme === "galaxy") {
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(18, 32, 24),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(level.colors.prop),
          emissive: new THREE.Color(level.colors.accent),
          emissiveIntensity: 0.35,
          roughness: 0.75,
        }),
      );
      planet.position.set(-54, 46, -95);
      scene.add(planet);
      const planetRing = new THREE.Mesh(
        new THREE.TorusGeometry(25, 0.35, 8, 64),
        new THREE.MeshBasicMaterial({ color: level.colors.propAlt, transparent: true, opacity: 0.55 }),
      );
      planetRing.position.copy(planet.position);
      planetRing.rotation.x = Math.PI * 0.62;
      scene.add(planetRing);
    }

    const robotRig = createRobot();
    robotRig.group.scale.setScalar(1.02);
    robotRig.group.position.set(0, 0, -0.4);
    robotRig.group.traverse((object) => {
      if (object instanceof THREE.Mesh) object.castShadow = true;
    });
    scene.add(robotRig.group);

    const robotShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.82, 28),
      new THREE.MeshBasicMaterial({ color: 0x030812, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    robotShadow.rotation.x = -Math.PI / 2;
    robotShadow.position.set(0, 0.08, -0.4);
    scene.add(robotShadow);

    // Gates
    const gates: GateRig[] = [0, 1, 2].map(createGate);
    gates.forEach((gate) => scene.add(gate.group));

    // Sparkles for feedback
    const sparkCount = 44;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = Array.from({ length: sparkCount }, () => new THREE.Vector3());
    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(level.colors.glow),
      size: 0.22,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    scene.add(sparks);
    let sparkLife = 0;

    const burst = (color: THREE.Color) => {
      const positionAttribute = sparkGeometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < sparkCount; i += 1) {
        positionAttribute.setXYZ(i, (Math.random() - 0.5) * 1.2, 0.7 + Math.random() * 1.2, (Math.random() - 0.5) * 0.8);
        sparkVelocities[i].set((Math.random() - 0.5) * 3.4, 2 + Math.random() * 3.8, (Math.random() - 0.5) * 2.4);
      }
      positionAttribute.needsUpdate = true;
      sparkMaterial.color = color;
      sparkLife = 1;
    };

    const coinGeometry = new THREE.TorusGeometry(0.16, 0.058, 8, 18);
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd35c,
      emissive: new THREE.Color(0xffab21),
      emissiveIntensity: 0.8,
      metalness: 0.75,
      roughness: 0.25,
    });
    const coinMeshes: THREE.Mesh[] = [];
    gates.forEach((gate) => {
      [-0.62, 0.62].forEach((offset) => {
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.position.set(offset, 4.32, 0);
        coin.rotation.y = Math.PI / 2;
        gate.group.add(coin);
        coinMeshes.push(coin);
      });
    });

    let questionElapsed = 0;
    let resolved = false;
    let currentRun = propsRef.current.runId;
    let currentCommit = propsRef.current.commitId;
    let committed = false;
    let lastTargetLane = propsRef.current.targetLane;
    let hop = 0;
    let shake = 0;
    let lastFeedback: Feedback = null;
    let lastTick = -1;

    const resetQuestion = (question: Question) => {
      questionElapsed = 0;
      resolved = false;
      currentRun = propsRef.current.runId;
      currentCommit = propsRef.current.commitId;
      committed = propsRef.current.committed;
      lastTargetLane = 1;
      lastFeedback = null;
      sparkLife = 0;
      sparkMaterial.opacity = 0;
      lastTick = -1;
      gates.forEach((gate) => {
        gate.group.visible = true;
        gate.group.position.z = -40;
        gate.group.scale.setScalar(0.5);
        gateLabel(gate, question.options[gate.lane]);
        gate.pillars.forEach((material) => {
          material.emissive.set(LANE_COLORS[gate.lane]);
          material.emissiveIntensity = 0.55;
        });
        gate.lanePad.opacity = 0.16;
      });
      currentRun = propsRef.current.runId;
      propsRef.current.onTime(propsRef.current.roundDuration);
    };
    resetRef.current = resetQuestion;
    resetQuestion(propsRef.current.question);

    const clock = new THREE.Clock();
    let frame = 0;

    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.18);
      const current = propsRef.current;
      const paused = current.paused;
      if (!paused) {
        const dt = delta;
        const mode = current.mode;
        const running = mode === "run";

        // Apply question timer only while a round is actively in progress.
        if (current.runId !== currentRun) {
          currentRun = current.runId;
          resetQuestion(current.question);
        }

        if (current.commitId !== currentCommit) {
          currentCommit = current.commitId;
          committed = true;
        }
        // Keep the simulation in sync even if the player taps during the
        // brief reset hand-off between two questions.
        if (current.committed) committed = true;

        const gateSpeed = 44 / current.roundDuration;
        const worldSpeed = gateSpeed * current.level.speed;

        // Road scrolling
        if (running) {
          segments.forEach((segment) => {
            segment.position.z += worldSpeed * dt;
            if (segment.position.z > 14) segment.position.z -= totalRoad;
          });
          dashes.forEach((dash) => {
            dash.position.z += worldSpeed * 1.7 * dt;
            if (dash.position.z > 12) dash.position.z -= 84;
          });
          props3D.forEach((prop) => {
            prop.position.z += worldSpeed * dt;
            if (prop.position.z > 15) {
              prop.position.z -= level.theme === "tunnel" ? 135 : 142;
              if (level.theme !== "tunnel") {
                const side = Math.random() < 0.5 ? -1 : 1;
                prop.position.x = side * (6.4 + Math.random() * 8.5);
                if (level.theme === "galaxy") prop.position.y = 1.4 + Math.random() * 2.2;
              } else {
                prop.position.x = 0;
              }
              prop.rotation.y += Math.random() * Math.PI;
            }
          });
          stars.rotation.y += dt * 0.006;
        }

        if (!resolved) {
          // Once the player chooses a lane, the robot sprints to the gate instead
          // of waiting out the full countdown. The gate crossing still resolves the answer.
          const approachRate = committed ? 3.9 : 1;
          questionElapsed = Math.min(questionElapsed + dt * approachRate, current.roundDuration);
          const rawProgress = questionElapsed / current.roundDuration;
          // Fair play: if a child has not chosen yet, the gates hover in front of
          // the robot and wait. No answer is forced and no life is lost for hesitating.
          const progress = committed ? rawProgress : Math.min(rawProgress, 0.93);
          const eased = progress * progress * 0.18 + progress * 0.82;
          gates.forEach((gate) => {
            gate.group.position.z = -40 + eased * 39;
            gate.group.scale.setScalar(THREE.MathUtils.lerp(gate.group.scale.x, 1, 0.12));
          });
          const remaining = committed ? Math.max(0, current.roundDuration - questionElapsed) : Math.max(0, current.roundDuration * (0.93 - progress));
          if (Math.abs(remaining - lastTick) > 0.09 || remaining === 0) {
            lastTick = remaining;
            current.onTime(remaining);
          }
          if (committed && rawProgress >= 0.985) {
            resolved = true;
            const lane = Math.max(0, Math.min(2, current.targetLane));
            current.onGatePass(lane);
          }
        } else {
          const elapsed = questionElapsed;
          if (elapsed < 0.95) questionElapsed = Math.min(0.95, elapsed + dt * 0.2);
          gates.forEach((gate) => {
            gate.group.position.z += dt * 17;
          });
          sparkLife = Math.max(0, sparkLife - dt * 0.5);
          if (sparkLife > 0) {
            const positionAttribute = sparkGeometry.getAttribute("position") as THREE.BufferAttribute;
            for (let i = 0; i < sparkCount; i += 1) {
              const velocity = sparkVelocities[i];
              velocity.y -= 6.8 * dt;
              positionAttribute.setXYZ(
                i,
                positionAttribute.getX(i) + velocity.x * dt,
                Math.max(0.05, positionAttribute.getY(i) + velocity.y * dt),
                positionAttribute.getZ(i) + velocity.z * dt,
              );
            }
            positionAttribute.needsUpdate = true;
            sparkMaterial.opacity = sparkLife;
          } else {
            sparkMaterial.opacity = 0;
          }
        }

        // Feedback effects driven by the resolved run.
        const feedback = current.feedback;
        if (resolved && feedback && feedback !== lastFeedback) {
          lastFeedback = feedback;
          gates.forEach((gate) => {
            const selected = gate.lane === current.targetLane;
            gate.lanePad.opacity = selected ? 0.55 : 0.06;
            gate.pillars.forEach((material) => {
              material.emissive.set(feedback === "correct" ? 0x4ade80 : 0xff5a6b);
              material.emissiveIntensity = selected ? 2.2 : 0.2;
            });
          });
          if (feedback === "correct") burst(new THREE.Color(level.colors.glow));
          else {
            burst(new THREE.Color(0xff5a6b));
            shake = 1;
          }
        }
        shake = Math.max(0, shake - dt * 1.8);

        // Lane movement + robot animation
        const targetX = LANE_X[current.targetLane];
        const robot = robotRig.group;
        if (current.targetLane !== lastTargetLane) {
          lastTargetLane = current.targetLane;
          hop = 1;
        }
        robot.position.x = THREE.MathUtils.damp(robot.position.x, targetX, 9.5, dt);
        hop = Math.max(0, hop - dt * 4.2);
        const hopY = Math.sin((1 - hop) * Math.PI) * (hop > 0 ? 0.18 : 0);
        robot.position.y = hopY;
        robotShadow.position.x = robot.position.x;
        robotShadow.scale.setScalar(1 - hopY * 0.4);

        const animationMode: RobotMode = resolved ? (feedback === "wrong" ? "sad" : feedback === "correct" ? "celebrate" : current.mode) : current.mode;
        animateRobot(robotRig, performance.now() / 1000, animationMode, current.level.id === 5 ? 1.25 : 1);
        robot.rotation.z = Math.max(-0.17, Math.min(0.17, (targetX - robot.position.x) * 0.25));

        // Gates react to the selected lane during the question.
        if (!resolved) {
          gates.forEach((gate) => {
            const isFocused = gate.lane === current.targetLane;
            gate.pillars.forEach((material) => {
              material.emissiveIntensity = THREE.MathUtils.lerp(
                material.emissiveIntensity,
                isFocused ? 1.9 : 0.5,
                0.09,
              );
            });
            gate.lanePad.opacity = THREE.MathUtils.lerp(gate.lanePad.opacity, isFocused ? 0.35 : 0.1, 0.1);
            gate.group.scale.y = THREE.MathUtils.lerp(gate.group.scale.y, isFocused ? 1.025 : 1, 0.08);
          });
          laneGlow.position.x = THREE.MathUtils.lerp(laneGlow.position.x, targetX, 0.16);
          laneGlowMaterial.opacity = 0.09 + Math.sin(performance.now() / 220) * 0.025;
        }

        coinMeshes.forEach((coin) => {
          coin.rotation.y += dt * (resolved ? 7 : 2.2);
        });

        // Camera follows the runner gently.
        const baseHeight = portrait ? 5.1 : 4.25;
        const baseDistance = portrait ? 9.8 : 7.3;
        const shakeX = (Math.random() - 0.5) * shake * 0.22;
        const shakeY = (Math.random() - 0.5) * shake * 0.16;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, robot.position.x * 0.17 + shakeX, 0.06);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseHeight + shakeY, 0.06);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseDistance + (portrait ? 0 : 0), 0.06);
        camera.lookAt(robot.position.x * 0.12, portrait ? 1.2 : 1.3, -16);

        accentLight.position.z = Math.sin(performance.now() / 1800) * 7 - 5;
      } else {
        // Pause freezes the simulation but keeps the current frame visible.
      }

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resetRef.current = null;
      disposeRobot(robotRig);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            const textured = material as THREE.MeshBasicMaterial;
            textured.map?.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
    // The world is rebuilt when a new level begins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.level.id]);

  useEffect(() => {
    resetRef.current?.(props.question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.runId]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ touchAction: "none" }}
      aria-hidden="true"
    />
  );
}
