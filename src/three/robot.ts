import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type RobotMode = "run" | "idle" | "celebrate" | "sad";

export interface RobotRig {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  antenna: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  glowParts: THREE.MeshStandardMaterial[];
}

const kit = {
  blue: new THREE.MeshStandardMaterial({ color: 0x2d7dff, roughness: 0.34, metalness: 0.3 }),
  blueDark: new THREE.MeshStandardMaterial({ color: 0x1746a8, roughness: 0.4, metalness: 0.35 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xffc83d, roughness: 0.32, metalness: 0.22 }),
  white: new THREE.MeshStandardMaterial({ color: 0xeef4ff, roughness: 0.4, metalness: 0.25 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x101c36, roughness: 0.5, metalness: 0.4 }),
};

function rounded(width: number, height: number, depth: number, radius = 0.08): RoundedBoxGeometry {
  return new RoundedBoxGeometry(width, height, depth, 4, radius);
}

export function createRobot(): RobotRig {
  const group = new THREE.Group();
  group.name = "ROBO-KID";
  const glowParts: THREE.MeshStandardMaterial[] = [];

  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x7ff8ff,
    emissive: new THREE.Color(0x59ecff),
    emissiveIntensity: 2.6,
    roughness: 0.25,
  });
  const eyeMat = glowMat.clone();
  glowParts.push(glowMat, eyeMat);

  // Lower body / hips
  const hips = new THREE.Mesh(rounded(0.68, 0.3, 0.46, 0.1), kit.blueDark);
  hips.position.y = 0.8;
  hips.castShadow = true;
  group.add(hips);

  // Torso
  const body = new THREE.Group();
  body.position.y = 1.18;
  group.add(body);

  const chest = new THREE.Mesh(rounded(0.86, 0.78, 0.56, 0.16), kit.blue);
  chest.castShadow = true;
  body.add(chest);

  const chestPlate = new THREE.Mesh(rounded(0.5, 0.36, 0.06, 0.08), kit.white);
  chestPlate.position.set(0, 0.08, -0.29);
  body.add(chestPlate);

  const screen = new THREE.Mesh(rounded(0.3, 0.17, 0.04, 0.05), kit.dark);
  screen.position.set(0, 0.09, -0.33);
  body.add(screen);

  const core = new THREE.Mesh(new THREE.CircleGeometry(0.052, 18), glowMat);
  core.position.set(0, 0.09, -0.355);
  body.add(core);

  const belt = new THREE.Mesh(rounded(0.7, 0.12, 0.52, 0.05), kit.yellow);
  belt.position.set(0, -0.36, 0);
  body.add(belt);

  const backpack = new THREE.Mesh(rounded(0.46, 0.46, 0.16, 0.08), kit.blueDark);
  backpack.position.set(0, 0.08, 0.34);
  body.add(backpack);
  const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.12, 12), glowMat);
  thruster.rotation.x = Math.PI / 2;
  thruster.position.set(0, 0.08, 0.45);
  body.add(thruster);

  // Head
  const head = new THREE.Group();
  head.position.y = 1.83;
  group.add(head);

  const helmet = new THREE.Mesh(rounded(0.74, 0.62, 0.6, 0.17), kit.white);
  helmet.castShadow = true;
  head.add(helmet);

  const cap = new THREE.Mesh(rounded(0.6, 0.22, 0.5, 0.09), kit.blue);
  cap.position.y = 0.25;
  head.add(cap);

  const visor = new THREE.Mesh(rounded(0.58, 0.3, 0.08, 0.1), kit.dark);
  visor.position.set(0, 0.015, -0.3);
  head.add(visor);

  const eyeGeo = rounded(0.115, 0.16, 0.035, 0.045);
  [-0.14, 0.14].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(x, 0.025, -0.345);
    head.add(eye);
  });

  const browLeft = new THREE.Mesh(rounded(0.1, 0.025, 0.02, 0.01), eyeMat);
  browLeft.position.set(-0.15, 0.13, -0.34);
  head.add(browLeft);
  const browRight = browLeft.clone();
  browRight.position.x = 0.15;
  head.add(browRight);

  // Ear caps
  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 16), kit.yellow);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(side * 0.39, 0, 0);
    ear.castShadow = true;
    head.add(ear);
    const earLight = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), glowMat);
    earLight.rotation.y = side * (Math.PI / 2);
    earLight.position.set(side * 0.44, 0, 0);
    head.add(earLight);
  });

  // Antenna
  const antenna = new THREE.Group();
  antenna.position.set(0, 0.36, 0);
  head.add(antenna);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.3, 10), kit.blueDark);
  stem.position.y = 0.14;
  antenna.add(stem);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 12), kit.yellow);
  bulb.position.y = 0.34;
  bulb.castShadow = true;
  antenna.add(bulb);
  const bulbLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glowMat);
  bulbLight.position.y = 0.34;
  bulbLight.scale.set(1, 1, 0.6);
  antenna.add(bulbLight);

  // Arms
  const buildArm = (side: -1 | 1) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.56, 1.42, 0);
    group.add(pivot);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), kit.yellow);
    shoulder.castShadow = true;
    pivot.add(shoulder);

    const arm = new THREE.Mesh(rounded(0.2, 0.5, 0.22, 0.09), kit.blue);
    arm.position.y = -0.31;
    arm.castShadow = true;
    pivot.add(arm);

    const cuff = new THREE.Mesh(rounded(0.22, 0.1, 0.24, 0.04), kit.white);
    cuff.position.y = -0.56;
    pivot.add(cuff);

    const hand = new THREE.Mesh(rounded(0.24, 0.2, 0.24, 0.08), kit.blueDark);
    hand.position.y = -0.69;
    hand.castShadow = true;
    pivot.add(hand);

    return pivot;
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Legs
  const buildLeg = (side: -1 | 1) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.23, 0.78, 0);
    group.add(pivot);

    const leg = new THREE.Mesh(rounded(0.26, 0.54, 0.28, 0.1), kit.blueDark);
    leg.position.y = -0.3;
    leg.castShadow = true;
    pivot.add(leg);

    const sock = new THREE.Mesh(rounded(0.28, 0.12, 0.3, 0.04), kit.yellow);
    sock.position.y = -0.54;
    pivot.add(sock);

    const foot = new THREE.Mesh(rounded(0.35, 0.2, 0.52, 0.09), kit.white);
    foot.position.set(0, -0.66, -0.08);
    foot.castShadow = true;
    pivot.add(foot);

    return pivot;
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  group.scale.setScalar(1);
  return { group, body, head, antenna, leftArm, rightArm, leftLeg, rightLeg, glowParts };
}

const lerp = THREE.MathUtils.lerp;

export function animateRobot(rig: RobotRig, time: number, mode: RobotMode, intensity = 1): void {
  const { leftArm, rightArm, leftLeg, rightLeg, body, head, antenna } = rig;
  const speed = 8.4 * intensity;

  if (mode === "run") {
    const swing = Math.sin(time * speed);
    leftLeg.rotation.x = swing * 0.72;
    rightLeg.rotation.x = -swing * 0.72;
    leftArm.rotation.x = -swing * 0.58;
    rightArm.rotation.x = swing * 0.58;
    leftArm.rotation.z = lerp(leftArm.rotation.z, -0.12, 0.15);
    rightArm.rotation.z = lerp(rightArm.rotation.z, 0.12, 0.15);
    body.position.y = 1.18 + Math.abs(Math.cos(time * speed)) * 0.045;
    body.rotation.z = Math.sin(time * speed) * 0.025;
    head.position.y = 1.83 + Math.abs(Math.sin(time * speed)) * 0.022;
    head.rotation.z = Math.sin(time * speed * 0.5) * 0.03;
    antenna.rotation.z = Math.sin(time * speed * 0.7) * 0.14;
    rig.group.rotation.z = 0;
  } else if (mode === "idle") {
    const breathe = Math.sin(time * 2.2);
    leftArm.rotation.x = lerp(leftArm.rotation.x, 0.06, 0.1);
    rightArm.rotation.x = lerp(rightArm.rotation.x, -0.06, 0.1);
    leftArm.rotation.z = lerp(leftArm.rotation.z, -0.16, 0.1);
    rightArm.rotation.z = lerp(rightArm.rotation.z, 0.16, 0.1);
    leftLeg.rotation.x = lerp(leftLeg.rotation.x, 0, 0.1);
    rightLeg.rotation.x = lerp(rightLeg.rotation.x, 0, 0.1);
    body.position.y = 1.18 + breathe * 0.025;
    head.position.y = 1.83 + breathe * 0.018;
    head.rotation.z = Math.sin(time * 1.2) * 0.03;
    head.rotation.x = lerp(head.rotation.x, 0, 0.08);
    antenna.rotation.z = Math.sin(time * 1.8) * 0.12;
  } else if (mode === "celebrate") {
    const bounce = Math.abs(Math.sin(time * 5.2));
    leftArm.rotation.z = lerp(leftArm.rotation.z, -2.35, 0.13);
    rightArm.rotation.z = lerp(rightArm.rotation.z, 2.35, 0.13);
    leftArm.rotation.x = lerp(leftArm.rotation.x, Math.sin(time * 7) * 0.2, 0.1);
    rightArm.rotation.x = lerp(rightArm.rotation.x, -Math.sin(time * 7) * 0.2, 0.1);
    leftLeg.rotation.x = lerp(leftLeg.rotation.x, 0.1, 0.1);
    rightLeg.rotation.x = lerp(rightLeg.rotation.x, -0.1, 0.1);
    body.position.y = 1.18 + bounce * 0.2;
    head.position.y = 1.83 + bounce * 0.24;
    head.rotation.z = Math.sin(time * 5.2) * 0.12;
    head.rotation.x = 0;
    antenna.rotation.z = Math.sin(time * 6) * 0.25;
    rig.group.rotation.y = Math.sin(time * 0.9) * 0.22;
    rig.glowParts.forEach((part) => {
      part.emissiveIntensity = 2.6 + Math.sin(time * 8) * 1.2;
    });
  } else {
    const sway = Math.sin(time * 1.6);
    leftArm.rotation.z = lerp(leftArm.rotation.z, -0.34, 0.1);
    rightArm.rotation.z = lerp(rightArm.rotation.z, 0.34, 0.1);
    leftArm.rotation.x = lerp(leftArm.rotation.x, 0.18, 0.1);
    rightArm.rotation.x = lerp(rightArm.rotation.x, 0.18, 0.1);
    leftLeg.rotation.x = lerp(leftLeg.rotation.x, 0, 0.1);
    rightLeg.rotation.x = lerp(rightLeg.rotation.x, 0, 0.1);
    body.position.y = lerp(body.position.y, 1.12, 0.1);
    head.position.y = lerp(head.position.y, 1.76, 0.1);
    head.rotation.x = lerp(head.rotation.x, -0.22, 0.08);
    head.rotation.z = sway * 0.09;
    antenna.rotation.z = sway * 0.25;
    rig.group.rotation.y = 0;
    rig.glowParts.forEach((part) => {
      part.emissiveIntensity = lerp(part.emissiveIntensity, 1.2, 0.08);
    });
  }
}

export function disposeRobot(rig: RobotRig): void {
  rig.group.parent?.remove(rig.group);
  rig.group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
      else child.material.dispose();
    }
  });
}
