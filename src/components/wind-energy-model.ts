import * as THREE from "three";
import type { EnergyModel } from "./energy-scene-types";
import { energyModelKit } from "./energy-model-kit";

/** Original airfoil, tower and cottage geometry; no downloaded model assets. */
export function createWindEnergyModel(): EnergyModel {
  const kit = energyModelKit();
  const root = new THREE.Group();
  const porcelain = kit.material(0xf2f1e7, 0.36, 0.18);
  const steel = kit.material(0x879c97, 0.3, 0.65);
  const roof = kit.material(0x355e55, 0.54, 0.2);
  const plaster = kit.material(0xe8dfc9, 0.85);
  const stone = kit.material(0xb5b7a5, 0.95);
  const grass = kit.material(0x92a58b, 0.95);
  const trim = kit.material(0xf5eedb, 0.65);
  const timber = kit.material(0x715c42, 0.85);
  const cableMat = kit.material(0x394a42, 0.8);
  const glass = kit.material(0x2c4947, 0.24, 0.2);
  glass.emissive.setHex(0xffc46b);
  const unlitGlass = new THREE.Color(0x2c4947);
  const litGlass = new THREE.Color(0xd7ac64);
  const pulseMat = kit.material(0xe5b351, 0.4);
  pulseMat.emissive.setHex(0xffc35c);
  pulseMat.emissiveIntensity = 1.8;
  kit.shadow(root, 0, 0.2, 2.12, 1.42);
  kit.box(root, [3.35, 0.12, 2.3], [0, 0.075, 0], stone);
  kit.box(root, [3.29, 0.04, 2.24], [0, 0.155, 0], grass);

  const tower = new THREE.Group();
  tower.position.set(-0.69, 0.18, -0.48);
  root.add(tower);
  kit.cylinder(tower, 0.34, 0.39, 0.11, [0, 0.055, 0], stone);
  kit.cylinder(tower, 0.17, 0.2, 0.07, [0, 0.14, 0], steel);
  kit.cylinder(tower, 0.065, 0.14, 3.76, [0, 2.015, 0], porcelain, 36);
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    kit.cylinder(tower, 0.018, 0.018, 0.027, [Math.sin(angle) * 0.16, 0.19, Math.cos(angle) * 0.16], steel, 6);
  }
  // Door, flange and yaw bearing make the tower read as an engineered assembly.
  kit.box(tower, [0.09, 0.21, 0.015], [0, 0.36, 0.132], steel);
  kit.cylinder(tower, 0.072, 0.074, 0.026, [0, 2.6, 0], steel);
  kit.cylinder(tower, 0.12, 0.12, 0.11, [0, 3.86, 0], steel);
  const nacelle = kit.sphere(tower, 1, [0, 4.01, -0.055], porcelain);
  nacelle.scale.set(0.22, 0.2, 0.43);
  kit.box(tower, [0.19, 0.07, 0.26], [0, 4.18, -0.14], porcelain);
  for (let i = 0; i < 5; i++) kit.box(tower, [0.008, 0.055, 0.013], [0.211, 4.00, -0.12 - i * 0.034], steel);
  kit.cylinder(tower, 0.009, 0.009, 0.13, [0, 4.27, -0.3], steel, 8);
  const rotor = new THREE.Group();
  rotor.position.set(0, 4.015, 0.365);
  tower.add(rotor);

  // NACA-like closed sections, narrowing and twisting along the blade span.
  const vertices: number[] = [];
  const indices: number[] = [];
  const rings = 24;
  const sides = 24;
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const chord = (0.12 + Math.sin(Math.PI * Math.pow(t, 0.65)) * 0.18) * (1 - 0.85 * t);
    const twist = 0.42 * (1 - t) - 0.08;
    for (let s = 0; s < sides; s++) {
      const angle = s / sides * Math.PI * 2;
      const u = (1 - Math.cos(angle)) / 2;
      const thickness = 5 * 0.15 * chord * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u ** 2 + 0.2843 * u ** 3 - 0.1036 * u ** 4);
      const x = (u - 0.3) * chord;
      const z = Math.sign(Math.sin(angle)) * thickness;
      vertices.push(x * Math.cos(twist) - z * Math.sin(twist) + 0.14 * t ** 2,
        0.11 + t * 1.53, x * Math.sin(twist) + z * Math.cos(twist) + 0.045 * t ** 2);
      if (r < rings) {
        const a = r * sides + s, b = r * sides + (s + 1) % sides, c = a + sides, d = b + sides;
        indices.push(a, b, c, b, d, c);
      }
    }
  }
  const bladeGeometry = kit.track(new THREE.BufferGeometry());
  bladeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  bladeGeometry.setIndex(indices);
  bladeGeometry.computeVertexNormals();
  for (let i = 0; i < 3; i++) {
    const blade = kit.mesh(rotor, bladeGeometry, porcelain);
    blade.rotation.z = i * Math.PI * 2 / 3;
  }
  const spinner = kit.sphere(rotor, 1, [0, 0, 0.035], porcelain);
  spinner.scale.set(0.16, 0.16, 0.24);
  kit.sphere(rotor, 0.048, [0, 0, 0.263], steel);

  const house = new THREE.Group();
  house.position.set(0.65, 0.18, 0.32);
  root.add(house);
  kit.box(house, [1.5, 0.13, 1.42], [0, 0.065, 0], stone);
  kit.box(house, [1.35, 0.94, 1.22], [0, 0.59, 0], plaster);
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-0.675, 0); gableShape.lineTo(0.675, 0); gableShape.lineTo(0, 0.47); gableShape.closePath();
  const gable = kit.mesh(house, kit.track(new THREE.ExtrudeGeometry(gableShape, { depth: 1.22, bevelEnabled: false })), plaster, [0, 1.06, -0.61]);
  gable.name = "Cottage gable";
  for (const side of [-1, 1]) {
    const slope = kit.box(house, [0.93, 0.065, 1.47], [side * 0.37, 1.29, 0], roof);
    slope.rotation.z = side * -0.6;
    for (let i = 0; i < 10; i++) {
      const seam = kit.box(house, [0.93, 0.014, 0.012], [side * 0.37, 1.329, -0.66 + i * 0.146], steel);
      seam.rotation.z = side * -0.6;
    }
  }
  kit.box(house, [0.06, 0.055, 1.5], [0, 1.56, 0], roof);
  kit.box(house, [0.18, 0.36, 0.2], [0.36, 1.44, -0.32], plaster);
  kit.box(house, [0.23, 0.05, 0.25], [0.36, 1.63, -0.32], stone);
  kit.box(house, [0.25, 0.55, 0.035], [0, 0.39, 0.63], timber);
  kit.sphere(house, 0.018, [0.075, 0.41, 0.66], pulseMat);
  for (const x of [-0.43, 0.43]) {
    kit.box(house, [0.33, 0.39, 0.045], [x, 0.66, 0.628], trim);
    kit.box(house, [0.265, 0.315, 0.052], [x, 0.66, 0.641], glass);
    kit.box(house, [0.017, 0.33, 0.065], [x, 0.66, 0.65], trim);
    kit.box(house, [0.29, 0.017, 0.065], [x, 0.66, 0.65], trim);
    kit.box(house, [0.37, 0.035, 0.11], [x, 0.45, 0.66], stone);
  }
  kit.box(house, [0.035, 0.39, 0.44], [0.687, 0.66, -0.04], trim);
  kit.box(house, [0.045, 0.31, 0.36], [0.699, 0.66, -0.04], glass);
  kit.box(house, [0.06, 0.33, 0.018], [0.71, 0.66, -0.04], trim);
  kit.box(root, [0.35, 0.035, 0.38], [0.65, 0.20, 1.02], stone);
  const connection = kit.cable(root, [new THREE.Vector3(-0.69, 0.37, -0.35), new THREE.Vector3(-0.88, 0.20, 0.43), new THREE.Vector3(-0.44, 0.20, 0.89), new THREE.Vector3(-0.12, 0.26, 0.89), new THREE.Vector3(-0.07, 0.68, 0.90)], 0.019, cableMat);
  kit.box(root, [0.12, 0.18, 0.08], [-0.07, 0.68, 0.96], steel);
  const pulse = kit.sphere(root, 0.038, [0, 0, 0], pulseMat);
  const porchLight = new THREE.PointLight(0xffc475, 0, 2, 2);
  porchLight.position.set(0.65, 0.82, 1.14);
  root.add(porchLight);
  const shrubs = kit.material(0x4f7054, 1);
  for (const [x, z, s] of [[1.32, -0.72, 0.23], [1.12, -0.78, 0.18], [-1.38, 0.76, 0.18]]) {
    const shrub = kit.sphere(root, s, [x, 0.22 + s / 2, z], shrubs);
    shrub.scale.y = 0.8;
  }
  let lastDark: boolean | null = null;
  return {
    root,
    camera: { position: [7, 5.9, 13], target: [0, 2.6, 0], span: 6.1 },
    update(frame) {
      rotor.rotation.z = -frame.rotorAngle;
      glass.emissiveIntensity = frame.wind * (frame.dark ? 2.4 : 1.8);
      glass.color.copy(unlitGlass).lerp(litGlass, frame.wind);
      porchLight.intensity = frame.wind * (frame.dark ? 1.15 : 0.4);
      pulse.visible = frame.wind > 0.03 && !frame.reducedMotion;
      pulse.position.copy(connection.getPoint((frame.time * (0.3 + frame.wind * 0.7)) % 1));
      if (lastDark !== frame.dark) {
        lastDark = frame.dark;
        porcelain.color.setHex(frame.dark ? 0xc5d6d3 : 0xf2f1e7);
        plaster.color.setHex(frame.dark ? 0xa6b3a9 : 0xe8dfc9);
        grass.color.setHex(frame.dark ? 0x455f51 : 0x92a58b);
      }
    },
    dispose: kit.dispose,
  };
}
