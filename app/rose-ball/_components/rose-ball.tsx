"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// 5x7 dot-matrix letters; every "X" becomes a sunflower.
const LETTERS: Record<string, string[]> = {
  N: ["X...X", "X...X", "XX..X", "X.X.X", "X..XX", "X...X", "X...X"],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
};
const WORD = "NOP";

const R = 5; // radius of the rose ball
const ROSE_STEP = 5.5; // degrees between neighbouring roses
const TEXT_STEP = 5.2; // degrees between neighbouring cells of the lettering
const TEXT_LAT = 12; // latitude of the lettering's middle row
const TEXT_MARGIN = 2; // rows/cols of grid-aligned roses framing the word
const LOWEST_LAT = -50; // anything lower is hidden inside the wrapping paper
const LEAF_LAT = -12; // where the ring of leaves spills over the paper

const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);

// Deterministic pseudo-random in [0, 1) so every render looks the same.
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Unit vector for a latitude/longitude in degrees; longitude 0 faces +Z.
function onSphere(lat: number, lon: number) {
  const a = lat * DEG;
  const b = lon * DEG;
  return new THREE.Vector3(
    Math.cos(a) * Math.sin(b),
    Math.sin(a),
    Math.cos(a) * Math.cos(b),
  );
}

type Spot = { lat: number; lon: number };

function layoutFlowers() {
  const rows = 7;
  const cols = WORD.length * 6 - 1;
  const filled = new Set<string>();
  [...WORD].forEach((letter, l) => {
    LETTERS[letter].forEach((row, r) => {
      [...row].forEach((cell, c) => {
        if (cell === "X") filled.add(`${l * 6 + c},${r}`);
      });
    });
  });

  // Longitude is stretched by 1/cos(lat) so the lettering keeps even spacing.
  const toCol = ({ lat, lon }: Spot) =>
    (lon * Math.cos(lat * DEG)) / TEXT_STEP + (cols - 1) / 2;
  const toRow = ({ lat }: Spot) => (TEXT_LAT - lat) / TEXT_STEP + (rows - 1) / 2;

  const roses: Spot[] = [];
  const sunflowers: Spot[] = [];
  for (let r = -TEXT_MARGIN; r < rows + TEXT_MARGIN; r++) {
    for (let c = -TEXT_MARGIN; c < cols + TEXT_MARGIN; c++) {
      const lat = TEXT_LAT - (r - (rows - 1) / 2) * TEXT_STEP;
      const lon = ((c - (cols - 1) / 2) * TEXT_STEP) / Math.cos(lat * DEG);
      (filled.has(`${c},${r}`) ? sunflowers : roses).push({ lat, lon });
    }
  }

  // Everywhere outside the lettering, rings of roses from the top down to the paper.
  const rings = Math.round((90 - LOWEST_LAT) / ROSE_STEP);
  for (let i = 0; i <= rings; i++) {
    const lat = 90 - (i * (90 - LOWEST_LAT)) / rings;
    const count = Math.max(
      1,
      Math.round((360 * Math.cos(lat * DEG)) / ROSE_STEP),
    );
    for (let k = 0; k < count; k++) {
      const spot = { lat, lon: ((k + (i % 2) / 2) * 360) / count - 180 };
      const c = toCol(spot);
      const r = toRow(spot);
      const inLettering =
        c >= -TEXT_MARGIN &&
        c <= cols - 1 + TEXT_MARGIN &&
        r >= -TEXT_MARGIN &&
        r <= rows - 1 + TEXT_MARGIN;
      if (!inLettering) roses.push(spot);
    }
  }
  return { roses, sunflowers };
}

// Adds a vertex-color gradient; `amount` maps a vertex position to 0 (from) .. 1 (to).
function paint(
  geometry: THREE.BufferGeometry,
  from: string,
  to: string,
  amount: (p: THREE.Vector3) => number,
) {
  const a = new THREE.Color(from);
  const b = new THREE.Color(to);
  const c = new THREE.Color();
  const p = new THREE.Vector3();
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    c.lerpColors(a, b, THREE.MathUtils.clamp(amount(p), 0, 1));
    c.toArray(colors, i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// Nested layers of cupped petals: a tight bud inside, opening and curling outward.
function roseGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const layers = 5;
  for (let layer = 0; layer < layers; layer++) {
    const t = layer / (layers - 1);
    const count = layer === 0 ? 3 : 5;
    const base = 0.03 + 0.07 * t;
    const rim = 0.1 + 0.32 * t;
    const height = 0.3 - 0.14 * t;
    const curl = 0.04 + 0.1 * t;
    const profile = [
      new THREE.Vector2(base, 0),
      new THREE.Vector2((base + rim) / 2 + 0.02 * t, height * 0.55),
      new THREE.Vector2(rim, height),
      new THREE.Vector2(rim + curl, height - curl * 0.6),
    ];
    for (let k = 0; k < count; k++) {
      const petal = new THREE.LatheGeometry(
        profile,
        6,
        layer * 0.9 + (k * Math.PI * 2) / count,
        ((Math.PI * 2) / count) * 1.35,
      );
      parts.push(
        paint(petal, "#d8dbc0", layer < 2 ? "#f8f1e0" : "#ffffff", (p) => p.y / height),
      );
    }
  }
  const bud = new THREE.SphereGeometry(0.07, 8, 6);
  bud.scale(1, 1.6, 1);
  bud.translate(0, 0.17, 0);
  parts.push(paint(bud, "#f1ead6", "#f1ead6", () => 0));
  return mergeGeometries(parts);
}

const DISC = 0.17;

function sunflowerGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const rings = [
    { count: 16, length: 0.2, tilt: 0.18, offset: 0 },
    { count: 16, length: 0.17, tilt: 0.32, offset: 0.5 },
  ];
  for (const ring of rings) {
    for (let k = 0; k < ring.count; k++) {
      const petal = new THREE.SphereGeometry(1, 8, 6);
      petal.scale(0.055, 0.012, ring.length);
      petal.translate(0, 0, DISC + ring.length * 0.85);
      petal.rotateX(-ring.tilt);
      petal.rotateY(((k + ring.offset) * Math.PI * 2) / ring.count);
      parts.push(
        paint(petal, "#d98a0b", "#ffd84a", (p) =>
          (Math.hypot(p.x, p.z) - DISC) / (ring.length * 1.7),
        ),
      );
    }
  }
  const disc = new THREE.SphereGeometry(DISC, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  disc.scale(1, 0.35, 1);
  disc.translate(0, 0.015, 0);
  parts.push(
    paint(disc, "#24110a", "#7a4a1a", (p) => Math.hypot(p.x, p.z) / DISC),
  );
  return mergeGeometries(parts);
}

function leafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.35, 0.25, 0.3, 0.75, 0, 1);
  shape.bezierCurveTo(-0.3, 0.75, -0.35, 0.25, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 12);
  // Cup the leaf across its width and let the tip droop.
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, Math.abs(x) * 0.6 + y * y * 0.25);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Overlapping sheets of paper cupping the bottom of the ball and narrowing to the stems.
function paperGeometry(sheets: number, offset: number, scale: number, rim: number) {
  const profile = [
    [0.2, -1.62],
    [0.42, -1.3],
    [0.72, -1.0],
    [0.92, -0.75],
    [1.02, -0.6],
    [1.08, rim],
  ].map(([x, y]) => new THREE.Vector2(x * R * scale, y * R));
  const step = (Math.PI * 2) / sheets;
  const segments = 12;
  return mergeGeometries(
    Array.from({ length: sheets }, (_, k) => {
      const sheet = new THREE.LatheGeometry(
        profile,
        segments,
        offset + k * step,
        step * 1.25,
      );
      // Raise and flare the middle of each sheet's top edge into a petal shape.
      const position = sheet.getAttribute("position");
      for (let i = 0; i < position.count; i++) {
        const u = Math.floor(i / profile.length) / segments;
        const v = (i % profile.length) / (profile.length - 1);
        const lift = Math.sin(Math.PI * u) * v ** 3;
        const flare = 1 + 0.08 * lift;
        position.setXYZ(
          i,
          position.getX(i) * flare,
          position.getY(i) + 0.12 * R * lift,
          position.getZ(i) * flare,
        );
      }
      sheet.computeVertexNormals();
      return sheet;
    }),
  );
}

// Points each instance outward from the ball's surface with a little random tilt and twist.
function placeOnBall(
  mesh: THREE.InstancedMesh,
  spots: Spot[],
  radius: number,
  size: number,
  wobble: number,
  salt: number,
) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const twist = new THREE.Quaternion();
  const tilt = new THREE.Vector3();
  const scale = new THREE.Vector3();
  spots.forEach((spot, i) => {
    const normal = onSphere(spot.lat, spot.lon);
    tilt
      .set(rand(i, salt) - 0.5, rand(i, salt + 1) - 0.5, rand(i, salt + 2) - 0.5)
      .multiplyScalar(wobble)
      .add(normal)
      .normalize();
    quaternion
      .setFromUnitVectors(UP, tilt)
      .multiply(twist.setFromAxisAngle(UP, rand(i, salt + 3) * Math.PI * 2));
    scale.setScalar(size * (0.92 + rand(i, salt + 4) * 0.16));
    normal.multiplyScalar(radius + (rand(i, salt + 5) - 0.5) * 0.04);
    mesh.setMatrixAt(i, matrix.compose(normal, quaternion, scale));
  });
}

function buildBouquet() {
  const bouquet = new THREE.Group();
  const { roses, sunflowers } = layoutFlowers();

  // Dark foliage behind the flowers so gaps read as leaves, not holes.
  const foliage = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.985, 48, 32),
    new THREE.MeshStandardMaterial({ color: "#2d4a1e", roughness: 1 }),
  );
  bouquet.add(foliage);

  const roseMesh = new THREE.InstancedMesh(
    roseGeometry(),
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.55,
      sheen: 1,
      sheenRoughness: 0.5,
      sheenColor: "#ffffff",
      side: THREE.DoubleSide,
    }),
    roses.length,
  );
  placeOnBall(roseMesh, roses, R - 0.02, 0.55, 0.15, 10);
  const white = new THREE.Color("#ffffff");
  const ivory = new THREE.Color("#f3ead6");
  const tint = new THREE.Color();
  roses.forEach((_, i) => roseMesh.setColorAt(i, tint.lerpColors(white, ivory, rand(i, 20))));
  bouquet.add(roseMesh);

  // Sunflowers sit level with the rose tops so the lettering isn't hidden.
  const sunflowerMesh = new THREE.InstancedMesh(
    sunflowerGeometry(),
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.7,
      side: THREE.DoubleSide,
    }),
    sunflowers.length,
  );
  placeOnBall(sunflowerMesh, sunflowers, R + 0.13, 0.62, 0.06, 30);
  bouquet.add(sunflowerMesh);

  const leaves = 16;
  const leafMesh = new THREE.InstancedMesh(
    leafGeometry(),
    new THREE.MeshStandardMaterial({
      color: "#4a7a2a",
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
    leaves,
  );
  const matrix = new THREE.Matrix4();
  for (let k = 0; k < leaves; k++) {
    const lat = LEAF_LAT * DEG;
    const lon = (k * 360) / leaves + 11 + rand(k, 40) * 8;
    const normal = onSphere(LEAF_LAT, lon);
    const east = new THREE.Vector3(Math.cos(lon * DEG), 0, -Math.sin(lon * DEG));
    const down = new THREE.Vector3(
      Math.sin(lat) * Math.sin(lon * DEG),
      -Math.cos(lat),
      Math.sin(lat) * Math.cos(lon * DEG),
    );
    const along = normal.clone().add(down.multiplyScalar(0.15)).normalize();
    const length = R * (0.28 + rand(k, 41) * 0.08);
    matrix
      .makeBasis(east, along, new THREE.Vector3().crossVectors(east, along))
      .scale(new THREE.Vector3(length, length, length))
      .setPosition(normal.multiplyScalar(R * 0.98));
    leafMesh.setMatrixAt(k, matrix);
  }
  bouquet.add(leafMesh);

  const kraft = new THREE.Mesh(
    paperGeometry(5, 0, 1, -0.5),
    new THREE.MeshStandardMaterial({
      color: "#c9a27e",
      roughness: 0.85,
      side: THREE.DoubleSide,
    }),
  );
  const tissue = new THREE.Mesh(
    paperGeometry(5, Math.PI / 5, 0.97, -0.42),
    new THREE.MeshStandardMaterial({
      color: "#f7f1e6",
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  bouquet.add(kraft, tissue);

  const stemGeometry = new THREE.CylinderGeometry(0.028 * R, 0.028 * R, 0.8 * R, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: "#4d7c0f", roughness: 0.7 });
  for (let k = 0; k < 10; k++) {
    const angle = k * 2.39996;
    const spread = 0.12 * R * Math.sqrt(k / 10);
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(Math.cos(angle) * spread, -1.97 * R, Math.sin(angle) * spread);
    stem.rotation.set(Math.sin(angle) * 0.05, 0, Math.cos(angle) * 0.05);
    bouquet.add(stem);
  }

  const neck = -1.52 * R;
  const ribbon = new THREE.MeshStandardMaterial({
    color: "#e8b43c",
    roughness: 0.35,
    metalness: 0.1,
  });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.28 * R, 0.035 * R, 12, 48), ribbon);
  band.rotation.x = Math.PI / 2;
  band.position.y = neck;
  bouquet.add(band);
  const loopGeometry = new THREE.TorusGeometry(0.13 * R, 0.03 * R, 10, 32);
  const tailGeometry = new THREE.BoxGeometry(0.07 * R, 0.42 * R, 0.012 * R);
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(loopGeometry, ribbon);
    loop.scale.set(1, 0.6, 1);
    loop.position.set(side * 0.13 * R, neck, 0.33 * R);
    loop.rotation.set(0, side * 0.3, side * 0.25);
    const tail = new THREE.Mesh(tailGeometry, ribbon);
    tail.position.set(side * 0.08 * R, neck - 0.2 * R, 0.34 * R);
    tail.rotation.z = side * 0.25;
    bouquet.add(loop, tail);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.05 * R, 16, 12), ribbon);
  knot.position.set(0, neck, 0.33 * R);
  bouquet.add(knot);
  bouquet.traverse((object) => {
    object.castShadow = object.receiveShadow = true;
  });

  return bouquet;
}

// Half the bouquet's extent around the orbit target, used to fit it in view.
const HALF_HEIGHT = 1.85 * R;
const HALF_WIDTH = 1.35 * R;

export function RoseBall({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = environment;
    scene.environmentIntensity = 0.35;

    const sun = new THREE.DirectionalLight("#fff8ec", 3);
    sun.position.set(R * 2.6, R * 2, R * 1.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.normalBias = 0.03;
    Object.assign(sun.shadow.camera, {
      left: -R * 1.6,
      right: R * 1.6,
      top: R * 1.6,
      bottom: -R * 2.8,
      near: 0.5,
      far: R * 7,
    });
    scene.add(sun);

    const bouquet = buildBouquet();
    scene.add(bouquet);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -0.6 * R, 0);
    camera.position.set(0, controls.target.y + R * 2.2, R * 6);
    controls.enableDamping = true;
    controls.enablePan = false;

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      const t = Math.tan((camera.fov * DEG) / 2);
      const distance = Math.max(HALF_HEIGHT / t, HALF_WIDTH / (t * camera.aspect));
      camera.position.sub(controls.target).setLength(distance).add(controls.target);
      controls.minDistance = distance * 0.35;
      controls.maxDistance = distance * 1.6;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Turn slowly while idle; pause while the user drags.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dragging = false;
    let last = 0;
    controls.addEventListener("start", () => (dragging = true));
    controls.addEventListener("end", () => (dragging = false));
    renderer.setAnimationLoop((time) => {
      const delta = Math.min((time - last) / 1000, 0.1);
      last = time;
      if (!reduceMotion && !dragging) bouquet.rotation.y += delta * 0.4;
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="A round bouquet of white roses with sunflowers spelling NOP"
      className={className}
    />
  );
}
