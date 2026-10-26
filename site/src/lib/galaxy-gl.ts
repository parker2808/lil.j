import {
  GALAXY,
  buildCluster,
  buildStars,
  frameFor,
  project,
  starBudget,
  type GalaxyCamera,
  type StarCloud,
} from "./galaxy.ts";

export type GalaxyKnot = {
  x: number;
  y: number;
  color: [number, number, number];
  viewed: boolean;
};

export type GalaxyMount = {
  camera: GalaxyCamera;
  setPaused: (paused: boolean) => void;
  setKnots: (knots: GalaxyKnot[]) => void;
  setPointer: (x: number, y: number) => void;
  project: (x: number, y: number, z?: number) => { x: number; y: number };
  render: () => void;
  destroy: () => void;
};

const DISC_VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

function discFrag(): string {
  return `
precision highp float;
uniform vec2 uRes;
uniform float uSpin;
uniform float uZoom;
uniform vec2 uFocus;
uniform vec2 uParallax;
uniform float uTime;
uniform float uFrame;
const float ARMS = ${GALAXY.arms}.0;
const float WIND = ${GALAXY.wind};
const float TILT = ${GALAXY.tilt};
const float CAM = ${GALAXY.camDist};
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main() {
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
  float ct = cos(TILT);
  float st = sin(TILT);
  float ny = ndc.y / uFrame;
  float nx = ndc.x * aspect / uFrame;
  float denom = ct + ny * st;
  if (abs(denom) < 0.04) discard;
  float y2 = (ny * CAM - uParallax.y) / denom;
  float w = CAM - y2 * st;
  if (w < 0.25) discard;
  float x2 = nx * w - uParallax.x;
  float cs = cos(uSpin);
  float sn = sin(uSpin);
  float x1 = x2 * cs + y2 * sn;
  float y1 = -x2 * sn + y2 * cs;
  vec2 p = vec2(x1 / uZoom + uFocus.x, y1 / uZoom + uFocus.y);
  float r = length(p);
  if (r > 1.35) discard;
  float ang = atan(p.y, p.x);
  float theta = ang - WIND * log(r + 0.05);
  float along = fract(theta * ARMS / 6.2831853);
  float edge = min(along, 1.0 - along);
  float n = noise(vec2(ang * 1.7, r * 7.0) + uTime * 0.015);
  float n2 = noise(vec2(r * 3.0, ang * 0.8) - uTime * 0.01);
  float width = (0.034 + 0.07 * r) * (0.72 + 0.55 * n);
  float arm = smoothstep(width, 0.0, edge);
  float dustTheta = theta - 0.46;
  float dustAlong = fract(dustTheta * ARMS / 6.2831853);
  float dustEdge = min(dustAlong, 1.0 - dustAlong);
  float dust = smoothstep(width * 0.42, 0.0, dustEdge);
  float disc = smoothstep(1.22, 0.25, r);
  float bulge = exp(-r * r * 13.5);
  float armLight = arm * exp(-r * 0.42) * (0.55 + 0.45 * n2);
  vec3 armCol = mix(vec3(1.0, 0.78, 0.88), vec3(0.73, 0.62, 0.98), smoothstep(0.12, 0.92, r));
  vec3 col = vec3(0.11, 0.055, 0.15) * disc * 0.92;
  col += armCol * armLight;
  col += vec3(1.0, 0.93, 0.96) * bulge * 0.95;
  col += vec3(0.98, 0.55, 0.75) * arm * exp(-pow((r - 0.55) * 3.2, 2.0)) * 0.18 * n2;
  col *= 1.0 - dust * 0.68 * smoothstep(1.05, 0.12, r);
  float alpha = clamp(disc * 0.55 + bulge * 0.85 + armLight * 0.8, 0.0, 1.0);
  alpha *= smoothstep(1.28, 0.42, r);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;
}

function pointVert(): string {
  return `
attribute vec3 aPos;
attribute vec3 aColor;
attribute float aSize;
attribute float aTw;
uniform vec2 uRes;
uniform float uSpin;
uniform float uZoom;
uniform vec2 uFocus;
uniform vec2 uParallax;
uniform float uTime;
uniform float uFrame;
uniform float uDpr;
varying vec3 vColor;
varying float vAlpha;
const float TILT = ${GALAXY.tilt};
const float CAM = ${GALAXY.camDist};
void main() {
  float cs = cos(uSpin);
  float sn = sin(uSpin);
  float x1 = (aPos.x - uFocus.x) * uZoom;
  float y1 = (aPos.y - uFocus.y) * uZoom;
  float z1 = aPos.z * uZoom;
  float x2 = x1 * cs - y1 * sn;
  float y2 = x1 * sn + y1 * cs;
  float ct = cos(TILT);
  float st = sin(TILT);
  float y3 = y2 * ct - z1 * st + uParallax.y;
  float z3 = y2 * st + z1 * ct;
  float x3 = x2 + uParallax.x;
  float w = max(0.35, CAM - z3);
  float aspect = uRes.x / max(uRes.y, 1.0);
  gl_Position = vec4(((x3 / w) * uFrame) / aspect, (y3 / w) * uFrame, 0.0, 1.0);
  gl_PointSize = clamp(aSize * uDpr * clamp(1.85 / w, 0.5, 2.3), 1.0, 8.0);
  vColor = aColor;
  vAlpha = 0.8 + 0.2 * sin(uTime * (0.7 + aTw) + aTw * 12.0);
}
`;
}

const POINT_FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 pc = gl_PointCoord * 2.0 - 1.0;
  float d = dot(pc, pc);
  if (d > 1.0) discard;
  float a = exp(-d * 3.1) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function program(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vert);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const handle = gl.createProgram();
  if (!handle) return null;
  gl.attachShader(handle, vs);
  gl.attachShader(handle, fs);
  gl.linkProgram(handle);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
    gl.deleteProgram(handle);
    return null;
  }
  return handle;
}

function upload(gl: WebGLRenderingContext, cloud: StarCloud, buffers: Record<string, WebGLBuffer | null>) {
  const pairs: Array<[string, Float32Array]> = [
    ["pos", cloud.positions],
    ["color", cloud.colors],
    ["size", cloud.sizes],
    ["tw", cloud.twinkle],
  ];
  for (const [key, data] of pairs) {
    if (!buffers[key]) buffers[key] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key]);
    gl.bufferData(gl.ARRAY_BUFFER, data as Float32Array<ArrayBuffer>, gl.STATIC_DRAW);
  }
}

export function mountGalaxy(
  canvas: HTMLCanvasElement,
  options: { reduced: boolean; onFrame?: () => void },
): GalaxyMount {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  const camera: GalaxyCamera = { spin: 0, zoom: 1, focusX: 0, focusY: 0, parallaxX: 0, parallaxY: 0 };
  let paused = false;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  const reduced = options.reduced;

  if (!gl) {
    return fallbackMount(canvas, camera, reduced, options.onFrame);
  }

  const disc = program(gl, DISC_VERT, discFrag());
  const points = program(gl, pointVert(), POINT_FRAG);
  if (!disc || !points) {
    return fallbackMount(canvas, camera, reduced, options.onFrame);
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const width0 = canvas.clientWidth || 320;
  const stars = buildStars(starBudget(width0, navigator.hardwareConcurrency || 8));
  const starBuf: Record<string, WebGLBuffer | null> = {};
  const knotBuf: Record<string, WebGLBuffer | null> = {};
  upload(gl, stars, starBuf);
  let cluster = buildCluster([]);
  upload(gl, cluster, knotBuf);

  let raf = 0;
  let last = performance.now();
  let running = true;

  const size = () => {
    const cssW = Math.max(1, canvas.clientWidth);
    const cssH = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, cssW < 700 ? 1.35 : 1.7);
    const nextW = Math.round(cssW * dpr);
    const nextH = Math.round(cssH * dpr);
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    frame = frameFor(cssW, cssH);
    return { cssW, cssH, dpr };
  };

  const bindCloud = (prog: WebGLProgram, buf: Record<string, WebGLBuffer | null>, count: number) => {
    const pos = gl.getAttribLocation(prog, "aPos");
    const color = gl.getAttribLocation(prog, "aColor");
    const sizeLoc = gl.getAttribLocation(prog, "aSize");
    const tw = gl.getAttribLocation(prog, "aTw");
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.pos);
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.color);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.size);
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.tw);
    gl.enableVertexAttribArray(tw);
    gl.vertexAttribPointer(tw, 1, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  const draw = (now: number) => {
    const { dpr } = size();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(disc);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    const pos = gl.getAttribLocation(disc, "aPos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(gl.getUniformLocation(disc, "uRes"), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(disc, "uSpin"), camera.spin);
    gl.uniform1f(gl.getUniformLocation(disc, "uZoom"), camera.zoom);
    gl.uniform2f(gl.getUniformLocation(disc, "uFocus"), camera.focusX, camera.focusY);
    gl.uniform2f(gl.getUniformLocation(disc, "uParallax"), camera.parallaxX, camera.parallaxY);
    gl.uniform1f(gl.getUniformLocation(disc, "uTime"), reduced ? 0 : now * 0.001);
    gl.uniform1f(gl.getUniformLocation(disc, "uFrame"), frame);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(points);
    const apply = (prog: WebGLProgram) => {
      gl.uniform2f(gl.getUniformLocation(prog, "uRes"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(prog, "uSpin"), camera.spin);
      gl.uniform1f(gl.getUniformLocation(prog, "uZoom"), camera.zoom);
      gl.uniform2f(gl.getUniformLocation(prog, "uFocus"), camera.focusX, camera.focusY);
      gl.uniform2f(gl.getUniformLocation(prog, "uParallax"), camera.parallaxX, camera.parallaxY);
      gl.uniform1f(gl.getUniformLocation(prog, "uTime"), reduced ? 0 : now * 0.001);
      gl.uniform1f(gl.getUniformLocation(prog, "uFrame"), frame);
      gl.uniform1f(gl.getUniformLocation(prog, "uDpr"), dpr);
    };
    apply(points);
    bindCloud(points, starBuf, stars.count);
    if (cluster.count > 0) bindCloud(points, knotBuf, cluster.count);
  };

  const tick = (now: number) => {
    if (!running) return;
    if (document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused && !reduced) {
      camera.spin += dt * GALAXY.spinSpeed;
      const driftX = Math.sin(now * 0.00017) * 0.045;
      const driftY = Math.cos(now * 0.00013) * 0.028;
      camera.parallaxX += (pointerX + driftX - camera.parallaxX) * 0.06;
      camera.parallaxY += (pointerY + driftY - camera.parallaxY) * 0.06;
    }
    draw(now);
    options.onFrame?.();
    if (!reduced && !paused) raf = requestAnimationFrame(tick);
  };

  const start = () => {
    cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const observer = new ResizeObserver(() => {
    draw(performance.now());
    options.onFrame?.();
  });
  observer.observe(canvas);
  const onVisible = () => {
    if (!document.hidden && !paused && !reduced) start();
  };
  document.addEventListener("visibilitychange", onVisible);
  start();

  return {
    camera,
    setPaused: (next) => {
      paused = next;
      if (!next && !reduced) start();
    },
    setKnots: (next) => {
      cluster = buildCluster(next);
      upload(gl, cluster, knotBuf);
      draw(performance.now());
      options.onFrame?.();
    },
    setPointer: (x, y) => {
      pointerX = x;
      pointerY = y;
    },
    project: (x, y, z = 0) => project(x, y, z, camera, canvas.clientWidth, canvas.clientHeight),
    render: () => {
      draw(performance.now());
      options.onFrame?.();
    },
    destroy: () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      gl.deleteProgram(disc);
      gl.deleteProgram(points);
    },
  };
}

function fallbackMount(
  canvas: HTMLCanvasElement,
  camera: GalaxyCamera,
  reduced: boolean,
  onFrame?: () => void,
): GalaxyMount {
  const ctx = canvas.getContext("2d");
  let paused = false;
  let raf = 0;
  let running = true;
  const stars = buildStars(1800);
  let cluster = buildCluster([]);
  const paint = () => {
    if (!ctx) return;
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const paintCloud = (cloud: StarCloud) => {
      for (let index = 0; index < cloud.count; index += 1) {
        const point = project(
          cloud.positions[index * 3],
          cloud.positions[index * 3 + 1],
          cloud.positions[index * 3 + 2],
          camera,
          width,
          height,
        );
        const color = cloud.colors;
        ctx.fillStyle = `rgba(${Math.round(color[index * 3] * 255)}, ${Math.round(color[index * 3 + 1] * 255)}, ${Math.round(color[index * 3 + 2] * 255)}, 0.85)`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, cloud.sizes[index] * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    paintCloud(stars);
    paintCloud(cluster);
    onFrame?.();
  };
  const loop = (now: number) => {
    if (!running) return;
    if (!paused && !reduced) camera.spin += 0.016 * GALAXY.spinSpeed;
    paint();
    if (!paused && !reduced) raf = requestAnimationFrame(loop);
    void now;
  };
  raf = requestAnimationFrame(loop);
  return {
    camera,
    setPaused: (next) => {
      paused = next;
    },
    setKnots: (knots) => {
      cluster = buildCluster(knots);
      paint();
    },
    setPointer: () => {},
    project: (x, y, z = 0) => project(x, y, z, camera, canvas.clientWidth, canvas.clientHeight),
    render: () => paint(),
    destroy: () => {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}
