import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SiteNav from '../components/SiteNav.jsx';
import { useI18n } from '../i18n/index.jsx';
import './brain.css';

export default function BrainPage() {
  var { t } = useI18n();
  var REGIONS = t('brain.regions');
  const containerRef = useRef(null);
  const loadingRef = useRef(null);
  const legendRef = useRef(null);
  const hoverLabelRef = useRef(null);
  const infoPanelRef = useRef(null);
  const infoContentRef = useRef(null);
  const closeRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    document.title = t('brain.title');

    const container = containerRef.current;
    const loadingEl = loadingRef.current;
    const label = hoverLabelRef.current;
    const infoPanel = infoPanelRef.current;
    const infoContent = infoContentRef.current;
    const legendEl = legendRef.current;

    const W = window.innerWidth;
    const H = window.innerHeight;

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f16);
    scene.fog = new THREE.FogExp2(0x0c0f16, 0.04);

    /* Camera */
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(3.2, 1.8, 3.8);

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    /* Controls */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.8;
    controls.maxDistance = 11;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    /* Lighting — 3-point + hemisphere + underlight */
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x334466, 0.55));
    const key = new THREE.DirectionalLight(0xfff4e8, 1.5);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 25;
    key.shadow.camera.left = key.shadow.camera.bottom = -4;
    key.shadow.camera.right = key.shadow.camera.top = 4;
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

    /* ─── Brain geometry helpers ─── */
    function brainShell(x, y, z) {
      if (x < -0.04) return false;
      var rx = x - 0.33;
      var rxN = rx / 1.28, ryN = y / 1.08, rzN = z / 1.65;
      var right = rxN * rxN + ryN * ryN + rzN * rzN;
      if (right > 1) return false;
      var cx = x, cy = y + 0.52, cz = z + 0.48;
      var cB = (cx*cx)/(0.68*0.68) + (cy*cy)/(0.48*0.48) + (cz*cz)/(0.78*0.78);
      if (cB < 1) return true;
      var sx = x, sy = y + 0.78, sz = z + 0.06;
      var stem = (sx*sx + sz*sz)/(0.17*0.17) + (sy*sy)/(0.28*0.28);
      if (stem < 1) return true;
      if (y < -0.52) return false;
      return true;
    }

    function classifyRegion(x, y, z) {
      var best = null, bestD = 1e9;
      for (var i = 0; i < REGIONS.length; i++) {
        var c = REGIONS[i].center, r = REGIONS[i].radius;
        var dx = x - c[0], dy = y - c[1], dz = z - c[2];
        var d = Math.sqrt(dx*dx + dy*dy + dz*dz) / r;
        if (d < bestD) { bestD = d; best = REGIONS[i]; }
      }
      return best;
    }

    function h3(x, y, z) {
      var n = x * 374761393 + y * 668265263 + z * 1274126177;
      n = (n ^ (n >> 13)) * 1103515245;
      return ((n ^ (n >> 16)) & 0x7fffffff) / 0x7fffffff;
    }

    function buildVoxelData(step) {
      var data = {};
      REGIONS.forEach(function(r) { data[r.id] = []; });
      for (var x = -0.04; x <= 2.1; x += step) {
        for (var y = -1.15; y <= 1.05; y += step) {
          for (var z = -1.7; z <= 1.7; z += step) {
            if (!brainShell(x, y, z)) continue;
            var r = classifyRegion(x, y, z);
            if (r) {
              var jx = x + (h3(Math.round(x*100),Math.round(y*100),Math.round(z*100)) - 0.5) * step * 0.12;
              var jy = y + (h3(Math.round(y*100),Math.round(z*100),Math.round(x*100)) - 0.5) * step * 0.12;
              var jz = z + (h3(Math.round(z*100),Math.round(x*100),Math.round(y*100)) - 0.5) * step * 0.12;
              data[r.id].push([jx, jy, jz]);
            }
          }
        }
      }
      return data;
    }

    const regionGroups = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9, -9);
    let hovered = null;
    let selected = null;

    /* ─── Build voxels with InstancedMesh ─── */
    var voxelData = buildVoxelData(0.095);
    var voxelSize = 0.095;
    var geo = new THREE.BoxGeometry(voxelSize * 0.96, voxelSize * 0.96, voxelSize * 0.96);

    REGIONS.forEach(function(r) {
      var positions = voxelData[r.id];
      if (!positions || positions.length === 0) return;

      var color = new THREE.Color(r.color);
      var mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.48,
        metalness: 0.04,
        flatShading: true,
      });

      var inst = new THREE.InstancedMesh(geo, mat, positions.length);
      inst.castShadow = true;
      inst.receiveShadow = true;

      var dummy = new THREE.Object3D();
      for (var i = 0; i < positions.length; i++) {
        dummy.position.set(positions[i][0], positions[i][1], positions[i][2]);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;

      var group = new THREE.Group();
      group.add(inst);
      group.userData = { region: r };
      scene.add(group);
      regionGroups.push(group);
    });

    /* ─── Legend ─── */
    function buildLegend() {
      REGIONS.forEach(function(r, idx) {
        var item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.id = r.id;
        item.innerHTML =
          '<div class="legend-dot" style="background:' + r.color + ';box-shadow:0 1px 6px ' + r.color + '60"></div>' +
          '<span class="legend-name">' + r.name + '</span>';
        item.addEventListener('click', function() { selectRegion(idx); });
        legendEl.appendChild(item);
      });
    }

    /* ─── Info panel ─── */
    function showInfo(r) {
      var c = new THREE.Color(r.color);
      var rgb = Math.round(c.r*255) + ',' + Math.round(c.g*255) + ',' + Math.round(c.b*255);
      var tags = r.ai.map(function(t) { return '<span class="info-tag">' + t + '</span>'; }).join('');

      var rulesHtml = '';
      if (r.llmRules && r.llmRules.length) {
        rulesHtml = '<div class="info-label">Reglas LLM</div><div class="info-rules">';
        r.llmRules.forEach(function(rule) {
          rulesHtml += '<div class="info-rule">' + rule + '</div>';
        });
        rulesHtml += '</div>';
      }

      var theoryHtml = '';
      if (r.theory) {
        theoryHtml =
          '<div class="info-label">Teoría</div>' +
          '<div class="info-theory">' +
            '<div class="info-theory-title">' + r.theory.title + '</div>' +
            '<div class="info-theory-text">' + r.theory.text + '</div>' +
            (r.theory.key ? '<div class="info-theory-key"><span class="key-icon">⚡</span> ' + r.theory.key + '</div>' : '') +
          '</div>';
      }

      infoContent.innerHTML =
        '<div class="info-chip" style="background:rgba(' + rgb + ',0.12);color:' + r.color + ';border:1px solid rgba(' + rgb + ',0.25)">' +
          '<span class="dot" style="background:' + r.color + '"></span>' + r.name +
        '</div>' +
        '<h2>' + r.name + '</h2>' +
        '<p class="info-brain">' + r.brain + '</p>' +
        '<div class="info-label">Analogía en IA</div>' +
        '<div class="info-analogy" style="border-left:3px solid ' + r.color + '">' + r.analogy + '</div>' +
        '<div class="info-label">Tecnologías</div>' +
        '<div class="info-tags">' + tags + '</div>' +
        rulesHtml +
        theoryHtml;
      infoPanel.classList.add('open');
    }

    /* ─── Selection + Hover ─── */
    function selectRegion(idx) {
      var r = REGIONS[idx];
      selected = r;
      controls.autoRotate = false;

      document.querySelectorAll('.legend-item').forEach(function(el) {
        el.classList.toggle('active', el.dataset.id === r.id);
      });

      regionGroups.forEach(function(g) {
        var isTarget = g.userData.region.id === r.id;
        g.children.forEach(function(child) {
          if (child.material) {
            child.material.opacity = isTarget ? 1 : 0.18;
            child.material.transparent = !isTarget;
          }
        });
      });

      showInfo(r);
    }

    function resetView() {
      selected = null;
      controls.autoRotate = true;
      document.querySelectorAll('.legend-item').forEach(function(el) { el.classList.remove('active'); });
      infoPanel.classList.remove('open');
      label.classList.remove('show');
      regionGroups.forEach(function(g) {
        g.children.forEach(function(child) {
          if (child.material) { child.material.opacity = 1; child.material.transparent = false; }
        });
      });
    }

    function setHover(group) {
      if (hovered === group) return;
      if (hovered && (!selected || hovered.userData.region.id !== selected.id)) {
        hovered.children.forEach(function(c) {
          if (c.material) { c.material.opacity = 1; c.material.transparent = false; }
        });
      }
      hovered = group;
      if (hovered && (!selected || hovered.userData.region.id !== selected.id)) {
        hovered.children.forEach(function(c) {
          if (c.material) { c.material.opacity = 0.82; c.material.transparent = true; }
        });
      }
      renderer.domElement.style.cursor = hovered ? 'pointer' : 'default';
    }

    function hitTest() {
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(regionGroups, true);
      if (hits.length > 0) {
        var obj = hits[0].object;
        while (obj && !obj.userData.region) obj = obj.parent;
        return obj || null;
      }
      return null;
    }

    /* ─── Mouse / touch handlers ─── */
    renderer.domElement.addEventListener('mousemove', function(e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    renderer.domElement.addEventListener('click', function() {
      if (hovered) {
        var idx = REGIONS.indexOf(hovered.userData.region);
        if (idx >= 0) selectRegion(idx);
      }
    });

    renderer.domElement.addEventListener('touchend', function(e) {
      if (e.changedTouches.length === 1) {
        var t = e.changedTouches[0];
        mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
        var hit = hitTest();
        if (hit) {
          var idx = REGIONS.indexOf(hit.userData.region);
          if (idx >= 0) selectRegion(idx);
        }
      }
    });

    closeRef.current.addEventListener('click', resetView);

    /* Keyboard */
    function onKeyDown(e) {
      if (e.key === 'Escape') { resetView(); return; }
      var cur = selected ? REGIONS.indexOf(selected) : -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        selectRegion((cur + 1) % REGIONS.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        selectRegion((cur - 1 + REGIONS.length) % REGIONS.length);
      }
    }
    window.addEventListener('keydown', onKeyDown);

    /* Resize handle — drag left edge of info panel */
    var isResizing = false;
    resizeRef.current.addEventListener('mousedown', function(e) {
      e.preventDefault(); isResizing = true;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });
    function onMouseMove(e) {
      if (!isResizing) return;
      var newW = window.innerWidth - e.clientX;
      newW = Math.max(260, Math.min(520, newW));
      infoPanel.style.width = newW + 'px';
    }
    window.addEventListener('mousemove', onMouseMove);
    function onMouseUp() {
      if (isResizing) { isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; }
    }
    window.addEventListener('mouseup', onMouseUp);

    /* Viewport resize */
    function onWindowResize() {
      var w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onWindowResize);

    /* ─── Build legend ─── */
    buildLegend();

    /* ─── Loading done ─── */
    var loadTimeout = setTimeout(function() {
      loadingEl.classList.add('done');
    }, 400);

    /* ─── Render loop ─── */
    var rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      controls.update();

      /* Continuous hover detection */
      if (!selected) {
        var hit = hitTest();
        setHover(hit);
        if (hit) {
          var vec = new THREE.Vector3();
          hit.children[0].getWorldPosition(vec);
          vec.project(camera);
          var sx = (vec.x * 0.5 + 0.5) * window.innerWidth;
          var sy = (-vec.y * 0.5 + 0.5) * window.innerHeight;
          label.textContent = hit.userData.region.name;
          label.style.left = sx + 'px';
          label.style.top = sy + 'px';
          label.classList.add('show');
        } else {
          label.classList.remove('show');
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    /* ─── Cleanup ─── */
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(loadTimeout);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onWindowResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      /* Remove legend items */
      while (legendEl.firstChild) legendEl.removeChild(legendEl.firstChild);
    };
  }, []);

  return (
    <div className="page-brain">
      <div className="loading" id="loading" ref={loadingRef}>
        <div className="loading-text">{t('brain.loading')}</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
      </div>
      <div id="scene-container" ref={containerRef}></div>
      <SiteNav brand="Cerebro ↔ IA" />
      <div className="title-bar">
        <h1>{t('brain.heading')}</h1>
        <p>{t('brain.subtitle')}</p>
      </div>
      <div className="legend" id="legend" ref={legendRef}>
        <div className="legend-head">{t('brain.legend')}</div>
      </div>
      <div className="hover-label" id="hover-label" ref={hoverLabelRef}></div>
      <div className="info-panel" id="info-panel" ref={infoPanelRef}>
        <div className="info-resize" id="info-resize" ref={resizeRef}></div>
        <button className="info-close" id="info-close" ref={closeRef}>×</button>
        <div id="info-content" ref={infoContentRef}></div>
      </div>
      <div className="hints">
        <kbd>←</kbd> <kbd>→</kbd> {t('brain.hints')}
      </div>
    </div>
  );
}
