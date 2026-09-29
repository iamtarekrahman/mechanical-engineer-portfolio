import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createEngineGeometry } from "./jet-engine-geometry";

export type EngineOptions = {
  explode: number;
  selected: string;
  wireframe: boolean;
  showLabels: boolean;
  mode: "orbit" | "pan";
  speed: number;
  spinning: boolean;
};
export type EngineCamera = {
  position: number[];
  target: number[];
  aspect: number;
  height: number;
  rotorAngle: number;
};
export type EngineScene = ReturnType<typeof createEngineScene>;

/** Motion renders at 30fps; a paused, settled assembly renders only on demand. */
export function createEngineScene(
  canvas: HTMLCanvasElement,
  input: HTMLElement,
  label: HTMLElement,
  initial: EngineOptions,
  cameraState: EngineCamera | null,
  onSelect: (id: string) => void,
  onFailure: () => void,
  allowOverflow: boolean,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  // The interaction surface stays the size of the drawing, independent of the
  // larger transparent canvas. This preserves the feel of orbit, pan and zoom.
  const controls = new OrbitControls(camera, input);
  controls.enableDamping = false;
  controls.enableZoom = true;
  controls.minDistance = 4;
  controls.maxDistance = 32;
  controls.maxPolarAngle = Math.PI * 0.96;
  controls.minPolarAngle = Math.PI * 0.04;
  controls.zoomSpeed = 0.7;
  controls.panSpeed = 0.7;
  controls.rotateSpeed = 0.65;
  const model = createEngineGeometry();
  const partBounds = model.parts.flatMap((part) => {
    const boxes: { box: THREE.Box3; offset: THREE.Vector3 }[] = [];
    part.group.traverse((object) => {
      if (object instanceof THREE.Mesh)
        boxes.push({
          box: new THREE.Box3().setFromObject(object),
          offset: part.offset,
        });
    });
    return boxes;
  });
  scene.add(model.root);
  scene.add(new THREE.HemisphereLight(0xe9f7ff, 0x626353, 2.8));
  const key = new THREE.DirectionalLight(0xfff4de, 4.2);
  key.position.set(-3, 6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdbe1e6, 3);
  fill.position.set(3, 1, -4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2.4);
  rim.position.set(1, -3, 2);
  scene.add(rim);

  // A centerline visually connects the separated assemblies.
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-6.3, 0, 0),
    new THREE.Vector3(6.3, 0, 0),
  ]);
  const lineMaterial = new THREE.LineDashedMaterial({
    color: 0x7e612f,
    dashSize: 0.09,
    gapSize: 0.09,
    transparent: true,
    opacity: 0.5,
  });
  const centerline = new THREE.Line(lineGeometry, lineMaterial);
  centerline.computeLineDistances();
  scene.add(centerline);

  let options = initial;
  let currentExplosion = initial.explode / 100;
  let visible = true;
  let disposed = false;
  let failed = false;
  let frame = 0;
  let previousTime = 0;
  let rotorAngle = cameraState?.rotorAngle ?? 0;
  let width = 1;
  let height = 1;
  let renderWidth = 1;
  let renderHeight = 1;
  let paddingLeft = 0;
  let paddingTop = 0;
  let sized = false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const point = new THREE.Vector3();
  const sphere = new THREE.Spherical();

  // Materials are cloned per assembly so highlighting one does not tint its neighbours.
  const materials: {
    id: string;
    material: THREE.MeshStandardMaterial;
    emissive: THREE.Color;
    intensity: number;
  }[] = [];
  model.parts.forEach((part) => {
    const clones = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    part.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const clone = (original: THREE.Material) => {
        if (!(original instanceof THREE.MeshStandardMaterial)) return original;
        let material = clones.get(original);
        if (!material) {
          material = original.clone();
          clones.set(original, material);
          materials.push({
            id: part.id,
            material,
            emissive: material.emissive.clone(),
            intensity: material.emissiveIntensity,
          });
        }
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(clone)
        : clone(object.material);
    });
  });

  function draw(now = performance.now()) {
    frame = 0;
    if (disposed || failed || !visible || document.hidden) return;
    const rotating = options.spinning && options.speed > 0;
    if (rotating && now - previousTime < 1000 / 30) {
      requestDraw();
      return;
    }
    const target = options.explode / 100;
    const delta = Math.min((now - previousTime) / 1000 || 0.016, 0.05);
    previousTime = now;
    const previousExplosion = currentExplosion;
    currentExplosion = reduced.matches
      ? target
      : THREE.MathUtils.damp(currentExplosion, target, 12, delta);
    if (Math.abs(currentExplosion - target) < 0.001) currentExplosion = target;
    // Fit projected part bounds as they separate, preserving the user's view
    // and relative zoom. Fixed zoom factors can clip the separated casing.
    if (currentExplosion !== previousExplosion) {
      const direction = camera.position
        .clone()
        .sub(controls.target)
        .normalize();
      const before = framing(previousExplosion, direction);
      const after = framing(currentExplosion, direction);
      const offset = camera.position
        .clone()
        .sub(controls.target)
        .multiplyScalar(after.distance / before.distance);
      controls.target.add(after.center.sub(before.center));
      camera.position.copy(controls.target).add(offset);
      controls.update();
    }
    model.parts.forEach((part) =>
      part.group.position
        .copy(part.origin)
        .addScaledVector(part.offset, currentExplosion),
    );
    if (rotating)
      rotorAngle = (rotorAngle + delta * options.speed * 0.9) % (Math.PI * 2);
    model.rotors.forEach((rotor) => {
      rotor.rotation.x = rotorAngle;
    });
    centerline.visible = currentExplosion > 0.05;
    const selected = model.parts.find((part) => part.id === options.selected);
    if (selected && options.showLabels) {
      point.copy(selected.group.position);
      point.y += options.selected === "casing" ? 1.2 : 1.05;
      model.root.localToWorld(point);
      point.project(camera);
      const x = THREE.MathUtils.clamp(
        (point.x * 0.5 + 0.5) * renderWidth - paddingLeft,
        18,
        width - label.offsetWidth - 18,
      );
      const y = THREE.MathUtils.clamp(
        (-point.y * 0.5 + 0.5) * renderHeight - paddingTop,
        18,
        height - 58,
      );
      label.style.transform = `translate(${x}px, ${y}px)`;
      label.style.visibility =
        point.z > 1 || point.z < -1 ? "hidden" : "visible";
    } else {
      label.style.visibility = "hidden";
    }
    renderer.render(scene, camera);
    if (currentExplosion !== target || rotating) requestDraw();
  }
  function requestDraw() {
    if (!frame && !disposed && !failed && visible && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function setOptions(next: EngineOptions) {
    options = next;
    const selectionColor = new THREE.Color(
      next.selected === "casing" ? 0x8c8c8c : 0x3b827b,
    );
    const selectionIntensity = next.selected === "casing" ? 0.12 : 0.24;
    controls.mouseButtons.LEFT =
      next.mode === "pan" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
    controls.touches.ONE =
      next.mode === "pan" ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
    materials.forEach(({ id, material, emissive, intensity }) => {
      material.wireframe = next.wireframe;
      material.emissive.copy(id === next.selected ? selectionColor : emissive);
      material.emissiveIntensity =
        id === next.selected ? selectionIntensity : intensity;
    });
    requestDraw();
  }
  function framing(
    explosion: number,
    direction: THREE.Vector3,
    w = width,
    h = height,
  ) {
    const bounds = new THREE.Box3();
    const boxes = partBounds.map(({ box, offset }) => {
      const shifted = box
        .clone()
        .translate(offset.clone().multiplyScalar(explosion));
      bounds.union(shifted);
      return shifted;
    });
    const center = bounds.getCenter(new THREE.Vector3());
    const right = new THREE.Vector3()
      .crossVectors(camera.up, direction)
      .normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const availableX = Math.max(0.35, 1 - 40 / w);
    const availableY = Math.max(0.35, 1 - 40 / h);
    let distance = controls.minDistance;
    const corner = new THREE.Vector3();
    for (const box of boxes)
      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y])
          for (const z of [box.min.z, box.max.z]) {
            corner.set(x, y, z).sub(center);
            distance = Math.max(
              distance,
              corner.dot(direction) +
                Math.max(
                  Math.abs(corner.dot(right)) /
                    (tangent * (w / h) * availableX),
                  Math.abs(corner.dot(up)) / (tangent * availableY),
                ),
            );
          }
      }
    return { center, distance };
  }
  function reset(view: "iso" | "side" | "front" = "iso") {
    const direction =
      view === "front"
        ? new THREE.Vector3(-1, 0, 0)
        : view === "side"
          ? new THREE.Vector3(0, 0.15, 1)
          : new THREE.Vector3(-1.15, 0.48, 1);
    direction.normalize();
    const { center, distance } = framing(currentExplosion, direction);
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.update();
    requestDraw();
  }
  function zoom(direction: number) {
    const distance = camera.position.distanceTo(controls.target);
    camera.position
      .sub(controls.target)
      .multiplyScalar(
        THREE.MathUtils.clamp(distance * (direction > 0 ? 0.85 : 1.18), 4, 32) /
          distance,
      )
      .add(controls.target);
    controls.update();
    requestDraw();
  }
  function nudge(horizontal: number, vertical: number) {
    sphere.setFromVector3(camera.position.clone().sub(controls.target));
    sphere.theta += horizontal * 0.12;
    sphere.phi = THREE.MathUtils.clamp(
      sphere.phi + vertical * 0.12,
      0.13,
      Math.PI - 0.13,
    );
    camera.position.setFromSpherical(sphere).add(controls.target);
    controls.update();
    requestDraw();
  }
  function resize() {
    const rect = input.getBoundingClientRect();
    const direction = camera.position.clone().sub(controls.target).normalize();
    const before = sized ? framing(currentExplosion, direction) : null;
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    const viewportWidth = document.documentElement.clientWidth;
    const compact = viewportWidth <= 900;
    const horizontalBleed = compact ? 48 : Math.min(width * 0.8, 480);
    const verticalBleed = compact ? 80 : Math.min(height * 0.8, 260);
    // Keep the larger canvas inside the page width without clipping the stage.
    // Narrow screens get a little breathing room instead of a page-wide overlay.
    paddingLeft = allowOverflow
      ? Math.max(0, Math.min(horizontalBleed, rect.left - 8))
      : 0;
    const paddingRight = allowOverflow
      ? Math.max(0, Math.min(horizontalBleed, viewportWidth - rect.right - 8))
      : 0;
    paddingTop = allowOverflow
      ? Math.max(0, Math.min(verticalBleed, rect.top + window.scrollY))
      : 0;
    const paddingBottom = allowOverflow ? verticalBleed : 0;
    renderWidth = width + paddingLeft + paddingRight;
    renderHeight = height + paddingTop + paddingBottom;
    canvas.style.left = `${-paddingLeft}px`;
    canvas.style.top = `${-paddingTop}px`;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;
    // Bound the extra GPU work on large/high-density screens.
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      1.75,
      Math.sqrt(3_000_000 / (renderWidth * renderHeight)),
    );
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(renderWidth, renderHeight, false);
    camera.aspect = width / height;
    if (allowOverflow) {
      // Expand the frustum beyond the original stage without changing its
      // projection or the model's apparent size when fitted to the drawing.
      camera.setViewOffset(width, height, -paddingLeft, -paddingTop, renderWidth, renderHeight);
    } else camera.clearViewOffset();
    if (before) {
      camera.position
        .sub(controls.target)
        .multiplyScalar(
          framing(currentExplosion, direction).distance / before.distance,
        )
        .clampLength(controls.minDistance, controls.maxDistance)
        .add(controls.target);
      controls.update();
    }
    sized = true;
    camera.updateProjectionMatrix();
    requestDraw();
  }
  function syncPalette() {
    const color = getComputedStyle(canvas).getPropertyValue("--brass").trim();
    lineMaterial.color.set(color || "#7e612f");
    requestDraw();
  }
  let down: { x: number; y: number } | null = null;
  let multiplePointers = false;
  const pointers = new Set<number>();
  function pointerDown(event: PointerEvent) {
    pointers.add(event.pointerId);
    multiplePointers = pointers.size > 1;
    if (event.button === 0) down = { x: event.clientX, y: event.clientY };
  }
  function pointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (
      !down ||
      multiplePointers ||
      Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6
    ) {
      down = null;
      return;
    }
    down = null;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(model.root.children, true);
    const hit = hits.find(({ object }) => object.userData.partId);
    if (hit) onSelect(hit.object.userData.partId);
  }
  function pointerCancel(event: PointerEvent) {
    pointers.delete(event.pointerId);
    down = null;
  }
  function contextLost(event: Event) {
    event.preventDefault();
    failed = true;
    cancelAnimationFrame(frame);
    onFailure();
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else requestDraw();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(input);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    canvas.style.visibility = visible ? "visible" : "hidden";
    if (visible) requestDraw();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  intersection.observe(input);
  const themeObserver = new MutationObserver(syncPalette);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  input.addEventListener("pointerdown", pointerDown);
  input.addEventListener("pointerup", pointerUp);
  input.addEventListener("pointercancel", pointerCancel);
  canvas.addEventListener("webglcontextlost", contextLost);
  // The stage can keep its width while a centered layout changes its margins.
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", requestDraw);
  controls.addEventListener("change", requestDraw);
  resize();
  if (cameraState) {
    camera.position.fromArray(cameraState.position);
    controls.target.fromArray(cameraState.target);
    const direction = camera.position.clone().sub(controls.target).normalize();
    const oldHeight = cameraState.height || height;
    const before = framing(
      currentExplosion,
      direction,
      oldHeight * cameraState.aspect,
      oldHeight,
    );
    camera.position
      .sub(controls.target)
      .multiplyScalar(
        framing(currentExplosion, direction).distance / before.distance,
      )
      .clampLength(controls.minDistance, controls.maxDistance)
      .add(controls.target);
    controls.update();
  } else reset();
  setOptions(initial);
  syncPalette();

  return {
    setOptions,
    reset,
    zoom,
    nudge,
    getCamera: (): EngineCamera => ({
      position: camera.position.toArray(),
      target: controls.target.toArray(),
      aspect: camera.aspect,
      height,
      rotorAngle,
    }),
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      controls.dispose();
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      input.removeEventListener("pointerdown", pointerDown);
      input.removeEventListener("pointerup", pointerUp);
      input.removeEventListener("pointercancel", pointerCancel);
      canvas.removeEventListener("webglcontextlost", contextLost);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", requestDraw);
      materials.forEach(({ material }) => material.dispose());
      model.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
