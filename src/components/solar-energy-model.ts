import * as THREE from "three";
import type { EnergyModel } from "./energy-scene-types";
import { energyModelKit } from "./energy-model-kit";

/** A two-floor architectural cutaway with original photovoltaic and fan geometry. */
export function createSolarEnergyModel(): EnergyModel {
  const kit = energyModelKit();
  const root = new THREE.Group();
  const concrete = kit.material(0xe1decf, 0.85);
  const wall = kit.material(0xe9e3d4, 0.8);
  const inside = kit.material(0x8b9d8f, 0.9);
  const green = kit.material(0x365e54, 0.6);
  const metal = kit.material(0xa6b5b3, 0.32, 0.7);
  const darkMetal = kit.material(0x2c423e, 0.42, 0.45);
  const wood = kit.material(0x9c7950, 0.84);
  const turf = kit.material(0x91a589, 1);
  const pv = kit.material(0x172e4b, 0.27, 0.45);
  const pvAlternate = kit.material(0x213d59, 0.28, 0.4);
  const cellLine = kit.material(0x6e94ac, 0.33, 0.6);
  const light = kit.material(0xdacba6, 0.4);
  light.emissive.setHex(0xffc775);
  const interiorGlow = kit.material(0xd0b78c, 0.85);
  interiorGlow.emissive.setHex(0xeab96f);
  const batteryCharge = kit.material(0x719a77, 0.4, 0.1);
  batteryCharge.emissive.setHex(0x719a77);
  batteryCharge.emissiveIntensity = 0.25;
  const sunMat = kit.material(0xf1c26a, 0.65);
  sunMat.emissive.setHex(0xffc669); sunMat.emissiveIntensity = 0.7;
  const moonMat = kit.material(0xe4e8d5, 0.5);
  moonMat.emissive.setHex(0xc7d9d6); moonMat.emissiveIntensity = 0.65;
  kit.shadow(root, 0, 0, 1.94, 1.45);
  kit.box(root, [3.05, 0.12, 2.12], [0, 0.075, 0], concrete);
  kit.box(root, [2.99, 0.035, 2.06], [0, 0.151, 0], turf);
  const home = new THREE.Group();
  home.position.set(-0.3, 0.19, 0);
  root.add(home);
  // Front facade is open between structural columns, revealing both floors.
  for (const y of [0.06, 1.22, 2.39]) kit.box(home, [1.94, 0.12, 1.5], [0, y, 0], concrete);
  kit.box(home, [1.76, 2.23, 0.10], [0, 1.22, -0.65], inside);
  kit.box(home, [0.11, 2.28, 1.3], [-0.86, 1.22, 0], wall);
  kit.box(home, [0.10, 2.28, 1.3], [0.86, 1.22, 0], wall);
  for (const x of [-0.85, 0.85]) kit.box(home, [0.13, 2.31, 0.13], [x, 1.22, 0.65], concrete);
  for (const y of [0.23, 1.39]) {
    kit.box(home, [1.62, 0.03, 1.17], [0, y - 0.085, 0], wood);
    kit.box(home, [1.42, 0.65, 0.02], [0, y + 0.36, -0.59], interiorGlow);
    kit.box(home, [1.72, 0.05, 0.05], [0, y + 0.90, 0.6], green);
    // Slim front glazing frame and warm ceiling luminaire.
    kit.box(home, [0.038, 0.96, 0.04], [0.24, y + 0.4, 0.68], green);
    kit.box(home, [0.40, 0.055, 0.26], [-0.2, y + 0.85, 0.05], darkMetal);
    kit.box(home, [0.35, 0.035, 0.23], [-0.2, y + 0.817, 0.05], light);
  }
  // Side windows sit proud of the right wall so their light remains readable.
  for (const y of [0.69, 1.86]) {
    kit.box(home, [0.028, 0.59, 0.80], [0.92, y, -0.02], green);
    kit.box(home, [0.036, 0.50, 0.71], [0.94, y, -0.02], light);
    kit.box(home, [0.045, 0.53, 0.025], [0.957, y, -0.02], green);
    kit.box(home, [0.045, 0.024, 0.74], [0.957, y, -0.02], green);
  }
  // Door, steps, sofa, table, books and a balcony give the miniature scale.
  kit.box(home, [0.4, 0.79, 0.035], [0.52, 0.58, 0.68], green);
  kit.box(home, [0.25, 0.24, 0.04], [0.52, 0.75, 0.704], light);
  kit.box(home, [0.028, 0.12, 0.055], [0.65, 0.54, 0.73], metal);
  kit.box(home, [0.55, 0.08, 0.27], [0.52, 0.12, 0.85], concrete);
  kit.box(home, [0.69, 0.21, 0.38], [-0.38, 0.32, -0.28], green);
  kit.box(home, [0.69, 0.31, 0.1], [-0.38, 0.45, -0.48], green);
  for (const x of [-0.69, -0.07]) kit.box(home, [0.07, 0.23, 0.4], [x, 0.43, -0.28], green);
  kit.box(home, [0.37, 0.04, 0.25], [-0.35, 0.35, 0.24], wood);
  kit.cylinder(home, 0.035, 0.07, 0.18, [-0.35, 0.25, 0.24], metal);
  kit.box(home, [0.35, 0.49, 0.25], [0.56, 1.52, -0.40], wood);
  for (let i = 0; i < 4; i++) kit.box(home, [0.045, 0.18 + i % 2 * 0.04, 0.15], [0.44 + i * 0.065, 1.87, -0.42], i % 2 ? green : concrete);
  kit.box(home, [1.96, 0.075, 0.32], [0, 1.22, 0.82], concrete);
  for (const x of [-0.87, -0.48, 0, 0.48, 0.87]) kit.cylinder(home, 0.015, 0.015, 0.34, [x, 1.43, 0.95], darkMetal, 8);
  kit.box(home, [1.82, 0.025, 0.03], [0, 1.61, 0.95], darkMetal);

  const fan = new THREE.Group();
  fan.position.set(-0.3, 1.89, 0.35);
  home.add(fan);
  const fanFrame = kit.mesh(home, kit.track(new THREE.TorusGeometry(0.31, 0.015, 8, 40)), metal, [-0.3, 1.89, 0.34]);
  fanFrame.name = "Upper floor fan guard";
  kit.cylinder(home, 0.018, 0.018, 0.31, [-0.3, 2.19, 0.28], darkMetal, 10);
  const fanBlade = new THREE.Shape();
  fanBlade.moveTo(-0.025, 0.02); fanBlade.bezierCurveTo(-0.10, 0.13, -0.14, 0.28, -0.05, 0.29);
  fanBlade.bezierCurveTo(0.04, 0.29, 0.065, 0.12, 0.025, 0.02); fanBlade.closePath();
  const fanGeometry = kit.track(new THREE.ExtrudeGeometry(fanBlade, { depth: 0.018, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.005, bevelThickness: 0.004 }));
  for (let i = 0; i < 3; i++) {
    const blade = kit.mesh(fan, fanGeometry, green);
    blade.rotation.z = i * Math.PI * 2 / 3;
  }
  kit.sphere(fan, 0.06, [0, 0, 0.037], metal);
  // Roof parapet and a pair of tilted, individually framed PV modules.
  kit.box(home, [1.96, 0.13, 0.065], [0, 2.50, -0.72], concrete);
  for (const x of [-0.94, 0.94]) kit.box(home, [0.06, 0.13, 1.48], [x, 2.50, 0], concrete);
  for (const x of [-0.46, 0.46]) {
    for (const z of [-0.4, 0.37]) kit.box(home, [0.045, z < 0 ? 0.41 : 0.16, 0.05], [x, z < 0 ? 2.67 : 2.55, z], metal);
    const panel = new THREE.Group();
    panel.position.set(x, 2.77, -0.02); panel.rotation.x = 0.30; home.add(panel);
    kit.box(panel, [0.86, 0.055, 1.06], [0, 0, 0], metal);
    kit.box(panel, [0.80, 0.02, 1], [0, 0.036, 0], darkMetal);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
      const cx = (col - 1) * 0.26, cz = (row - 1.5) * 0.244;
      kit.box(panel, [0.247, 0.012, 0.229], [cx, 0.052, cz], (row + col) % 2 ? pv : pvAlternate);
      for (const offset of [-0.062, 0.062]) kit.box(panel, [0.004, 0.002, 0.227], [cx + offset, 0.059, cz], cellLine);
    }
  }

  const battery = new THREE.Group();
  battery.position.set(1.12, 0.2, 0.20); root.add(battery);
  kit.box(battery, [0.40, 0.79, 0.36], [0, 0.41, 0], concrete);
  kit.box(battery, [0.25, 0.08, 0.22], [0, 0.84, 0], darkMetal);
  kit.box(battery, [0.30, 0.56, 0.02], [0, 0.43, 0.19], darkMetal);
  const fill = kit.box(battery, [0.22, 0.46, 0.022], [0, 0.43, 0.208], batteryCharge);
  for (let i = 0; i < 4; i++) kit.box(battery, [0.25, 0.017, 0.025], [0, 0.28 + i * 0.102, 0.225], darkMetal);
  kit.box(battery, [0.15, 0.028, 0.02], [0, 0.73, 0.2], green);
  const connection = kit.cable(root, [new THREE.Vector3(0.6, 2.98, -0.2), new THREE.Vector3(0.73, 2.60, -0.3), new THREE.Vector3(0.73, 0.4, -0.3), new THREE.Vector3(1.12, 0.22, -0.17), new THREE.Vector3(1.12, 0.91, 0.2)], 0.018, darkMetal);
  const pulse = kit.sphere(root, 0.04, [0, 0, 0], sunMat);

  const sun = new THREE.Group();
  sun.position.set(0.57, 4.11, -0.16); root.add(sun);
  kit.sphere(sun, 0.31, [0, 0, 0], sunMat);
  for (let i = 0; i < 8; i++) {
    const ray = kit.box(sun, [0.025, 0.12, 0.025], [Math.sin(i * Math.PI / 4) * 0.46, Math.cos(i * Math.PI / 4) * 0.46, 0], sunMat);
    ray.rotation.z = -i * Math.PI / 4;
  }
  // A genuine crescent silhouette, not a dark sphere masking the sun.
  const crescent = new THREE.Shape();
  crescent.moveTo(0.16, 0.35);
  crescent.bezierCurveTo(-0.42, 0.43, -0.48, -0.30, -0.02, -0.36);
  crescent.bezierCurveTo(0.18, -0.38, 0.34, -0.22, 0.37, -0.09);
  crescent.bezierCurveTo(-0.04, -0.28, -0.18, 0.17, 0.16, 0.35);
  const moon = kit.mesh(root, kit.track(new THREE.ExtrudeGeometry(crescent, { depth: 0.09, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 32 })), moonMat, [0.57, 4.11, -0.16]);
  moon.rotation.y = 0.4;
  const foliage = kit.material(0x527455, 0.95);
  for (const [x, z] of [[-1.33, 0.72], [1.18, -0.74]]) {
    kit.cylinder(root, 0.12, 0.10, 0.17, [x, 0.24, z], wood, 12);
    const plant = kit.sphere(root, 0.19, [x, 0.44, z], foliage); plant.scale.y = 1.15;
  }
  let lastDark: boolean | null = null;
  return {
    root,
    camera: { position: [6.1, 4.8, 12], target: [0, 2.03, 0], span: 5.15 },
    update(frame) {
      fan.rotation.z = -frame.fanAngle;
      light.emissiveIntensity = frame.lightsOn ? (frame.dark ? 2.6 : 1.9) : 0;
      light.color.setHex(frame.lightsOn ? 0xffda94 : 0x5e7770);
      interiorGlow.emissiveIntensity = frame.lightsOn ? 0.75 : 0;
      interiorGlow.color.setHex(frame.lightsOn ? 0xd0b78c : 0x7f9587);
      fill.scale.y = Math.max(0.001, frame.battery * 0.46);
      fill.position.y = 0.20 + frame.battery * 0.23;
      batteryCharge.color.setHex(frame.battery < 0.15 ? 0xc79754 : 0x719a77);
      sun.visible = !frame.dark;
      moon.visible = frame.dark;
      pulse.visible = !frame.dark && frame.battery < 1 && !frame.reducedMotion;
      pulse.position.copy(connection.getPoint((frame.time * 0.35) % 1));
      if (lastDark !== frame.dark) {
        lastDark = frame.dark;
        concrete.color.setHex(frame.dark ? 0x9eb0a7 : 0xe1decf);
        wall.color.setHex(frame.dark ? 0xb5c1b5 : 0xe9e3d4);
        turf.color.setHex(frame.dark ? 0x435d4d : 0x91a589);
      }
    },
    dispose: kit.dispose,
  };
}
