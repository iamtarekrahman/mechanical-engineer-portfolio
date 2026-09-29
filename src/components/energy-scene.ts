import * as THREE from "three";
import { createWindEnergyModel } from "./wind-energy-model";
import { createSolarEnergyModel } from "./solar-energy-model";
import type { EnergyFrame, EnergyModel } from "./energy-scene-types";

/** One context for both studies, with separate viewports and DOM controls. */
export function createEnergyScene(canvas: HTMLCanvasElement, windViewport: HTMLElement, solarViewport: HTMLElement, onFailure: () => void) {
  let renderer: THREE.WebGLRenderer | null = null;
  let disposed = false;
  let failed = false;
  const views: { element: HTMLElement; model: EnergyModel; scene: THREE.Scene; camera: THREE.OrthographicCamera; bounds: THREE.Box3; key: THREE.DirectionalLight; ambient: THREE.HemisphereLight }[] = [];
  function release() {
    views.forEach(view => view.model.dispose());
    views.length = 0;
    renderer?.dispose();
    renderer = null;
  }
  function fail() {
    if (failed || disposed) return;
    failed = true;
    release();
    onFailure();
  }
  function lost(event: Event) { event.preventDefault(); fail(); }
  canvas.addEventListener("webglcontextlost", lost);
  function resize() {
    if (!renderer || disposed || failed) return;
    const width = Math.max(1, Math.round(canvas.clientWidth));
    const height = Math.max(1, Math.round(canvas.clientHeight));
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
    const size = renderer.getSize(new THREE.Vector2());
    if (size.x !== width || size.y !== height) renderer.setSize(width, height, false);
  }
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.autoClear = false;
    const constructors = [createWindEnergyModel, createSolarEnergyModel];
    for (const [index, element] of [windViewport, solarViewport].entries()) {
      const model = constructors[index]();
      const scene = new THREE.Scene();
      scene.add(model.root);
      const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 100);
      camera.position.set(...model.camera.position);
      camera.lookAt(new THREE.Vector3(...model.camera.target));
      camera.updateMatrixWorld();
      model.root.updateMatrixWorld(true);
      // Fit the union of projected mesh bounds, including sun/moon and all blade tips.
      const bounds = new THREE.Box3();
      const point = new THREE.Vector3();
      model.root.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.computeBoundingBox();
        const box = object.geometry.boundingBox;
        if (!box) return;
        for (let i = 0; i < 8; i++) {
          point.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
          point.applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
          bounds.expandByPoint(point);
        }
      });
      const ambient = new THREE.HemisphereLight(0xe7f2f6, 0x6a7258, 2.7);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xfff0d7, 3.6);
      key.position.set(-3, 7, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0xc4dfeb, 2.1);
      rim.position.set(5, 3, -5); scene.add(rim);
      views.push({ element, model, scene, camera, bounds, key, ambient });
    }
    resize();
  } catch { fail(); }

  function render(frame: EnergyFrame) {
    if (!renderer || disposed || failed) return;
    try {
      resize();
      const canvasBounds = canvas.getBoundingClientRect();
      renderer.setScissorTest(false);
      renderer.clear(true, true, true);
      renderer.setScissorTest(true);
      for (const view of views) {
        const rect = view.element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const left = Math.max(0, rect.left - canvasBounds.left);
        const top = Math.max(0, rect.top - canvasBounds.top);
        const right = Math.min(canvasBounds.width, rect.right - canvasBounds.left);
        const bottom = Math.min(canvasBounds.height, rect.bottom - canvasBounds.top);
        if (right <= left || bottom <= top) continue;
        const width = view.bounds.max.x - view.bounds.min.x;
        const height = view.bounds.max.y - view.bounds.min.y;
        const aspect = rect.width / rect.height;
        const span = Math.max(height, width / aspect) * 1.10;
        const centerX = (view.bounds.max.x + view.bounds.min.x) / 2;
        const centerY = (view.bounds.max.y + view.bounds.min.y) / 2;
        view.camera.left = centerX - span * aspect / 2;
        view.camera.right = centerX + span * aspect / 2;
        view.camera.top = centerY + span / 2;
        view.camera.bottom = centerY - span / 2;
        view.camera.updateProjectionMatrix();
        view.model.update(frame);
        view.key.intensity = frame.dark ? 2.1 : 3.6;
        view.ambient.intensity = frame.dark ? 1.5 : 2.7;
        renderer.setViewport(rect.left - canvasBounds.left, canvasBounds.height - (rect.bottom - canvasBounds.top), rect.width, rect.height);
        renderer.setScissor(left, canvasBounds.height - bottom, right - left, bottom - top);
        renderer.render(view.scene, view.camera);
      }
      renderer.setScissorTest(false);
    } catch { fail(); }
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    canvas.removeEventListener("webglcontextlost", lost);
    release();
  }
  return { render, resize, dispose };
}
