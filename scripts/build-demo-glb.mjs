// Dev-only asset generator (NOT an app dependency).
// Takes the REAL DamagedHelmet as the body and welds tactical-looking mounted
// gear onto it: a side rail, a front optic pod, and a top antenna. The hero
// stays the helmet; each piece is its own mesh + named material so the viewer
// shows/hides it by toggling alpha. Parts are gunmetal with a subtle cyan glow
// to match the app's dark slate/cyan skin (reads as intentional tech, not boxes).
//
// Material name contract (used at runtime via material.name):
//   <helmet's own material>  -> chassis/finish tint + module glow
//   part_rail / part_antenna -> housing metal: engama with chassis/finish
//   part_pod / part_pod_glass / part_pod_eye -> factory-locked IR tube (black + hot red)
//
// Run (dependency installed transiently, not saved to package.json):
//   npm install --no-save @gltf-transform/core
//   node scripts/build-demo-glb.mjs
//
// Output: public/models/machine-demo.glb

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { KHRMaterialsEmissiveStrength } from "@gltf-transform/extensions";

const HELMET_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";
const OUT = resolve("public/models/machine-demo.glb");

// --- Geometry accumulator: merge several primitives into one mesh -----------

function createGeometry() {
  return { pos: [], nor: [], idx: [] };
}

// Map a local Y-up vertex/normal onto the requested world axis.
function mapAxis(axis, x, y, z) {
  if (axis === "z") return [x, z, y];
  if (axis === "x") return [y, x, z];
  return [x, y, z];
}

function addBox(geo, sx, sy, sz, [cx, cy, cz]) {
  const faces = [
    { p: [sx / 2, -sy / 2, -sz / 2], u: [0, sy, 0], v: [0, 0, sz], n: [1, 0, 0] },
    { p: [-sx / 2, -sy / 2, sz / 2], u: [0, sy, 0], v: [0, 0, -sz], n: [-1, 0, 0] },
    { p: [-sx / 2, sy / 2, -sz / 2], u: [sx, 0, 0], v: [0, 0, sz], n: [0, 1, 0] },
    { p: [-sx / 2, -sy / 2, sz / 2], u: [sx, 0, 0], v: [0, 0, -sz], n: [0, -1, 0] },
    { p: [-sx / 2, -sy / 2, sz / 2], u: [sx, 0, 0], v: [0, sy, 0], n: [0, 0, 1] },
    { p: [sx / 2, -sy / 2, -sz / 2], u: [-sx, 0, 0], v: [0, sy, 0], n: [0, 0, -1] },
  ];
  for (const f of faces) {
    const base = geo.pos.length / 3;
    const corners = [
      f.p,
      [f.p[0] + f.u[0], f.p[1] + f.u[1], f.p[2] + f.u[2]],
      [f.p[0] + f.u[0] + f.v[0], f.p[1] + f.u[1] + f.v[1], f.p[2] + f.u[2] + f.v[2]],
      [f.p[0] + f.v[0], f.p[1] + f.v[1], f.p[2] + f.v[2]],
    ];
    for (const c of corners) {
      geo.pos.push(c[0] + cx, c[1] + cy, c[2] + cz);
      geo.nor.push(f.n[0], f.n[1], f.n[2]);
    }
    geo.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function addCylinder(geo, { radius, height, seg = 20, axis = "y", center = [0, 0, 0] }) {
  const [cx, cy, cz] = center;
  const half = height / 2;
  const push = (lx, ly, lz, nx, ny, nz) => {
    const [x, y, z] = mapAxis(axis, lx, ly, lz);
    const [nX, nY, nZ] = mapAxis(axis, nx, ny, nz);
    geo.pos.push(x + cx, y + cy, z + cz);
    geo.nor.push(nX, nY, nZ);
  };
  // Side wall
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);
    const base = geo.pos.length / 3;
    push(c0 * radius, -half, s0 * radius, c0, 0, s0);
    push(c1 * radius, -half, s1 * radius, c1, 0, s1);
    push(c1 * radius, half, s1 * radius, c1, 0, s1);
    push(c0 * radius, half, s0 * radius, c0, 0, s0);
    geo.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  // Caps
  for (const end of [1, -1]) {
    const centerBase = geo.pos.length / 3;
    push(0, end * half, 0, 0, end, 0);
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      push(Math.cos(a) * radius, end * half, Math.sin(a) * radius, 0, end, 0);
    }
    for (let i = 0; i < seg; i++) {
      if (end === 1) geo.idx.push(centerBase, centerBase + 1 + i, centerBase + 2 + i);
      else geo.idx.push(centerBase, centerBase + 2 + i, centerBase + 1 + i);
    }
  }
}

const io = new NodeIO().registerExtensions([KHRMaterialsEmissiveStrength]);

const res = await fetch(HELMET_URL);
if (!res.ok) throw new Error(`Failed to fetch helmet: ${res.status}`);
const doc = await io.readBinary(new Uint8Array(await res.arrayBuffer()));

const root = doc.getRoot();
const scene = root.listScenes()[0];
const buffer = root.listBuffers()[0];
const emissiveStrengthExt = doc.createExtension(KHRMaterialsEmissiveStrength);

// Helmet bounding box (from POSITION accessor min/max) to place gear sensibly.
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const p = prim.getAttribute("POSITION");
    if (!p) continue;
    const lo = p.getMin([]);
    const hi = p.getMax([]);
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], lo[i]);
      max[i] = Math.max(max[i], hi[i]);
    }
  }
}
const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
const c = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];

function addPart(
  materialName,
  geo,
  {
    baseColor = [0.09, 0.1, 0.12], // gunmetal
    emissive = [0, 0, 0],
    metallic = 0.85,
    roughness = 0.38,
    emissiveStrength,
  },
) {
  const position = doc
    .createAccessor()
    .setType("VEC3")
    .setArray(new Float32Array(geo.pos))
    .setBuffer(buffer);
  const normal = doc
    .createAccessor()
    .setType("VEC3")
    .setArray(new Float32Array(geo.nor))
    .setBuffer(buffer);
  const indices = doc
    .createAccessor()
    .setType("SCALAR")
    .setArray(new Uint16Array(geo.idx))
    .setBuffer(buffer);

  // Start hidden (alpha 0) so a late tint pass never flashes factory colors.
  // Runtime toggles alpha + engama housing metal with chassis/finish.
  const material = doc
    .createMaterial(materialName)
    .setBaseColorFactor([baseColor[0], baseColor[1], baseColor[2], 0])
    .setMetallicFactor(metallic)
    .setRoughnessFactor(roughness)
    .setEmissiveFactor(emissive)
    .setDoubleSided(true)
    .setAlphaMode("MASK")
    .setAlphaCutoff(0.5);

  // Push emissive past 1.0 for a hot, glowing look (Terminator-style eye).
  if (emissiveStrength) {
    material.setExtension(
      "KHR_materials_emissive_strength",
      emissiveStrengthExt.createEmissiveStrength().setEmissiveStrength(emissiveStrength),
    );
  }

  const prim = doc
    .createPrimitive()
    .setAttribute("POSITION", position)
    .setAttribute("NORMAL", normal)
    .setIndices(indices)
    .setMaterial(material);

  scene.addChild(
    doc.createNode(materialName).setMesh(doc.createMesh(materialName).addPrimitive(prim)),
  );
}

// Gear hugs a sphere-ish surface (helmet ≈ sphere), embedded slightly so it
// reads as bolted-on, not floating. Placed off the visor so nothing covers it.

// --- Side rail: slender tubular mast + collar clamps (antenna-like finish) ---
// Rounded cylinders instead of chunky boxes — reads as machined gear, not Lego.
const rail = createGeometry();
{
  const rx = c[0] + size[0] * 0.36;
  const rz = c[2] + size[2] * 0.14;
  const ry = c[1];
  const mastR = size[0] * 0.018;
  const mastH = size[1] * 0.38;

  // Main vertical tube
  addCylinder(rail, {
    radius: mastR,
    height: mastH,
    seg: 24,
    axis: "y",
    center: [rx, ry, rz],
  });
  // Tip / base caps (slightly wider, like the antenna tip)
  for (const dy of [mastH * 0.48, -mastH * 0.48]) {
    addCylinder(rail, {
      radius: mastR * 1.55,
      height: size[1] * 0.028,
      seg: 20,
      axis: "y",
      center: [rx, ry + dy, rz],
    });
  }
  // Two collar clamps bolted to the helmet side
  for (const dy of [-0.12, 0.12]) {
    addCylinder(rail, {
      radius: mastR * 2.4,
      height: size[1] * 0.045,
      seg: 20,
      axis: "y",
      center: [rx, ry + size[1] * dy, rz],
    });
    // Short stub toward the shell (mount peg)
    addCylinder(rail, {
      radius: mastR * 1.15,
      height: size[0] * 0.055,
      seg: 16,
      axis: "x",
      center: [rx - size[0] * 0.028, ry + size[1] * dy, rz],
    });
  }
}
// Same gunmetal PBR as the antenna — runtime engama with chassis/finish.
addPart("part_rail", rail, {
  baseColor: [0.09, 0.1, 0.12],
  emissive: [0, 0, 0],
  metallic: 0.85,
  roughness: 0.38,
});

// --- Bionic telescopic optic: full tube is factory-locked (black + hot IR) ---
// Housing does NOT engama — brand optic. Rail/antenna still follow chassis.
const podMetal = createGeometry();
const podGlass = createGeometry();
const podEye = createGeometry();
{
  const px = c[0] + size[0] * 0.28;
  const py = c[1] + size[1] * 0.24;
  const z0 = c[2] + size[2] * 0.26; // base near the surface, builds forward
  const sx = size[0];
  const sz = size[2];

  // Mount collar → barrel segment A → narrower segment B (telescoping step).
  addCylinder(podMetal, { radius: sx * 0.1, height: sz * 0.05, axis: "z", center: [px, py, z0] });
  addCylinder(podMetal, { radius: sx * 0.09, height: sz * 0.06, axis: "z", center: [px, py, z0 + sz * 0.05] });
  addCylinder(podMetal, { radius: sx * 0.075, height: sz * 0.05, axis: "z", center: [px, py, z0 + sz * 0.105] });
  // Front bezel lip
  addCylinder(podMetal, { radius: sx * 0.085, height: sz * 0.02, axis: "z", center: [px, py, z0 + sz * 0.14] });

  // Dark IR glass
  addCylinder(podGlass, { radius: sx * 0.062, height: sz * 0.014, axis: "z", center: [px, py, z0 + sz * 0.152] });

  // Hot infrared pupil — pure red core
  addCylinder(podEye, { radius: sx * 0.048, height: sz * 0.008, axis: "z", center: [px, py, z0 + sz * 0.158] }); // iris
  addCylinder(podEye, { radius: sx * 0.028, height: sz * 0.012, axis: "z", center: [px, py, z0 + sz * 0.162] }); // pupil
  addCylinder(podEye, { radius: sx * 0.012, height: sz * 0.014, axis: "z", center: [px, py, z0 + sz * 0.166] }); // core
}
addPart("part_pod", podMetal, {
  baseColor: [0.05, 0.05, 0.055], // matte black tube
  emissive: [0, 0, 0],
  metallic: 0.72,
  roughness: 0.42,
});
addPart("part_pod_glass", podGlass, {
  baseColor: [0.03, 0.03, 0.035],
  emissive: [0.02, 0.0, 0.0],
  metallic: 0.1,
  roughness: 0.14,
});
addPart("part_pod_eye", podEye, {
  baseColor: [0.12, 0.0, 0.01],
  emissive: [1.0, 0.02, 0.03], // pure hot IR red
  emissiveStrength: 5.0,
  metallic: 0.02,
  roughness: 0.18,
});

// --- Antenna: short side-mounted mast — stays within the helmet's vertical footprint
// Placed on the left flank at mid-upper height so the viewer doesn't have to
// zoom out to fit a tall spike. Total tip height ≈ 0.42 × size[1] above center,
// well below the helmet crown at 0.5 × size[1].
const antenna = createGeometry();
{
  const ax = c[0] - size[0] * 0.42; // left flank, not top
  const ay = c[1] + size[1] * 0.29; // mid-upper section
  const az = c[2] + size[2] * 0.02;
  // Short mast
  addCylinder(antenna, {
    radius: size[0] * 0.016,
    height: size[1] * 0.22,
    axis: "y",
    center: [ax, ay, az],
  });
  // Tip cap
  addCylinder(antenna, {
    radius: size[0] * 0.038,
    height: size[1] * 0.038,
    axis: "y",
    center: [ax, ay + size[1] * 0.125, az],
  });
  // Base collar bolted to the helmet side
  addBox(antenna, size[0] * 0.055, size[1] * 0.04, size[2] * 0.055, [
    ax,
    ay - size[1] * 0.12,
    az,
  ]);
}
addPart("part_antenna", antenna, { emissive: [0, 0, 0] });

mkdirSync(dirname(OUT), { recursive: true });
await io.write(OUT, doc);
console.log(`Wrote ${OUT}`);
console.log(`helmet bbox size ~ [${size.map((n) => n.toFixed(2)).join(", ")}]`);
