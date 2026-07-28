---
name: llm-concepts-expert
description: Expert skill for the LLM Concepts presentation — a Vite + React + Three.js project at ~/projects/llm-concepts. Use when adding or modifying pages, animations, 3D scenes, or CSS in this project. Documents all architecture patterns, conventions, and templates.
---

# LLM Concepts — Expert Skill

Skill for maintaining and extending the React + Three.js presentation **LLM Concepts** (`~/projects/llm-concepts`).

---

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React | 18.3 |
| Build | Vite | 5.4 |
| Router | react-router-dom (HashRouter) | 6.30 |
| 3D | Three.js | 0.128.0 |
| State | local useState + useEffect closures (no global) |
| CSS | scoped flat files with `.page-*` prefix |

---

## Architecture

```
src/
├── main.jsx                        # HashRouter mount
├── App.jsx                         # Routes: /, /conexiones, /arquitectura, /agentes, /multiagente
├── index.css                       # Global reset only (no per-page styles)
├── components/
│   └── SiteNav.jsx                 # Shared nav with NavLink (brand + className props)
├── data/
│   └── regions.js                  # Only shared data file (others inline per page)
└── pages/
    ├── BrainPage.jsx    + brain.css          # Three.js voxel brain (route /)
    ├── ConnectionMapPage.jsx + connection.css # SVG connections (route /conexiones)
    ├── ArchitecturePage.jsx + architecture.css # Accordion/timeline (route /arquitectura)
    ├── AgentsPage.jsx   + agents.css         # Three.js agent cycle (route /agentes)
    └── MasPage.jsx      + mas.css            # Three.js multi-agent (route /multiagente)
```

---

## Hard Rules (do not break)

### 1. Page wrapper class

Every page MUST render a single top-level `<div>` with `className="page-{name}"`.  
This class is the CSS scope for ALL selectors in that page's stylesheet.

```jsx
// Good
export default function FooPage() {
  return <div className="page-foo">...</div>;
}
```

### 2. CSS scoping

Every selector MUST be prefixed with `.page-{name}`.  
Unscoped selectors WILL bleed and break other pages.

```css
/* Good */
.page-foo .title-bar { ... }
.page-foo .info-panel.open { ... }

/* BAD — breaks other pages */
.title-bar { ... }
@keyframes slide { ... }
```

If a `@keyframes` name could collide, prefix it: `@{prefix}-{name}` (e.g. `foo-slide`).

### 3. CSS variables

Define all page-level CSS custom properties on the wrapper class:

```css
.page-foo {
  --bg: #0c0f16;
  --surface: #141820;
  --border: rgba(255,255,255,0.06);
  --text: #e8ecf2;
  --text-dim: rgba(255,255,255,0.45);
  --accent: #FF6B35;
  --radius: 12px;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
```

### 4. Three.js pattern (for 3D pages)

ALL Three.js code goes inside a single `useEffect(() => { ... }, [])` with cleanup.

```jsx
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function FooPage() {
  const containerRef = useRef(null);
  const loadingRef = useRef(null);
  // ... more refs ...

  useEffect(() => {
    document.title = '...';
    const container = containerRef.current;
    // const loadingEl = loadingRef.current;

    // Scene / Camera / Renderer / Controls
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f16);
    scene.fog = new THREE.FogExp2(0x0c0f16, 0.04);

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(3.2, 1.8, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    // optionally: renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    // Lighting — always the same 4-source setup:
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x334466, 0.55));
    const key = new THREE.DirectionalLight(0xfff4e8, 1.5);
    key.position.set(5, 9, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8899cc, 0.35);
    fill.position.set(-6, 3, -4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffeedd, 0.25);
    rim.position.set(0, 5, -7);
    scene.add(rim);
    const under = new THREE.PointLight(0x4466aa, 0.3, 10);
    under.position.set(0, -3, 0);
    scene.add(under);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9, -9);
    renderer.domElement.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Render loop
    let rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // Cleanup (MANDATORY)
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="page-foo">
      <div className="loading" ref={loadingRef}>
        <div className="loading-text">Cargando…</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
      </div>
      <div id="scene-container" ref={containerRef}></div>
      <SiteNav brand="..." />
      {/* ... rest of markup ... */}
    </div>
  );
}
```

### 5. Clock-based Three.js animations

```js
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  // Orbit / pulse / breathe patterns:
  mesh.position.y = baseY + Math.sin(t * speed) * amplitude;
  mesh.rotation.y = t * 0.15;
  mesh.material.opacity = 0.5 + Math.sin(t * freq) * 0.5;
  group.scale.setScalar(1 + Math.sin(t * 1.8 + offset) * 0.025);
}
```

### 6. Raycaster click-to-select pattern

```js
renderer.domElement.addEventListener('click', () => {
  if (hovered) {
    const idx = DATA.indexOf(hovered.userData.item);
    if (idx >= 0) selectItem(idx);
  }
});

function hitTest() {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(objectGroups, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && !obj.userData.item) obj = obj.parent;
    return obj || null;
  }
  return null;
}
```

### 7. Info panel pattern

```html
<div className="info-panel" ref={infoPanelRef}>
  <div className="info-resize" ref={resizeRef}></div>
  <button className="info-close" ref={closeRef}>×</button>
  <div id="info-content" ref={infoContentRef}></div>
</div>
```

```css
.page-foo .info-panel {
  position: fixed; top: 48px; right: 0; bottom: 0; z-index: 20;
  width: 370px; min-width: 260px; max-width: 520px;
  transform: translateX(100%);
  background: rgba(20,24,32,0.96); border-left: 1px solid var(--border);
  padding: 26px 22px;
  backdrop-filter: blur(20px);
  box-shadow: -8px 0 40px rgba(0,0,0,0.4);
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  overflow-y: auto;
}
.page-foo .info-panel.open { transform: translateX(0); }
```

Show/hide:

```js
function showPanel(html) {
  infoContent.innerHTML = html;
  infoPanel.classList.add('open');
}
function hidePanel() {
  infoPanel.classList.remove('open');
}
```

---

## Adding a New Page

1. **Create files**: `src/pages/<Name>Page.jsx` + `<name>.css`
2. **Add route**: in `src/main.jsx` add `<Route path="/..." element={<NamePage />} />`
3. **Add nav link**: in `src/components/SiteNav.jsx` add `<NavLink to="/...">Link</NavLink>`
4. **Import in App.jsx**: add `import NamePage from './pages/NamePage.jsx'`
5. **Build page** following the patterns above.

---

## Modifying Animations Safely

### CSS animations / transitions

- Only modify rules within the `.page-{name}` scope
- Test that `prefers-reduced-motion` is respected (add a media query rule)
- Keep `@keyframes` names unique per page (prefix with page name)

### Three.js animations

- All animation logic lives inside `animate()` in the `useEffect` closure
- Use `const t = clock.getElapsedTime()` for time-based effects
- Store per-object animation state in `object.userData` (e.g. `mesh.userData.baseY`, `mesh.userData.phase`)
- NEVER modify Three.js objects outside `useEffect` — they don't exist yet

---

## Adding a New Global Resource

- Images → place in `public/` at project root
- Shared utility functions → `src/utils/`
- Shared constants → `src/data/`

---

## Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Animation affects other pages | Unscoped CSS selector | Prefix with `.page-{name}` |
| Three.js canvas doesn't disappear | Missing cleanup | Add `container.removeChild(renderer.domElement)` in return |
| Memory leak on navigation | No cleanup for RAF/listeners | Call `cancelAnimationFrame(rafId)` and `removeEventListener` |
| 💥 "Invalid state" | React StrictMode double-invocation | The cleanup handles it — verify all listeners are removed |
| Info panel resize broken | Resize handler on window not cleaned | Add `removeEventListener('mousemove', ...)` in return |
| build/dist shows wrong path | `base` misconfigured | Vite config uses `base: './'` — keep this |

---

## Verification Commands

```bash
npm run build     # Build sin errores
npm run dev       # Dev server en localhost:5173
ls -la dist/      # Verifica que el bundle se generó
```

---

## Tools available when working on this project

When loading this skill, opencode will understand:
- Every new element/component goes in `src/pages/` with scoped CSS
- Three.js scenes always get full lifecycle cleanup
- CSS variables are scoped per page on the wrapper class
- Pages use `SiteNav` with the correct brand and optional className
- Nav links in SiteNav use NavLink for active class support
