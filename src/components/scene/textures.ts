import * as THREE from 'three';

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = 1 + amount;
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')!] as const;
}

function toTexture(canvas: HTMLCanvasElement, repeat?: [number, number], srgb = true) {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  return tex;
}

/** Vertical planks with grain, seams and nails; rotate or repeat per surface. */
export function woodPlanksTexture({
  base,
  planks = 6,
  seed = 1,
  repeat,
}: {
  base: string;
  planks?: number;
  seed?: number;
  repeat?: [number, number];
}) {
  const size = 512;
  const [canvas, g] = makeCanvas(size, size);
  const r = rng(seed);
  const pw = size / planks;
  for (let i = 0; i < planks; i++) {
    const x0 = i * pw;
    g.fillStyle = shade(base, (r() - 0.5) * 0.35);
    g.fillRect(x0, 0, pw, size);
    for (let k = 0; k < 22; k++) {
      const dark = r() > 0.3;
      g.strokeStyle = dark ? `rgba(15,7,2,${0.06 + r() * 0.14})` : `rgba(255,210,160,${0.03 + r() * 0.05})`;
      g.lineWidth = 0.6 + r() * 1.6;
      const gx = x0 + 3 + r() * (pw - 6);
      const phase = r() * 10;
      const amp = 0.8 + r() * 2.2;
      g.beginPath();
      g.moveTo(gx, 0);
      for (let y = 0; y <= size; y += 16) g.lineTo(gx + Math.sin(y * 0.018 + phase) * amp, y);
      g.stroke();
    }
    if (r() > 0.55) {
      const ky = r() * size;
      const kx = x0 + pw * (0.3 + r() * 0.4);
      g.fillStyle = 'rgba(20,9,3,0.35)';
      g.beginPath();
      g.ellipse(kx, ky, 3 + r() * 3, 8 + r() * 6, 0, 0, Math.PI * 2);
      g.fill();
    }
    const seamY = r() * size;
    g.fillStyle = 'rgba(8,4,1,0.75)';
    g.fillRect(x0, seamY, pw, 2);
    g.fillStyle = 'rgba(10,5,2,0.9)';
    for (const ny of [seamY - 7, seamY + 9]) {
      g.beginPath();
      g.arc(x0 + 7, ny, 1.6, 0, Math.PI * 2);
      g.arc(x0 + pw - 7, ny, 1.6, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(6,3,1,0.9)';
    g.fillRect(x0, 0, 2, size);
    g.fillStyle = 'rgba(255,200,150,0.05)';
    g.fillRect(x0 + 2, 0, 1, size);
  }
  return toTexture(canvas, repeat);
}

function parchmentBase(g: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const r = rng(seed);
  g.fillStyle = '#e4cf9f';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(120,80,30,${r() * 0.05})`;
    g.beginPath();
    g.arc(r() * w, r() * h, 2 + r() * 18, 0, Math.PI * 2);
    g.fill();
  }
  const edge = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(90,50,15,0.55)');
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
}

/** Five-territory conquest map for the bulletin board. */
export function warMapTexture() {
  const w = 512;
  const h = 390;
  const [canvas, g] = makeCanvas(w, h);
  parchmentBase(g, w, h, 11);
  const regions: [number, number][][] = [
    [[40, 40], [210, 30], [230, 150], [120, 190], [30, 160]],
    [[210, 30], [470, 45], [455, 160], [300, 175], [230, 150]],
    [[30, 160], [120, 190], [150, 330], [40, 350]],
    [[120, 190], [230, 150], [300, 175], [320, 340], [150, 330]],
    [[300, 175], [455, 160], [475, 345], [320, 340]],
  ];
  const tints = ['rgba(142,27,27,0.28)', 'rgba(40,70,120,0.22)', 'rgba(60,110,50,0.24)', 'rgba(170,120,30,0.25)', 'rgba(90,40,110,0.22)'];
  regions.forEach((poly, i) => {
    g.beginPath();
    poly.forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = tints[i];
    g.fill();
    g.setLineDash([7, 5]);
    g.strokeStyle = 'rgba(60,30,10,0.85)';
    g.lineWidth = 2.5;
    g.stroke();
  });
  g.setLineDash([]);
  g.strokeStyle = 'rgba(40,70,120,0.55)';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(0, 250);
  g.bezierCurveTo(140, 210, 260, 300, 512, 240);
  g.stroke();
  g.fillStyle = 'rgba(50,25,8,0.9)';
  g.font = 'bold 30px Georgia, serif';
  g.textAlign = 'center';
  g.fillText('TERRITORIES', w / 2, 30);
  g.strokeStyle = 'rgba(50,25,8,0.8)';
  g.lineWidth = 3;
  g.strokeRect(8, 8, w - 16, h - 16);
  return toTexture(canvas);
}

export function wantedPosterTexture() {
  const w = 256;
  const h = 360;
  const [canvas, g] = makeCanvas(w, h);
  parchmentBase(g, w, h, 23);
  g.fillStyle = 'rgba(40,20,6,0.92)';
  g.textAlign = 'center';
  g.font = 'bold 54px Georgia, serif';
  g.fillText('WANTED', w / 2, 70);
  g.fillStyle = 'rgba(60,35,15,0.55)';
  g.fillRect(48, 95, w - 96, 140);
  g.fillStyle = 'rgba(40,20,6,0.9)';
  g.beginPath();
  g.arc(w / 2, 150, 34, 0, Math.PI * 2);
  g.fill();
  g.fillRect(w / 2 - 55, 190, 110, 45);
  g.font = 'bold 30px Georgia, serif';
  g.fillText('$ 5,000', w / 2, 285);
  g.font = '18px Georgia, serif';
  g.fillText('DEAD OR ALIVE', w / 2, 320);
  return toTexture(canvas);
}

export function noteTexture(seed: number) {
  const w = 200;
  const h = 200;
  const [canvas, g] = makeCanvas(w, h);
  parchmentBase(g, w, h, seed);
  const r = rng(seed * 7);
  g.strokeStyle = 'rgba(50,25,8,0.6)';
  g.lineWidth = 3;
  for (let y = 40; y < h - 25; y += 22) {
    g.beginPath();
    g.moveTo(24, y);
    g.lineTo(24 + (0.5 + r() * 0.45) * (w - 48), y);
    g.stroke();
  }
  return toTexture(canvas);
}

/** Three-reel slot window. Also used as the emissive map so it glows on hover. */
export function slotReelsTexture(seed: number) {
  const w = 384;
  const h = 192;
  const [canvas, g] = makeCanvas(w, h);
  const r = rng(seed);
  const symbols = ['7', '★', '♦', '♣', 'BAR'];
  for (let i = 0; i < 3; i++) {
    const x = i * 128;
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#6b5a3c');
    grad.addColorStop(0.5, '#f4ead0');
    grad.addColorStop(1, '#6b5a3c');
    g.fillStyle = grad;
    g.fillRect(x + 6, 0, 116, h);
    const sym = symbols[Math.floor(r() * symbols.length)];
    g.fillStyle = sym === '7' || sym === '♦' ? '#a3161a' : '#1c140c';
    g.font = sym === 'BAR' ? 'bold 40px Georgia, serif' : 'bold 96px Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(sym, x + 64, h / 2 + 4);
  }
  g.fillStyle = 'rgba(200,40,30,0.8)';
  g.fillRect(0, h / 2 - 2, w, 4);
  return toTexture(canvas);
}

/** Aged bar mirror: warm bronze gradient with diagonal sheen streaks and foxed edges. */
export function antiqueMirrorTexture() {
  const w = 256;
  const h = 352;
  const [canvas, g] = makeCanvas(w, h);
  const base = g.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#4a3a2c');
  base.addColorStop(0.5, '#2a211a');
  base.addColorStop(1, '#3a2c20');
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  g.save();
  g.translate(w / 2, h / 2);
  g.rotate(-0.6);
  for (const [x, width, alpha] of [[-60, 46, 0.16], [0, 16, 0.12], [40, 8, 0.1]] as const) {
    const s = g.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
    s.addColorStop(0, 'rgba(255,220,170,0)');
    s.addColorStop(0.5, `rgba(255,220,170,${alpha})`);
    s.addColorStop(1, 'rgba(255,220,170,0)');
    g.fillStyle = s;
    g.fillRect(x - width / 2, -h, width, h * 2);
  }
  g.restore();
  const r = rng(91);
  for (let i = 0; i < 90; i++) {
    const edge = r() < 0.5;
    const x = edge ? (r() < 0.5 ? r() * 30 : w - r() * 30) : r() * w;
    const y = edge ? r() * h : r() < 0.5 ? r() * 30 : h - r() * 30;
    g.fillStyle = `rgba(20,12,6,${0.1 + r() * 0.25})`;
    g.beginPath();
    g.arc(x, y, 2 + r() * 9, 0, Math.PI * 2);
    g.fill();
  }
  return toTexture(canvas);
}

/** Soft radial falloff for additive halos. */
export function glowTexture() {
  const size = 128;
  const [canvas, g] = makeCanvas(size, size);
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return toTexture(canvas);
}

/** Four-point star for the bottle glints. */
export function starTexture() {
  const size = 128;
  const [canvas, g] = makeCanvas(size, size);
  const c = size / 2;
  const grad = g.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.15, 'rgba(255,255,255,0.5)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [w, h] of [[3, size * 0.9], [size * 0.9, 3]]) {
    const lg = g.createRadialGradient(c, c, 0, c, c, c);
    lg.addColorStop(0, 'rgba(255,255,255,1)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = lg;
    g.fillRect(c - w / 2, c - h / 2, w, h);
  }
  return toTexture(canvas);
}

/** Vertical beam that fades at both ends and at the sides, for fake volumetric light. */
export function lightShaftTexture() {
  const w = 64;
  const h = 256;
  const [canvas, g] = makeCanvas(w, h);
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    const along = Math.sin(Math.PI * Math.min(1, v * 1.15)) * (1 - v * 0.55);
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const across = Math.pow(Math.sin(Math.PI * u), 2);
      const a = Math.max(0, along * across);
      const i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  g.putImageData(img, 0, 0);
  const tex = toTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
