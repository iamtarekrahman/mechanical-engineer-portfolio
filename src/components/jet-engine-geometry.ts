import * as THREE from "three";
import { ENGINE_PARTS, type EnginePartId } from "./jet-engine-parts";

export { ENGINE_PARTS } from "./jet-engine-parts";

export type EnginePartGeometry = {
  id: EnginePartId;
  group: THREE.Group;
  origin: THREE.Vector3;
  offset: THREE.Vector3;
};

type ShellStation = { x: number; radius: number; thickness: number };
type Finish =
  | "silver"
  | "steel"
  | "dark"
  | "aluminum"
  | "casingSilver"
  | "titanium"
  | "brass"
  | "brassLight";

/**
 * Original, schematic turbofan assembly. Dimensions illustrate component order;
 * this geometry is a visual study rather than a manufacturing model.
 * X is longitudinal, with the intake toward negative X and Y pointing up.
 */
export function createEngineGeometry(): {
  root: THREE.Group;
  parts: EnginePartGeometry[];
  rotors: THREE.Object3D[];
  dispose: () => void;
} {
  const root = new THREE.Group();
  root.name = "Turbofan conceptual assembly";
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const instances: THREE.InstancedMesh[] = [];
  const rotors: THREE.Object3D[] = [];
  const finishes: Record<
    Finish,
    { color: number; metalness: number; roughness: number }
  > = {
    silver: { color: 0xb9ccc9, metalness: 0.8, roughness: 0.28 },
    steel: { color: 0x607977, metalness: 0.85, roughness: 0.33 },
    dark: { color: 0x263c3d, metalness: 0.72, roughness: 0.38 },
    aluminum: { color: 0xa4a6a8, metalness: 0.92, roughness: 0.43 },
    casingSilver: { color: 0xc2c4c7, metalness: 0.92, roughness: 0.4 },
    titanium: { color: 0x72767c, metalness: 0.9, roughness: 0.45 },
    brass: { color: 0x987546, metalness: 0.78, roughness: 0.36 },
    brassLight: { color: 0xc8a46c, metalness: 0.76, roughness: 0.29 },
  };

  const layout: Record<
    EnginePartId,
    { x: number; offset: [number, number, number] }
  > = {
    fan: { x: -2, offset: [-2.45, 0, 0] },
    compressor: { x: -0.8, offset: [-1.25, 0, 0] },
    combustor: { x: 0.3, offset: [0.1, 0, 0] },
    turbine: { x: 1.3, offset: [1.3, 0, 0] },
    nozzle: { x: 2.2, offset: [2.3, 0, 0] },
    casing: { x: 0, offset: [0, -2.05, -0.65] },
  };
  const parts: EnginePartGeometry[] = ENGINE_PARTS.map(({ id, name }) => {
    const group = new THREE.Group();
    group.name = name;
    group.userData.partId = id;
    const origin = new THREE.Vector3(layout[id].x, 0, 0);
    group.position.copy(origin);
    root.add(group);
    return {
      id,
      group,
      origin,
      offset: new THREE.Vector3(...layout[id].offset),
    };
  });
  const groups = Object.fromEntries(
    parts.map((part) => [part.id, part.group]),
  ) as Record<EnginePartId, THREE.Group>;
  // The fan spins as one unit; downstream rotors exclude stationary vanes.
  rotors.push(groups.fan);

  function own<T extends THREE.BufferGeometry>(geometry: T): T {
    geometries.add(geometry);
    return geometry;
  }

  // Finishes are shared within each part, so highlighting one part cannot tint another.
  function material(id: EnginePartId, finish: Finish) {
    const key = `${id}:${finish}`;
    let value = materials.get(key);
    if (!value) {
      value = new THREE.MeshStandardMaterial({
        ...finishes[finish],
        side: THREE.DoubleSide,
      });
      value.name = key;
      value.userData.baseColor = finishes[finish].color;
      materials.set(key, value);
    }
    return value;
  }

  function mesh(
    id: EnginePartId,
    geometry: THREE.BufferGeometry,
    finish: Finish,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const object = new THREE.Mesh(geometry, material(id, finish));
    object.position.set(x, y, z);
    object.userData.partId = id;
    object.castShadow = true;
    object.receiveShadow = true;
    groups[id].add(object);
    return object;
  }

  function cylinder(
    id: EnginePartId,
    radius: number,
    length: number,
    finish: Finish,
    x: number,
    endRadius = radius,
  ) {
    const geometry = own(
      new THREE.CylinderGeometry(endRadius, radius, length, 48),
    );
    geometry.rotateZ(-Math.PI / 2);
    return mesh(id, geometry, finish, x);
  }

  function torus(
    id: EnginePartId,
    radius: number,
    tube: number,
    finish: Finish,
    x: number,
    y = 0,
    z = 0,
  ) {
    const geometry = own(new THREE.TorusGeometry(radius, tube, 8, 72));
    geometry.rotateY(Math.PI / 2);
    return mesh(id, geometry, finish, x, y, z);
  }

  function repeated(
    id: EnginePartId,
    geometry: THREE.BufferGeometry,
    finish: Finish,
    count: number,
    x = 0,
    phase = 0,
  ) {
    const object = new THREE.InstancedMesh(
      geometry,
      material(id, finish),
      count,
    );
    const rotation = new THREE.Matrix4();
    for (let index = 0; index < count; index++) {
      rotation.makeRotationX((index / count) * Math.PI * 2 + phase);
      object.setMatrixAt(index, rotation);
    }
    object.position.x = x;
    object.instanceMatrix.needsUpdate = true;
    object.userData.partId = id;
    object.castShadow = true;
    object.receiveShadow = true;
    groups[id].add(object);
    instances.push(object);
    return object;
  }

  /** Closed, gently cambered blade with radial sweep and changing pitch. */
  function blade(
    inner: number,
    outer: number,
    rootChord: number,
    tipChord: number,
    sweep: number,
    pitch: number,
  ) {
    const radialSteps = 9;
    const chordSteps = 5;
    const positions: number[] = [];
    const indices: number[] = [];
    const sideVertices = (radialSteps + 1) * (chordSteps + 1);
    for (let side = 0; side < 2; side++) {
      for (let row = 0; row <= radialSteps; row++) {
        const u = row / radialSteps;
        const radius = inner + (outer - inner) * u;
        const angle = sweep * Math.pow(u, 1.4);
        const chord =
          THREE.MathUtils.lerp(rootChord, tipChord, u) *
          (1 + 0.15 * Math.sin(u * Math.PI));
        const twist = pitch * (1 - 0.45 * u);
        for (let column = 0; column <= chordSteps; column++) {
          const v = column / chordSteps;
          const cross = (v - 0.5) * chord;
          const camber = Math.sin(v * Math.PI) * chord * 0.07;
          const thickness =
            (side ? -1 : 1) * 0.006 * (0.3 + Math.sin(v * Math.PI));
          const axial =
            cross * Math.sin(twist) + camber + thickness + 0.09 * u * u;
          const tangent = cross * Math.cos(twist);
          positions.push(
            axial,
            radius * Math.cos(angle) - tangent * Math.sin(angle),
            radius * Math.sin(angle) + tangent * Math.cos(angle),
          );
        }
      }
    }
    for (let side = 0; side < 2; side++) {
      for (let row = 0; row < radialSteps; row++) {
        for (let column = 0; column < chordSteps; column++) {
          const a = side * sideVertices + row * (chordSteps + 1) + column;
          const b = a + chordSteps + 1;
          if (side) indices.push(a, b + 1, b, a, a + 1, b + 1);
          else indices.push(a, b, b + 1, a, b + 1, a + 1);
        }
      }
    }
    const edge: number[] = [];
    for (let c = 0; c <= chordSteps; c++) edge.push(c);
    for (let r = 1; r <= radialSteps; r++)
      edge.push(r * (chordSteps + 1) + chordSteps);
    for (let c = chordSteps - 1; c >= 0; c--)
      edge.push(radialSteps * (chordSteps + 1) + c);
    for (let r = radialSteps - 1; r > 0; r--) edge.push(r * (chordSteps + 1));
    for (let i = 0; i < edge.length; i++) {
      const a = edge[i];
      const b = edge[(i + 1) % edge.length];
      indices.push(
        a,
        a + sideVertices,
        b + sideVertices,
        a,
        b + sideVertices,
        b,
      );
    }
    const geometry = own(new THREE.BufferGeometry());
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  /** A closed hollow shell, including its exposed cut edges. */
  function shell(
    stations: ShellStation[],
    start = 0,
    arc = Math.PI * 2,
    segments = 72,
  ) {
    const positions: number[] = [];
    const indices: number[] = [];
    const rowSize = segments + 1;
    const sideSize = stations.length * rowSize;
    for (let side = 0; side < 2; side++) {
      for (const station of stations) {
        const radius = station.radius - side * station.thickness;
        for (let step = 0; step <= segments; step++) {
          const angle = start + (step / segments) * arc;
          positions.push(
            station.x,
            radius * Math.cos(angle),
            radius * Math.sin(angle),
          );
        }
      }
    }
    for (let side = 0; side < 2; side++) {
      for (let row = 0; row < stations.length - 1; row++) {
        for (let step = 0; step < segments; step++) {
          const a = side * sideSize + row * rowSize + step;
          const b = a + rowSize;
          if (side) indices.push(a, b, b + 1, a, b + 1, a + 1);
          else indices.push(a, b + 1, b, a, a + 1, b + 1);
        }
      }
    }
    for (const row of [0, stations.length - 1]) {
      for (let step = 0; step < segments; step++) {
        const a = row * rowSize + step;
        if (row === 0)
          indices.push(
            a,
            a + sideSize,
            a + sideSize + 1,
            a,
            a + sideSize + 1,
            a + 1,
          );
        else
          indices.push(
            a,
            a + sideSize + 1,
            a + sideSize,
            a,
            a + 1,
            a + sideSize + 1,
          );
      }
    }
    for (const step of arc < Math.PI * 2 ? [0, segments] : []) {
      for (let row = 0; row < stations.length - 1; row++) {
        const a = row * rowSize + step;
        const b = a + rowSize;
        if (step === 0)
          indices.push(a, b, b + sideSize, a, b + sideSize, a + sideSize);
        else indices.push(a, b + sideSize, b, a, a + sideSize, b + sideSize);
      }
    }
    const geometry = own(new THREE.BufferGeometry());
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  // Fan: broad swept airfoils around a machined spinner and substantial hub.
  cylinder("fan", 0.265, 0.49, "steel", -0.02, 0.22);
  cylinder("fan", 0.12, 0.52, "dark", 0.32);
  cylinder("fan", 0.38, 0.08, "silver", 0.16);
  const spinner = own(new THREE.ConeGeometry(0.275, 0.64, 64));
  spinner.rotateZ(Math.PI / 2);
  mesh("fan", spinner, "silver", -0.39);
  torus("fan", 0.273, 0.016, "brassLight", -0.08);
  torus("fan", 0.355, 0.018, "dark", 0.19);
  repeated(
    "fan",
    blade(0.27, 1.02, 0.235, 0.195, -0.38, 0.72),
    "silver",
    22,
    0,
  );
  const fanBolt = own(new THREE.SphereGeometry(0.023, 8, 6));
  fanBolt.translate(-0.105, 0.315, 0);
  repeated("fan", fanBolt, "brassLight", 12);

  // Compressor: four shrinking rotor rows and three interleaved stator rows.
  cylinder("compressor", 0.15, 1.31, "dark", -0.05);
  const compressorBlade = blade(0.22, 0.67, 0.14, 0.1, -0.14, 0.63);
  const statorBlade = blade(0.255, 0.675, 0.1, 0.075, 0.06, -0.5);
  for (let stage = 0; stage < 4; stage++) {
    const x = -0.52 + stage * 0.3;
    const scale = 1 - stage * 0.09;
    cylinder("compressor", 0.255 * scale, 0.1, "steel", x);
    torus("compressor", 0.251 * scale, 0.014, "brass", x - 0.052);
    const rotor = repeated(
      "compressor",
      compressorBlade,
      "silver",
      28,
      x,
      stage * 0.055,
    );
    rotor.scale.set(1, scale, scale);
    rotors.push(rotor);
    if (stage < 3) {
      const stator = repeated(
        "compressor",
        statorBlade,
        "steel",
        24,
        x + 0.145,
        0.06,
      );
      stator.scale.set(1, scale - 0.035, scale - 0.035);
      torus("compressor", 0.68 * (scale - 0.035), 0.018, "silver", x + 0.15);
    }
  }
  mesh(
    "compressor",
    shell([
      { x: -0.63, radius: 0.702, thickness: 0.022 },
      { x: -0.57, radius: 0.702, thickness: 0.022 },
    ]),
    "steel",
  );
  mesh(
    "compressor",
    shell([
      { x: 0.46, radius: 0.509, thickness: 0.02 },
      { x: 0.52, radius: 0.509, thickness: 0.02 },
    ]),
    "steel",
  );

  // Combustor: a ring of individual liners, collars and a common fuel manifold.
  cylinder("combustor", 0.105, 1.09, "dark", 0);
  cylinder("combustor", 0.205, 0.1, "steel", -0.5);
  cylinder("combustor", 0.205, 0.1, "steel", 0.49);
  const liner = own(new THREE.CylinderGeometry(0.079, 0.104, 0.77, 20));
  liner.rotateZ(-Math.PI / 2);
  liner.translate(0, 0.388, 0);
  repeated("combustor", liner, "brass", 12);
  const collar = own(new THREE.TorusGeometry(0.105, 0.012, 6, 24));
  collar.rotateY(Math.PI / 2);
  collar.translate(-0.32, 0.388, 0);
  repeated("combustor", collar, "brassLight", 12);
  const backCollar = own(new THREE.TorusGeometry(0.083, 0.012, 6, 24));
  backCollar.rotateY(Math.PI / 2);
  backCollar.translate(0.31, 0.388, 0);
  repeated("combustor", backCollar, "silver", 12);
  const endCap = own(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20));
  endCap.rotateZ(-Math.PI / 2);
  endCap.translate(-0.391, 0.388, 0);
  repeated("combustor", endCap, "dark", 12);
  const injector = own(new THREE.CylinderGeometry(0.023, 0.023, 0.1, 10));
  injector.rotateZ(-Math.PI / 2);
  injector.translate(-0.44, 0.388, 0);
  repeated("combustor", injector, "silver", 12);
  torus("combustor", 0.389, 0.019, "brassLight", -0.48);
  torus("combustor", 0.475, 0.025, "steel", 0.43);
  const band = own(new THREE.TorusGeometry(0.096, 0.008, 5, 24));
  band.rotateY(Math.PI / 2);
  band.translate(-0.1, 0.388, 0);
  repeated("combustor", band, "brassLight", 12);

  // Turbine: three rows increase in diameter as the working gas expands.
  cylinder("turbine", 0.11, 1.13, "dark", -0.03);
  const turbineBlade = blade(0.255, 0.5, 0.13, 0.11, 0.12, -0.63);
  for (let stage = 0; stage < 3; stage++) {
    const x = -0.36 + stage * 0.31;
    const scale = 1 + stage * 0.07;
    cylinder("turbine", 0.265 * scale, 0.11, "steel", x);
    torus("turbine", 0.262 * scale, 0.018, "brassLight", x - 0.06);
    const rotor = repeated(
      "turbine",
      turbineBlade,
      stage === 0 ? "brass" : "silver",
      30,
      x,
      stage * 0.065,
    );
    rotor.scale.set(1, scale, scale);
    rotors.push(rotor);
    torus("turbine", 0.51 * scale, 0.016, "steel", x + 0.11);
  }

  // Exhaust: a hollow taper, centre cone and separate overlapping nozzle petals.
  mesh(
    "nozzle",
    shell([
      { x: -0.37, radius: 0.6, thickness: 0.035 },
      { x: -0.18, radius: 0.6, thickness: 0.032 },
      { x: 0.58, radius: 0.444, thickness: 0.028 },
    ]),
    "dark",
  );
  torus("nozzle", 0.598, 0.025, "silver", -0.3);
  torus("nozzle", 0.448, 0.017, "brass", 0.57);
  const petal = shell(
    [
      { x: -0.18, radius: 0.615, thickness: 0.012 },
      { x: 0.16, radius: 0.558, thickness: 0.012 },
      { x: 0.56, radius: 0.46, thickness: 0.012 },
    ],
    0,
    ((Math.PI * 2) / 18) * 0.91,
    4,
  );
  repeated("nozzle", petal, "steel", 18);
  const exhaustCone = own(new THREE.ConeGeometry(0.235, 0.94, 48));
  exhaustCone.rotateZ(-Math.PI / 2);
  mesh("nozzle", exhaustCone, "silver", 0.08);
  cylinder("nozzle", 0.238, 0.11, "steel", -0.4);

  // Open lower nacelle. Its removed upper half exposes the complete core assembly.
  const nacelle = [
    { x: -2.32, radius: 1.11, thickness: 0.045 },
    { x: -2.14, radius: 1.15, thickness: 0.045 },
    { x: -1.7, radius: 1.13, thickness: 0.04 },
    { x: -1.16, radius: 1.01, thickness: 0.035 },
    { x: -0.55, radius: 0.88, thickness: 0.03 },
    { x: 0.24, radius: 0.75, thickness: 0.027 },
    { x: 1.04, radius: 0.7, thickness: 0.027 },
    { x: 1.77, radius: 0.655, thickness: 0.025 },
  ];
  mesh("casing", shell(nacelle, Math.PI / 2, Math.PI, 64), "aluminum");
  // Thin edge rails trace the cut line without obscuring the internal blade rows.
  for (const sign of [-1, 1]) {
    const path = new THREE.CatmullRomCurve3(
      nacelle.map(
        ({ x, radius }) => new THREE.Vector3(x, 0, sign * (radius - 0.008)),
      ),
    );
    mesh(
      "casing",
      own(new THREE.TubeGeometry(path, 64, 0.017, 6, false)),
      "casingSilver",
    );
  }
  for (const [x, radius] of [
    [-1.73, 1.134],
    [-0.55, 0.884],
    [0.95, 0.709],
    [1.72, 0.66],
  ]) {
    const points = Array.from({ length: 33 }, (_, i) => {
      const theta = Math.PI / 2 + (i / 32) * Math.PI;
      return new THREE.Vector3(
        x,
        radius * Math.cos(theta),
        radius * Math.sin(theta),
      );
    });
    mesh(
      "casing",
      own(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          48,
          0.018,
          6,
          false,
        ),
      ),
      "casingSilver",
    );
  }
  // A pair of external longitudinal reinforcement strips grounds the cutaway.
  for (const angle of [Math.PI * 0.8, Math.PI * 1.2]) {
    const path = new THREE.CatmullRomCurve3(
      nacelle
        .slice(1)
        .map(
          ({ x, radius }) =>
            new THREE.Vector3(
              x,
              (radius + 0.014) * Math.cos(angle),
              (radius + 0.014) * Math.sin(angle),
            ),
        ),
    );
    mesh(
      "casing",
      own(new THREE.TubeGeometry(path, 48, 0.015, 6, false)),
      "titanium",
    );
  }

  root.updateMatrixWorld(true);
  let disposed = false;
  return {
    root,
    parts,
    rotors,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const instance of instances) instance.dispose();
      for (const geometry of geometries) geometry.dispose();
      for (const value of materials.values()) value.dispose();
      root.clear();
    },
  };
}
