import * as THREE from "three";

/** Small, original model primitives shared by the two energy studies. */
export function energyModelKit() {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const boxGeometry = track(new THREE.BoxGeometry(1, 1, 1));
  function track<T extends THREE.BufferGeometry>(geometry: T): T { geometries.add(geometry); return geometry; }
  function material(color: THREE.ColorRepresentation, roughness = 0.65, metalness = 0) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.add(mat);
    return mat;
  }
  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, mat: THREE.Material, position: [number, number, number] = [0, 0, 0]) {
    const result = new THREE.Mesh(geometry, mat);
    result.position.set(...position);
    parent.add(result);
    return result;
  }
  function box(parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], mat: THREE.Material) {
    const result = mesh(parent, boxGeometry, mat, position);
    result.scale.set(...size);
    return result;
  }
  function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, position: [number, number, number], mat: THREE.Material, segments = 24) {
    return mesh(parent, track(new THREE.CylinderGeometry(top, bottom, height, segments)), mat, position);
  }
  function sphere(parent: THREE.Object3D, radius: number, position: [number, number, number], mat: THREE.Material) {
    return mesh(parent, track(new THREE.SphereGeometry(radius, 24, 16)), mat, position);
  }
  function cable(parent: THREE.Object3D, points: THREE.Vector3[], radius: number, mat: THREE.Material) {
    const curve = new THREE.CatmullRomCurve3(points);
    mesh(parent, track(new THREE.TubeGeometry(curve, 32, radius, 6, false)), mat);
    return curve;
  }
  function shadow(parent: THREE.Object3D, x: number, z: number, width: number, depth: number) {
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x122923, transparent: true, opacity: 0.022 + i * 0.009, depthWrite: false });
      materials.add(mat);
      const disk = mesh(parent, track(new THREE.CircleGeometry(1, 48)), mat, [x, 0.012 + i * 0.001, z]);
      disk.rotation.x = -Math.PI / 2;
      disk.scale.set(width * (1 - i * 0.12), depth * (1 - i * 0.12), 1);
    }
  }
  function dispose() { geometries.forEach(geometry => geometry.dispose()); materials.forEach(mat => mat.dispose()); }
  return { track, material, mesh, box, cylinder, sphere, cable, shadow, dispose };
}
