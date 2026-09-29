/**
 * Compact renderer for ThreeUI Community's MIT-licensed Shader Toggle.
 * The distance-field artwork is retained in theme-toggle-shaders.ts. This host
 * runs continuously at up to 30fps, without idle or motion-preference pauses.
 * Upstream: https://github.com/MengTo/threeui/tree/main/src/shaders/skeuomorphic-toggle
 */
import { buildShaderToggleFragment, SHADER_TOGGLE_VERTEX } from "./theme-toggle-shaders";

export type ThemeToggleScene = {
  setDark: (dark: boolean) => void;
  setPointer: (x: number, y: number) => void;
  wake: () => void;
  dispose: () => void;
};

export function createThemeToggleScene(
  canvas: HTMLCanvasElement,
  options: { dark: boolean; onFailure: () => void },
): ThemeToggleScene {
  const gl = canvas.getContext("webgl", {
    alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL unavailable");

  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  const cleanup = () => {
    for (const shader of shaders) gl.deleteShader(shader);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
  };
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Shader unavailable");
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error("Shader compilation failed");
    return shader;
  }

  try {
    program = gl.createProgram();
    if (!program) throw new Error("Program unavailable");
    const highPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision;
    const fragment = buildShaderToggleFragment(Boolean(gl.getExtension("OES_standard_derivatives")))
      .replace("precision highp float;", highPrecision ? "precision highp float;" : "precision mediump float;");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, SHADER_TOGGLE_VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader link failed");
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("Buffer unavailable");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch (error) {
    cleanup();
    throw error;
  }

  const uniforms = {
    resolution: gl.getUniformLocation(program, "uRes"),
    unit: gl.getUniformLocation(program, "uUnit"),
    time: gl.getUniformLocation(program, "uTime"),
    on: gl.getUniformLocation(program, "uOn"),
    progress: gl.getUniformLocation(program, "uProgress"),
    mode: gl.getUniformLocation(program, "uMode"),
    pointer: gl.getUniformLocation(program, "uPointer"),
  };
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(80 * ratio);
  canvas.height = Math.round(36 * ratio);
  gl.viewport(0, 0, canvas.width, canvas.height);

  let dark = options.dark;
  let disposed = false;
  let lost = false;
  let frameId = 0;
  let last = 0;
  let time = 0;
  const startedAt = performance.now();
  let progress = dark ? 1 : 0;
  let pointerX = 0;
  let pointerY = 0;

  function draw() {
    if (disposed || lost) return;
    gl!.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl!.uniform1f(uniforms.unit, (76 / 4.7) * ratio);
    gl!.uniform1f(uniforms.time, time);
    gl!.uniform1f(uniforms.on, dark ? 1 : 0);
    gl!.uniform1f(uniforms.progress, progress);
    gl!.uniform1f(uniforms.mode, dark ? 1 : 0);
    gl!.uniform2f(uniforms.pointer, pointerX, pointerY);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function stop() {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function frame(now: number) {
    frameId = 0;
    if (disposed || lost) return;
    if (now - last < 1000 / 30) {
      frameId = window.requestAnimationFrame(frame);
      return;
    }
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Keep the phase tied to elapsed time even if the browser suspends RAF.
    time = (now - startedAt) / 1000 * 0.65;
    const target = dark ? 1 : 0;
    progress += (target - progress) * (1 - Math.exp(-delta * 20));
    if (Math.abs(target - progress) < 0.001) progress = target;
    draw();
    frameId = window.requestAnimationFrame(frame);
  }

  function wake() {
    if (disposed || lost) return;
    if (!frameId) {
      last = performance.now();
      frameId = window.requestAnimationFrame(frame);
    }
  }

  const onContextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stop();
    options.onFailure();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  draw();
  wake();

  return {
    setDark(next) {
      dark = next;
      wake();
    },
    setPointer(x, y) {
      pointerX = Math.max(-1, Math.min(1, x));
      pointerY = Math.max(-1, Math.min(1, y));
      wake();
    },
    wake,
    dispose() {
      disposed = true;
      stop();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      cleanup();
    },
  };
}
