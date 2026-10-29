/*
 * logo3d.js — le logo Mentally en vrai volume (Three.js)
 *
 * Les formes vectorielles du logo (assets/logo-shape.js) sont extrudées avec un
 * biseau, puis rendues en chrome violet avec reflets d'environnement.
 * Le logo s'incline vers la souris et se balance doucement au repos.
 * Si WebGL ou Three.js ne sont pas disponibles, la version CSS (fx.js) reste affichée.
 */
import * as THREE from 'three';

const root = document.getElementById('logo3d');
const data = window.MENTALLY_LOGO_SHAPE;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

if (root && data && data.parts && webglAvailable()) {
  try { init(); } catch (e) { console.warn('Logo 3D indisponible, version CSS conservée.', e); }
}

/*
 * Environnement de reflets façon studio photo : intérieur très sombre et
 * quelques bandes lumineuses blanches et violettes. Le métal poli reflète
 * ces contrastes, ce qui donne l'aspect chrome.
 */
function chromeEnvironment() {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x07030f, side: THREE.BackSide }),
  );
  env.add(room);
  const strip = (color, intensity, w, h, pos, rotY, rotX = 0) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(...pos);
    m.rotation.set(rotX, rotY, 0);
    env.add(m);
  };
  strip(0xffffff, 6, 7, 1.2, [0, 4.5, 2], 0, Math.PI / 2);       // grande bande blanche au-dessus
  strip(0xffffff, 4, 1.0, 6, [-5, 0.5, 2.5], Math.PI / 2.6);      // bande verticale à gauche
  strip(0xb388ff, 5, 1.4, 6, [5, 0, 2], -Math.PI / 2.4);          // bande violette à droite
  strip(0x7c3aed, 4, 8, 1.6, [0, -4.5, 1], 0, -Math.PI / 2);      // sol violet
  strip(0xe9d5ff, 5, 4, 3, [0, 1, 6], Math.PI);                   // panneau doux en face
  strip(0x6d28d9, 3, 6, 4, [0, 0, -6], 0);                        // fond violet derrière
  return env;
}

function init() {
  const canvas = document.createElement('canvas');
  canvas.className = 'logo3d-gl';
  canvas.setAttribute('aria-hidden', 'true');
  root.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(chromeEnvironment(), 0.02).texture;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.01, 50);

  // Lumières : une clé blanche, deux contre-jours violets pour les reflets du chrome
  scene.add(new THREE.AmbientLight(0x9a6bff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(1.2, 2.2, 3);
  scene.add(key);
  const spec = new THREE.DirectionalLight(0xf3e8ff, 2.2);
  spec.position.set(-2.5, 1.5, 2);
  scene.add(spec);
  const rimA = new THREE.PointLight(0xc084fc, 26, 10);
  rimA.position.set(-1.6, 0.9, 1.4);
  scene.add(rimA);
  const rimB = new THREE.PointLight(0x9333ea, 30, 10);
  rimB.position.set(1.8, -1.1, 1.2);
  scene.add(rimB);

  // Lumière blanche qui suit la souris (le point brillant qui glisse sur le chrome)
  const glint = new THREE.PointLight(0xffffff, 14, 6, 1.6);
  glint.position.set(0.4, 0.4, 1.2);
  scene.add(glint);

  // Uniformes partagés par tous les matériaux : position du reflet qui balaie
  const fx = { sweep: { value: -3 }, sweepStrength: { value: 0 } };

  /*
   * Matériau chrome + deux effets du logo d'origine, injectés dans le shader :
   *  - bord néon : plus la surface est vue de biais (arêtes, biseaux), plus elle
   *    s'illumine en violet clair (effet de Fresnel) ;
   *  - reflet qui balaie : une bande blanche oblique traverse le logo.
   */
  const chrome = (color, roughness, emissive, emissiveIntensity, rimColor, rimStrength, rimPower) => {
    const mat = new THREE.MeshPhysicalMaterial({
      color, metalness: 1, roughness, clearcoat: 1, clearcoatRoughness: 0.05,
      emissive, emissiveIntensity, envMapIntensity: 2.1,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.rimColor = { value: new THREE.Color(rimColor) };
      shader.uniforms.rimStrength = { value: rimStrength };
      shader.uniforms.rimPower = { value: rimPower };
      shader.uniforms.uSweep = fx.sweep;
      shader.uniforms.uSweepStrength = fx.sweepStrength;
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 rimColor;
          uniform float rimStrength;
          uniform float rimPower;
          uniform float uSweep;
          uniform float uSweepStrength;`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          vec3 fxView = normalize(vViewPosition);
          float fxRim = pow(1.0 - clamp(abs(dot(normal, fxView)), 0.0, 1.0), rimPower);
          totalEmissiveRadiance += rimColor * fxRim * rimStrength;
          float fxBand = -vViewPosition.x * 0.82 + vViewPosition.y * 0.57;
          float fxSweep = smoothstep(0.07, 0.0, abs(fxBand - uSweep));
          totalEmissiveRadiance += vec3(1.0, 0.94, 1.0) * fxSweep * uSweepStrength;`);
    };
    mat.customProgramCacheKey = () => `mentally-chrome-${rimPower}`;
    return mat;
  };
  const STYLE = {
    //        épaisseur  décalage z  biseau (épaisseur, taille)
    //        face / flancs : chrome(couleur, rugosité, émissif, intensité, couleur néon, force néon, finesse néon)
    ring:  { depth: 0.050, z: 0.000, bt: 0.012, bs: 0.007,
             face: chrome(0xb488ff, 0.06, 0x2a0870, 0.16, 0xc9a8ff, 1.4, 2.2),
             side: chrome(0x8b46ff, 0.09, 0x1f0656, 0.2, 0xb388ff, 1.8, 1.6) },
    inner: { depth: 0.022, z: -0.012, bt: 0.005, bs: 0.003,
             face: chrome(0x9e6dff, 0.08, 0x220760, 0.16, 0xb388ff, 1.2, 2.2),
             side: chrome(0x7432f0, 0.11, 0x170548, 0.2, 0xa78bfa, 1.4, 1.6) },
    m:     { depth: 0.080, z: 0.040, bt: 0.016, bs: 0.009,
             face: chrome(0xdcc4ff, 0.05, 0x4c14c8, 0.28, 0xe9d5ff, 1.8, 2.4),
             side: chrome(0x9a55ff, 0.07, 0x2a0870, 0.2, 0xc4b5fd, 2.0, 1.5) },
    star:  { depth: 0.060, z: 0.030, bt: 0.014, bs: 0.008,
             face: chrome(0xf1e6ff, 0.04, 0x6d28d9, 0.35, 0xffffff, 2.0, 2.4),
             side: chrome(0xb07aff, 0.06, 0x330b88, 0.2, 0xe9d5ff, 2.2, 1.5) },
  };

  const group = new THREE.Group();
  data.parts.forEach((part) => {
    const st = STYLE[part.kind] || STYLE.ring;
    const shape = new THREE.Shape(part.outer.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: st.depth, steps: 1, curveSegments: 1,
      bevelEnabled: true, bevelThickness: st.bt, bevelSize: st.bs, bevelOffset: 0, bevelSegments: 4,
    });
    geo.translate(0, 0, -st.depth / 2 + st.z);
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, [st.face, st.side]));
  });
  scene.add(group);

  // Cadrage : le logo (largeur 1) occupe ~74 % de la largeur du canvas
  const LOGO_W = 1, LOGO_H = data.aspect || 0.74, FILL = 0.74;
  function fit() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const distH = (LOGO_H / FILL) / (2 * Math.tan(halfFov));
    const distW = (LOGO_W / FILL) / (2 * Math.tan(halfFov) * camera.aspect);
    camera.position.set(0, 0, Math.max(distH, distW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(fit).observe(canvas);
  fit();

  // Inclinaison vers la souris + balancement au repos
  const area = root.closest('.hero') || root.closest('.buy-visual') || root.parentElement;
  let tx = 0, ty = 0, rx = 0, ry = 0, hovering = false;
  let gx = 0.4, gy = 0.4, cgx = 0.4, cgy = 0.4;   // position du point brillant
  area.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const px = Math.max(-0.3, Math.min(1.3, (e.clientX - r.left) / r.width));
    const py = Math.max(-0.3, Math.min(1.3, (e.clientY - r.top) / r.height));
    hovering = true;
    ty = (px - 0.5) * 1.1;   // ~ ±32°
    tx = (py - 0.5) * 0.7;   // ~ ±20°
    gx = (px - 0.5) * 1.4;
    gy = -(py - 0.5) * 1.0;
  });
  area.addEventListener('pointerleave', () => { hovering = false; });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(root);

  const t0 = performance.now();
  function render(now) {
    const t = (now - t0) / 1000;
    if (!hovering) {
      ty = reduce ? 0.35 : Math.sin(t * 0.55) * 0.55;
      tx = reduce ? 0.12 : 0.12 + Math.sin(t * 0.8) * 0.12;
      gx = reduce ? 0.3 : Math.sin(t * 0.5) * 0.55;
      gy = reduce ? 0.3 : 0.25 + Math.cos(t * 0.7) * 0.2;
    }
    const k = reduce ? 1 : 0.07;
    rx += (tx - rx) * k;
    ry += (ty - ry) * k;
    cgx += (gx - cgx) * k;
    cgy += (gy - cgy) * k;
    group.rotation.set(rx, ry, 0);
    glint.position.set(cgx, cgy, 0.9);
    rimA.position.x = -1.6 + Math.sin(t * 0.6) * 0.8;

    // reflet qui balaie : traverse le logo en 1,3 s toutes les 4,5 s
    if (reduce) {
      fx.sweepStrength.value = 0;
    } else {
      const cycle = 4.5, pass = 1.3, ph = t % cycle;
      if (ph < pass) {
        const p = ph / pass;
        fx.sweep.value = -0.75 + p * 1.5;
        fx.sweepStrength.value = Math.sin(p * Math.PI) * 1.6;
      } else {
        fx.sweepStrength.value = 0;
      }
    }
    renderer.render(scene, camera);
  }

  render(performance.now());
  root.classList.add('gl-ready');

  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    render(now);
  }
  requestAnimationFrame(loop);
}
