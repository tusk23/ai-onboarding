import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SiteNav from '../components/SiteNav.jsx';
import { useI18n } from '../i18n/index.jsx';
import './mas.css';

export default function MasPage() {
  var { t } = useI18n();
  var CONCEPTS = t('mas.concepts');
  const containerRef = useRef(null);
  const legendRef = useRef(null);
  const hoverLabelRef = useRef(null);
  const infoPanelRef = useRef(null);
  const infoContentRef = useRef(null);
  const closeRef = useRef(null);
  const resizeRef = useRef(null);
  const camDebugRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    document.title = t('mas.title');

    const container = containerRef.current;
    const label = hoverLabelRef.current;
    const infoPanel = infoPanelRef.current;
    const infoContent = infoContentRef.current;
    const legendEl = legendRef.current;

    var scene, camera, renderer, controls;
    var conceptGroups = [];
    var conceptAccessories = {};
    var raycaster, mouse = new THREE.Vector2(-9, -9);
    var hovered = null, selected = null;
    var clock = new THREE.Clock();
    var CIRCLE_RADIUS = 1.3;
    var DEFAULT_CAM_POS = new THREE.Vector3(-2.30, 2.84, -5.05);
    var DEFAULT_CAM_TGT = new THREE.Vector3(-0.29, 0.80, 0.00);
    var SPEED = 0.1;
    var camDebug = camDebugRef.current;

    function init() {
      var W = window.innerWidth, H = window.innerHeight;
      var loadingEl = loadingRef.current;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c0f16);
      scene.fog = new THREE.FogExp2(0x0c0f16, 0.04);

      camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
      camera.position.copy(DEFAULT_CAM_POS);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-label', 'Escena 3D de agentes multiagente');
      renderer.domElement.setAttribute('role', 'img');
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.2;
      controls.minDistance = 4;
      controls.maxDistance = 16;
      controls.enablePan = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.target.copy(DEFAULT_CAM_TGT);

      scene.add(new THREE.HemisphereLight(0xddeeff, 0x334466, 0.55));
      var key = new THREE.DirectionalLight(0xfff4e8, 1.5);
      key.position.set(5, 9, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 25;
      key.shadow.camera.left = key.shadow.camera.bottom = -6;
      key.shadow.camera.right = key.shadow.camera.top = 6;
      scene.add(key);
      var fill = new THREE.DirectionalLight(0x8899cc, 0.35);
      fill.position.set(-6, 3, -4);
      scene.add(fill);
      var rim = new THREE.DirectionalLight(0xffeedd, 0.25);
      rim.position.set(0, 5, -7);
      scene.add(rim);
      var under = new THREE.PointLight(0x4466aa, 0.3, 10);
      under.position.set(0, -3, 0);
      scene.add(under);

      buildScene();
      buildLegend();
      bindEvents();
      renderer.render(scene, camera);

      var allIds = CONCEPTS.map(function(x){return x.id;});
      var builtCount = 0;
      function buildNextBatch() {
        var end = Math.min(builtCount + 2, allIds.length);
        for (var i = builtCount; i < end; i++) {
          var cObj = CONCEPTS.find(function(x){return x.id===allIds[i];});
          if (cObj) ensureAccessory(cObj);
          builtCount = i + 1;
        }
        if (loadingEl) {
          loadingEl.querySelector('.loading-text').textContent = 'Preparando ' + builtCount + '/' + allIds.length + '…';
        }
        if (builtCount >= allIds.length) {
          setTimeout(function() {
            if (loadingEl) loadingEl.classList.add('done');
          }, 200);
          animate();
        } else {
          setTimeout(buildNextBatch, 30);
        }
      }
      setTimeout(buildNextBatch, 50);
    }

    function box(group, x, y, z, w, h, d, color) {
      var geo = new THREE.BoxGeometry(w, h, d);
      var mat = new THREE.MeshStandardMaterial({
        color: color, roughness: 0.48, metalness: 0.04, flatShading: true,
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    function darken(color, factor) {
      var c = new THREE.Color(color);
      c.multiplyScalar(factor);
      return c;
    }

    function buildMiniRobot(group, color, ox, oy, oz) {
      var dark = darken(color, 0.5);
      var mid = darken(color, 0.7);
      box(group, ox-0.06, oy, oz, 0.07, 0.04, 0.09, 0x1a1e2a);
      box(group, ox+0.06, oy, oz, 0.07, 0.04, 0.09, 0x1a1e2a);
      box(group, ox, oy+0.06, oz, 0.11, 0.08, 0.10, color);
      box(group, ox, oy+0.08, oz-0.05, 0.08, 0.04, 0.02, mid);
      box(group, ox, oy+0.11, oz, 0.05, 0.02, 0.05, dark);
      box(group, ox, oy+0.17, oz, 0.10, 0.07, 0.09, color);
      box(group, ox, oy+0.20, oz, 0.09, 0.02, 0.08, dark);
      box(group, ox-0.03, oy+0.17, oz-0.05, 0.04, 0.035, 0.02, 0x3a4565);
      box(group, ox-0.03, oy+0.17, oz-0.06, 0.03, 0.025, 0.015, 0x4FC3F7);
      box(group, ox+0.03, oy+0.17, oz-0.05, 0.04, 0.035, 0.02, 0x3a4565);
      box(group, ox+0.03, oy+0.17, oz-0.06, 0.03, 0.025, 0.015, 0x4FC3F7);
    }

    function getAgentWorldPos(id) {
      if (id === 'harness') return new THREE.Vector3(0, 0.8, 0);
      var order = ['inner_loop','outer_loop','coordination','communication','shared_memory','handover','agents_network'];
      var idx = order.indexOf(id);
      var angle = (idx / order.length) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * CIRCLE_RADIUS, 0.8, Math.sin(angle) * CIRCLE_RADIUS);
    }

    function buildScene() {
      var circleOrder = ['inner_loop', 'outer_loop', 'coordination', 'communication', 'shared_memory', 'handover', 'agents_network'];

      var sceneLevelIds = ['outer_loop', 'coordination', 'shared_memory', 'handover', 'agents_network'];

      CONCEPTS.forEach(function(c) {
        var group = new THREE.Group();
        group.userData = { concept: c };

        conceptAccessories[c.id] = null;

        if (c.id === 'harness') {
          buildMiniRobot(group, c.color, 0, 0, 0);
          group.position.set(0, 0.8, 0);
          scene.add(group);
          conceptGroups.push(group);
        } else if (sceneLevelIds.indexOf(c.id) >= 0) {
          buildMiniRobot(group, c.color, 0, 0, 0);
          var ci = circleOrder.indexOf(c.id);
          var angle = (ci / circleOrder.length) * Math.PI * 2;
          var px = Math.cos(angle) * CIRCLE_RADIUS;
          var pz = Math.sin(angle) * CIRCLE_RADIUS;
          group.position.set(px, 0.8, pz);
          scene.add(group);
          conceptGroups.push(group);
        } else {
          var ci = circleOrder.indexOf(c.id);
          var angle = (ci / circleOrder.length) * Math.PI * 2;
          var px = Math.cos(angle) * CIRCLE_RADIUS;
          var pz = Math.sin(angle) * CIRCLE_RADIUS;
          buildMiniRobot(group, c.color, 0, 0, 0);
          group.position.set(px, 0.8, pz);
          scene.add(group);
          conceptGroups.push(group);
        }
      });
    }

    function ensureAccessory(c) {
      if (conceptAccessories[c.id]) return conceptAccessories[c.id];
      var acc = buildAccessory(c);
      if (!acc) return null;
      acc.visible = false;
      var sceneLevelIds = ['outer_loop', 'coordination', 'shared_memory', 'handover', 'agents_network'];
      if (c.id === 'harness') {
        var hGroup = conceptGroups.find(function(g) { return g.userData.concept.id === 'harness'; });
        if (hGroup) hGroup.add(acc);
      } else if (sceneLevelIds.indexOf(c.id) >= 0) {
        scene.add(acc);
      } else {
        var cGroup = conceptGroups.find(function(g) { return g.userData.concept.id === c.id; });
        if (cGroup) cGroup.add(acc);
      }
      conceptAccessories[c.id] = acc;
      return acc;
    }

    function buildAccessory(c) {
      switch (c.id) {
        case 'harness': return buildHarnessFlow(c.color);
        case 'inner_loop': return buildRing(c.color, 0.4, 20);
        case 'outer_loop': return buildOuterLoopFlow(c.color);
        case 'coordination': return buildCoordinationFlow(c.color);
        case 'communication': return buildPulseArc(c.color, 'communication', 'inner_loop');
        case 'shared_memory': return buildMemoryStack(c.color);
        case 'handover': return buildHandoverFlow(c.color);
        case 'agents_network': return buildNetworkFlow(c.color);
      }
    }

    function buildHarnessFlow(color) {
      var g = new THREE.Group();
      var phaseGroups = [];

      var agentIds = ['inner_loop','outer_loop','coordination','communication','shared_memory','handover','agents_network'];
      var circleOrder = ['inner_loop', 'outer_loop', 'coordination', 'communication', 'shared_memory', 'handover', 'agents_network'];

      function getRelPos(id) {
        var idx = circleOrder.indexOf(id);
        var angle = (idx / circleOrder.length) * Math.PI * 2;
        return { x: Math.cos(angle) * 1.3, z: Math.sin(angle) * 1.3 };
      }

      function makeBox(x, y, z, w, hh, d, c, op) {
        var b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), new THREE.MeshStandardMaterial({ color: c, roughness: 0.48, metalness: 0.04, transparent: true, opacity: op || 1 }));
        b.position.set(x, y, z); return b;
      }

      function buildArc(fromPos, toPos, color, op, thick) {
        var dx = toPos.x - fromPos.x, dz = toPos.z - fromPos.z;
        var dist = Math.sqrt(dx*dx + dz*dz), segs = Math.max(8, Math.round(dist * 6));
        var s = thick || 0.025, grp = new THREE.Group();
        for (var i = 0; i <= segs; i++) {
          var tt = i/segs;
          var bx = fromPos.x + dx*tt, bz = fromPos.z + dz*tt, by = Math.sin(tt*Math.PI)*0.2;
          grp.add(makeBox(bx, by, bz, s, s, s, color, op));
        }
        return grp;
      }

      /* ─── Phase 1: Control Central — harness frame with arcs to all agents ─── */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 1;
        pg.add(makeLabel('CONTROL CENTRAL', '#FF8C42', 0, 0.5, 0));
        var s = 0.04, R = 0.28, H = 0.22;
        var corners = [];
        for (var ix = -1; ix <= 1; ix += 2)
          for (var iz = -1; iz <= 1; iz += 2)
            for (var iy = -1; iy <= 1; iy += 2)
              corners.push([ix*R, iy*H, iz*R]);
        corners.forEach(function(p) {
          pg.add(makeBox(p[0], p[1], p[2], s*1.4, s*1.4, s*1.4, '#FF8C42', 0.6));
        });
        for (var iz = -1; iz <= 1; iz += 2)
          for (var iy = -1; iy <= 1; iy += 2)
            for (var x = -R + s*2; x <= R - s*2; x += s*2)
              pg.add(makeBox(x, iy*H, iz*R, s*0.6, s*0.6, s*0.6, '#FF8C42', 0.2));
        for (var ix = -1; ix <= 1; ix += 2)
          for (var iy = -1; iy <= 1; iy += 2)
            for (var z = -R + s*2; z <= R - s*2; z += s*2)
              pg.add(makeBox(ix*R, iy*H, z, s*0.6, s*0.6, s*0.6, '#FF8C42', 0.2));
        for (var ix = -1; ix <= 1; ix += 2)
          for (var iz = -1; iz <= 1; iz += 2)
            for (var y = -H + s*2; y <= H - s*2; y += s*2)
              pg.add(makeBox(ix*R, y, iz*R, s*0.6, s*0.6, s*0.6, '#FF8C42', 0.2));

        agentIds.forEach(function(id) {
          var p = getRelPos(id);
          pg.add(buildArc({x:0,y:0,z:0}, {x:p.x,y:0,z:p.z}, '#FF8C42', 0.15, 0.02));
          pg.add(makeLabel(id.substring(0,4), '#FF8C42', p.x, p.z > 0 ? -0.25 : 0.25, p.z));
        });

        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* ─── Phase 2: Percepción — data flows from agents to harness ─── */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 2;
        pg.add(makeLabel('PERCEPCIÓN', '#4FC3F7', 0, 0.5, 0));
        var periParticles = [];
        agentIds.forEach(function(id, ai) {
          var p = getRelPos(id);
          pg.add(buildArc({x:p.x,y:0,z:p.z}, {x:0,y:0,z:0}, '#4FC3F7', 0.1, 0.02));
          for (var j = 0; j < 2; j++) {
            var pt = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.02,0.02), new THREE.MeshStandardMaterial({ color: 0x4FC3F7, roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0 }));
            pt.position.set(p.x, 0, p.z); pt.userData = { dirX: -p.x, dirZ: -p.z, dist: Math.sqrt(p.x*p.x + p.z*p.z), offset: j * 0.5 + ai * 0.07 };
            pg.add(pt); periParticles.push(pt);
          }
        });
        pg.userData.periParticles = periParticles;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* ─── Phase 3: Orquestación — harness delegates to each agent sequentially ─── */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 3;
        pg.add(makeLabel('ORQUESTACIÓN', '#2ECC71', 0, 0.5, 0));
        var agentColors = ['#9B59B6','#4FC3F7','#2ECC71','#E74C3C','#8E44AD','#F1C40F','#00BCD4'];
        var orchePulses = [];
        var orcheArcs = [];
        agentIds.forEach(function(id, ai) {
          var p = getRelPos(id);
          var ag = buildArc({x:0,y:0,z:0}, {x:p.x,y:0,z:p.z}, agentColors[ai], 0.2, 0.025); pg.add(ag); orcheArcs.push(ag);
          var pulse = new THREE.Mesh(new THREE.BoxGeometry(0.035,0.035,0.035), new THREE.MeshStandardMaterial({ color: agentColors[ai], roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
          pulse.position.set(0, 0, 0); pulse.userData = { dx: p.x, dz: p.z, dist: Math.sqrt(p.x*p.x + p.z*p.z) };
          pg.add(pulse); orchePulses.push(pulse);
        });
        pg.userData.orchePulses = orchePulses; pg.userData.orcheArcs = orcheArcs;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* ─── Phase 4: Supervisión — harness monitors all agents ─── */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 4;
        pg.add(makeLabel('SUPERVISIÓN', '#C39BD3', 0, 0.5, 0));
        var supParticles = [];
        agentIds.forEach(function(id, ai) {
          var p = getRelPos(id);
          pg.add(buildArc({x:0,y:0,z:0}, {x:p.x,y:0,z:p.z}, '#C39BD3', 0.08, 0.015));
          for (var j = 0; j < 3; j++) {
            var pt = new THREE.Mesh(new THREE.BoxGeometry(0.015,0.015,0.015), new THREE.MeshStandardMaterial({ color: ai%2===0?0xC39BD3:0xffffff, roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0 }));
            pt.position.set(0, 0, 0); pt.userData = { dx: p.x, dz: p.z, dist: Math.sqrt(p.x*p.x + p.z*p.z), offset: j * 0.33 + ai * 0.05, dir: j === 1 ? -1 : 1 };
            pg.add(pt); supParticles.push(pt);
          }
        });
        pg.userData.supParticles = supParticles;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      g.userData.phaseGroups = phaseGroups;
      return g;
    }

    function buildRing(color, radius, segments) {
      var g = new THREE.Group();
      var h = 0.35;
      var mat = new THREE.MeshStandardMaterial({
        color: color, roughness: 0.48, metalness: 0.04, flatShading: true,
      });
      var arrowMat = new THREE.MeshStandardMaterial({
        color: darken(color, 0.6), roughness: 0.48, metalness: 0.04, flatShading: true,
      });
      var stepMats = [
        new THREE.MeshStandardMaterial({ color: 0xbb88ee, roughness: 0.48, metalness: 0.04, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0x66dd88, roughness: 0.48, metalness: 0.04, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0x55ccdd, roughness: 0.48, metalness: 0.04, flatShading: true }),
      ];
      var s = 0.045;
      for (var i = 0; i < segments; i++) {
        var a = (i / segments) * Math.PI * 2;
        var b = new THREE.BoxGeometry(s * 1.4, s * 0.6, s * 0.6);
        var m = new THREE.Mesh(b, mat);
        m.position.set(Math.cos(a) * radius, h, Math.sin(a) * radius);
        m.lookAt(0, h, 0);
        g.add(m);
      }
      for (var i = 0; i < 3; i++) {
        var a = (i / 3) * Math.PI * 2;
        var sx = Math.cos(a) * radius;
        var sz = Math.sin(a) * radius;
        for (var j = 0; j < 2; j++) {
          var b = new THREE.BoxGeometry(0.065, 0.035, 0.065);
          var m = new THREE.Mesh(b, stepMats[i]);
          m.position.set(sx, h + 0.025 + j * 0.04, sz);
          g.add(m);
        }
      }
      for (var i = 0; i < 3; i++) {
        var startA = (i / 3) * Math.PI * 2;
        var endA = ((i + 1) / 3) * Math.PI * 2;
        var midA = startA + (endA - startA) / 2;
        var arrowR = radius + 0.06;
        var tipA = midA - 0.12;
        var w = 0.14;
        var b = new THREE.BoxGeometry(s, s, s);
        var m = new THREE.Mesh(b, arrowMat);
        m.position.set(Math.cos(tipA) * (arrowR + 0.02), h, Math.sin(tipA) * (arrowR + 0.02));
        g.add(m);
        var b1 = new THREE.BoxGeometry(s, s, s);
        var m1 = new THREE.Mesh(b1, arrowMat);
        m1.position.set(Math.cos(tipA + w) * arrowR, h, Math.sin(tipA + w) * arrowR);
        g.add(m1);
        var b2 = new THREE.BoxGeometry(s, s, s);
        var m2 = new THREE.Mesh(b2, arrowMat);
        m2.position.set(Math.cos(tipA - w) * arrowR, h, Math.sin(tipA - w) * arrowR);
        g.add(m2);
      }
      return g;
    }

    function makeLabel(text, color, x, y, z) {
      var c = document.createElement('canvas');
      c.width = 256; c.height = 72;
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 256, 72);
      ctx.font = '700 30px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.fillText(text, 128, 36);
      var tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
      var s = new THREE.Sprite(mat);
      s.position.set(x, y, z);
      s.scale.set(0.65, 0.18, 1);
      return s;
    }

    function buildOuterLoopFlow(color) {
      var g = new THREE.Group();

      var hPos = getAgentWorldPos('harness');
      var d1Pos = getAgentWorldPos('inner_loop');
      var d2Pos = getAgentWorldPos('shared_memory');
      var qaPos = getAgentWorldPos('handover');

      var labelY = 0.35;
      g.add(makeLabel('LIDER', '#FF8C42', hPos.x, hPos.y + labelY, hPos.z));
      g.add(makeLabel('DEV 1', '#4FC3F7', d1Pos.x, d1Pos.y + labelY, d1Pos.z));
      g.add(makeLabel('DEV 2', '#4FC3F7', d2Pos.x, d2Pos.y + labelY, d2Pos.z));
      g.add(makeLabel('QA', '#F1C40F', qaPos.x, qaPos.y + labelY, qaPos.z));

      function buildArc(fromPos, toPos, arcColor, pulseColors, phaseStart, phaseEnd) {
        var dx = toPos.x - fromPos.x;
        var dz = toPos.z - fromPos.z;
        var dist = Math.sqrt(dx*dx + dz*dz);
        var segments = Math.max(10, Math.round(dist * 8));

        var mat = new THREE.MeshStandardMaterial({
          color: arcColor, roughness: 0.48, metalness: 0.04,
          transparent: true, opacity: 0.3,
        });
        var s = 0.04;
        var arcGroup = new THREE.Group();
        for (var i = 0; i <= segments; i++) {
          var tt = i / segments;
          var bx = fromPos.x + dx * tt;
          var bz = fromPos.z + dz * tt;
          var by = fromPos.y + Math.sin(tt * Math.PI) * 0.35;
          var b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
          b.position.set(bx, by, bz);
          arcGroup.add(b);
        }
        g.add(arcGroup);

        var pulses = [];
        for (var pi = 0; pi < pulseColors.length; pi++) {
          var pm = new THREE.MeshStandardMaterial({
            color: pulseColors[pi], roughness: 0.3, metalness: 0.1,
            transparent: true, opacity: 0.85,
          });
          var size = 0.05 - pi * 0.008;
          var p = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), pm);
          p.userData = { isPulse: true, pulseIdx: pi };
          p.position.copy(fromPos);
          g.add(p);
          pulses.push(p);
        }

        return { dx: dx, dz: dz, fromPos: fromPos, toPos: toPos, pulses: pulses, phaseStart: phaseStart, phaseEnd: phaseEnd, arcGroup: arcGroup };
      }

      var arcs = [];
      arcs.push(buildArc(hPos, d1Pos, color, [0xffffff, color, 0xffffff], 0.0, 0.22));
      arcs.push(buildArc(hPos, d2Pos, color, [0xffffff, color, 0xffffff], 0.0, 0.22));
      arcs.push(buildArc(d1Pos, qaPos, '#F1C40F', [0xF1C40F, 0xFFD700, 0xF1C40F], 0.24, 0.46));
      arcs.push(buildArc(d2Pos, qaPos, '#F1C40F', [0xF1C40F, 0xFFD700, 0xF1C40F], 0.24, 0.46));
      arcs.push(buildArc(qaPos, hPos, '#2ECC71', [0x2ECC71, 0xffffff, 0x2ECC71], 0.48, 0.70));

      g.userData.flowArcs = arcs;
      return g;
    }

    function buildCoordinationFlow(color) {
      var g = new THREE.Group();

      var hPos = getAgentWorldPos('harness');
      var qaPos = getAgentWorldPos('handover');
      var devPositions = [
        getAgentWorldPos('inner_loop'),
        getAgentWorldPos('shared_memory'),
        getAgentWorldPos('agents_network'),
      ];
      var devColors = ['#9B59B6', '#8E44AD', '#00BCD4'];
      var devNames = ['DEV 1', 'DEV 2', 'DEV 3'];

      var robotPos = new THREE.Vector3(0, 1.8, 0);

      g.add(makeLabel('LIDER', '#FF8C42', hPos.x, hPos.y + 0.35, hPos.z));
      g.add(makeLabel('QA', '#F1C40F', qaPos.x, qaPos.y + 0.35, qaPos.z));
      for (var di = 0; di < devPositions.length; di++) {
        g.add(makeLabel(devNames[di], devColors[di], devPositions[di].x, devPositions[di].y + 0.35, devPositions[di].z));
      }

      var robotGroup = new THREE.Group();
      robotGroup.position.copy(robotPos);
      g.add(robotGroup);
      g.add(makeLabel('PRODUCTO', '#dddddd', 0, 2.15, 0));

      function addRobotPart(group, fn) { fn(group); group.visible = false; robotGroup.add(group); return group; }

      var partGroups = [];

      partGroups.push(addRobotPart(new THREE.Group(), function(pg) {
        box(pg, -0.06, 0, 0, 0.08, 0.04, 0.10, 0xdddddd);
        box(pg, 0.06, 0, 0, 0.08, 0.04, 0.10, 0xdddddd);
        box(pg, 0, 0.06, 0, 0.14, 0.10, 0.12, 0xeeeeee);
      }));

      partGroups.push(addRobotPart(new THREE.Group(), function(pg) {
        box(pg, 0, 0.13, 0, 0.10, 0.06, 0.10, 0xdddddd);
        box(pg, 0, 0.20, 0, 0.13, 0.08, 0.11, 0xeeeeee);
        box(pg, 0, 0.24, 0, 0.11, 0.03, 0.10, 0xcccccc);
      }));

      partGroups.push(addRobotPart(new THREE.Group(), function(pg) {
        box(pg, 0, 0.28, 0, 0.04, 0.06, 0.04, 0xbbbbbb);
        box(pg, -0.04, 0.20, -0.06, 0.05, 0.04, 0.02, 0x3a4565);
        box(pg, -0.04, 0.20, -0.07, 0.04, 0.03, 0.015, 0x4FC3F7);
        box(pg, 0.04, 0.20, -0.06, 0.05, 0.04, 0.02, 0x3a4565);
        box(pg, 0.04, 0.20, -0.07, 0.04, 0.03, 0.015, 0x4FC3F7);
      }));

      var allArcs = [];
      function addArc(fromPos, toPos, arcColor, phaseStart, phaseEnd) {
        var dx = toPos.x - fromPos.x;
        var dz = toPos.z - fromPos.z;
        var dy = toPos.y - fromPos.y;
        var dist = Math.sqrt(dx*dx + dz*dz);
        var isVertical = dist < 0.05;
        var segments = isVertical ? 10 : Math.max(8, Math.round(dist * 7));
        var mat = new THREE.MeshStandardMaterial({
          color: arcColor, roughness: 0.48, metalness: 0.04,
          transparent: true, opacity: 0.25,
        });
        var s = 0.035;
        var arcGroup = new THREE.Group();
        for (var i = 0; i <= segments; i++) {
          var tt = i / segments;
          var bx, by, bz;
          if (isVertical) {
            bx = fromPos.x + Math.sin(tt * Math.PI) * 0.2;
            bz = fromPos.z;
            by = fromPos.y + dy * tt + Math.sin(tt * Math.PI) * 0.25;
          } else {
            bx = fromPos.x + dx * tt;
            bz = fromPos.z + dz * tt;
            by = fromPos.y + Math.sin(tt * Math.PI) * 0.3;
          }
          var b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
          b.position.set(bx, by, bz);
          arcGroup.add(b);
        }
        arcGroup.visible = false;
        g.add(arcGroup);
        var pulses = [];
        var pColors = [0xffffff, arcColor];
        for (var pi = 0; pi < 2; pi++) {
          var pm = new THREE.MeshStandardMaterial({
            color: pColors[pi], roughness: 0.3, metalness: 0.1,
            transparent: true, opacity: 0.85,
          });
          var size = 0.045 - pi * 0.01;
          var p = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), pm);
          p.userData = { isPulse: true, pulseIdx: pi };
          p.position.copy(fromPos);
          g.add(p);
          pulses.push(p);
        }
        allArcs.push({
          dx: dx, dz: dz, dy: dy, fromPos: fromPos, toPos: toPos,
          isVertical: isVertical,
          phaseStart: phaseStart, phaseEnd: phaseEnd, pulses: pulses,
          arcGroup: arcGroup,
        });
      }

      for (var di = 0; di < devPositions.length; di++) {
        var offset = di * 0.33;
        var devPos = devPositions[di];
        var devColor = devColors[di];
        addArc(hPos, devPos, devColor, offset + 0.00, offset + 0.06);
        addArc(devPos, qaPos, '#F1C40F', offset + 0.07, offset + 0.13);
        addArc(qaPos, devPos, '#2ECC71', offset + 0.14, offset + 0.20);
        addArc(devPos, hPos, devColor, offset + 0.21, offset + 0.27);
        addArc(hPos, robotPos, 0xffffff, offset + 0.28, offset + 0.33);
      }

      g.userData.coordinationArcs = allArcs;
      g.userData.partGroups = partGroups;
      g.userData.devCount = devPositions.length;
      return g;
    }

    function buildPulseArc(color, fromId, toId) {
      var g = new THREE.Group();
      var fromPos = getAgentWorldPos(fromId);
      var destPos = getAgentWorldPos(toId);
      var dx = destPos.x - fromPos.x;
      var dz = destPos.z - fromPos.z;
      var dist = Math.sqrt(dx*dx + dz*dz);

      var mat1 = new THREE.MeshStandardMaterial({
        color: color, roughness: 0.48, metalness: 0.04, flatShading: true,
        transparent: true, opacity: 0.35,
      });
      var mat2 = new THREE.MeshStandardMaterial({
        color: darken(color, 0.7), roughness: 0.48, metalness: 0.04, flatShading: true,
        transparent: true, opacity: 0.25,
      });
      var s = 0.045;
      var segments = Math.max(12, Math.round(dist * 8));
      for (var i = 0; i <= segments; i++) {
        var t = i / segments;
        var bx = dx * t;
        var bz = dz * t;
        var by = Math.sin(t * Math.PI) * 0.4;
        var b = new THREE.BoxGeometry(s, s, s);
        var m = new THREE.Mesh(b, mat1);
        m.position.set(bx, by + 0.1, bz);
        m.userData.arcIdx = i;
        g.add(m);
      }
      for (var i = 0; i <= segments; i++) {
        var t = i / segments;
        var bx = dx * t;
        var bz = dz * t;
        var by = Math.sin(t * Math.PI) * 0.4;
        var b = new THREE.BoxGeometry(s, s, s);
        var m = new THREE.Mesh(b, mat2);
        m.position.set(bx, by + 0.08, bz - 0.02);
        m.userData.arcIdx = i;
        g.add(m);
      }
      var pulseMat1 = new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.3, metalness: 0.1, flatShading: true,
        transparent: true, opacity: 0.9,
      });
      var pulse1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), pulseMat1);
      pulse1.userData = { isPulse: true, dir: 1 };
      pulse1.position.set(0, 0.1, 0);
      g.add(pulse1);
      var pulseMat2 = new THREE.MeshStandardMaterial({
        color: darken(color, 0.5), roughness: 0.3, metalness: 0.1, flatShading: true,
        transparent: true, opacity: 0.8,
      });
      var pulse2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), pulseMat2);
      pulse2.userData = { isPulse: true, dir: -1 };
      pulse2.position.set(dx, 0.1, dz);
      g.add(pulse2);
      var pulseMat3 = new THREE.MeshStandardMaterial({
        color: color, roughness: 0.3, metalness: 0.05, flatShading: true,
        transparent: true, opacity: 0.7,
      });
      var pulse3 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.045), pulseMat3);
      pulse3.userData = { isPulse: true, dir: 0.7 };
      pulse3.position.set(0, 0.1, 0);
      g.add(pulse3);
      var pulse4 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.045), pulseMat3);
      pulse4.userData = { isPulse: true, dir: -0.7 };
      pulse4.position.set(dx, 0.1, dz);
      g.add(pulse4);
      g.userData.arcDx = dx;
      g.userData.arcDz = dz;
      return g;
    }

    function buildMemoryStack(color) {
      var g = new THREE.Group();

      var agentIds = ['harness','inner_loop','outer_loop','coordination','communication','shared_memory','handover','agents_network'];
      var agentPositions = agentIds.map(function(id) { return { id: id, pos: getAgentWorldPos(id) }; });

      var baseColor = color;
      var lightColor = '#C39BD3';
      var accentColor = 0xffffff;

      /* ─── LEVEL 3 — Enterprise Vault (y=2.2, center) ─── */
      var vaultY = 2.2;
      var vaultGroup = new THREE.Group();
      vaultGroup.position.set(0, vaultY, 0);
      var vaultSections = [];
      var shelfMat = new THREE.MeshStandardMaterial({
        color: baseColor, roughness: 0.48, metalness: 0.04,
        transparent: true, opacity: 0.15,
      });
      var pillarMat = new THREE.MeshStandardMaterial({
        color: 0x3a4565, roughness: 0.48, metalness: 0.04,
        transparent: true, opacity: 0.5,
      });
      for (var si = 0; si < 4; si++) {
        var shelf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.035, 0.45), shelfMat);
        shelf.position.set(0, si * 0.18, 0);
        vaultGroup.add(shelf);
        vaultSections.push(shelf);
        var block = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.05), shelfMat);
        block.position.set(0.12 * ((si % 2) * 2 - 1), si * 0.18, 0.1);
        vaultGroup.add(block);
      }
      for (var pi = 0; pi < 2; pi++) {
        for (var pj = 0; pj < 2; pj++) {
          var pillar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.72, 0.03), pillarMat);
          pillar.position.set((pi === 0 ? -0.36 : 0.36), 0.32, (pj === 0 ? -0.24 : 0.24));
          vaultGroup.add(pillar);
        }
      }
      vaultGroup.add(makeLabel('EMPRESARIAL', '#C39BD3', 0, 0.5, 0));
      g.add(vaultGroup);

      /* ─── LEVEL 2 — Collective Pool (y=0.8, center) ─── */
      var poolY = 0.8;
      var poolGroup = new THREE.Group();
      poolGroup.position.set(0, poolY, 0);
      var poolMat = new THREE.MeshStandardMaterial({
        color: baseColor, roughness: 0.48, metalness: 0.04,
        transparent: true, opacity: 0.15,
      });
      var poolGlowMat = new THREE.MeshStandardMaterial({
        color: lightColor, roughness: 0.3, metalness: 0.05,
        transparent: true, opacity: 0.35,
      });
      var poolRings = [
        { r: 0.45, op: 0.08 },
        { r: 0.35, op: 0.12 },
        { r: 0.25, op: 0.18 },
        { r: 0.15, op: 0.25 },
      ];
      poolRings.forEach(function(ring) {
        var segs = 24;
        for (var i = 0; i < segs; i++) {
          var a = (i / segs) * Math.PI * 2;
          var b = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 0.025), poolMat);
          b.position.set(Math.cos(a) * ring.r, 0, Math.sin(a) * ring.r);
          b.material = poolMat.clone();
          b.material.opacity = ring.op;
          poolGroup.add(b);
        }
      });
      var coreMat = new THREE.MeshStandardMaterial({
        color: lightColor, roughness: 0.3, metalness: 0.05,
        transparent: true, opacity: 0.5,
      });
      var core = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.10), coreMat);
      core.position.set(0, 0.02, 0);
      core.userData.isCore = true;
      poolGroup.add(core);
      poolGroup.add(makeLabel('COLECTIVA', '#B388D4', 0, 0.15, 0));
      g.add(poolGroup);

      /* ─── Data fragments floating above pool ─── */
      var dataFragments = [];
      for (var fi = 0; fi < 12; fi++) {
        var dfMat = new THREE.MeshStandardMaterial({
          color: fi % 2 === 0 ? lightColor : 0xffffff, roughness: 0.3, metalness: 0.05,
          transparent: true, opacity: 0.0,
        });
        var df = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.025), dfMat);
        var angle = Math.random() * Math.PI * 2;
        df.position.set(Math.cos(angle) * (0.08 + Math.random() * 0.25), 0.06 + Math.random() * 0.12, Math.sin(angle) * (0.08 + Math.random() * 0.25));
        df.userData = { baseY: df.position.y, phase: Math.random() * Math.PI * 2, angle: angle, radius: Math.sqrt(df.position.x*df.position.x + df.position.z*df.position.z) };
        poolGroup.add(df);
        dataFragments.push(df);
      }

      /* ─── LEVEL 1 — Local Memory (orbit particles per agent) ─── */
      var localParticlesData = [];
      var localAgentIndices = [];
      agentPositions.forEach(function(agent, ai) {
        if (agent.id === 'shared_memory') return;
        localAgentIndices.push(ai);
        var glowMat = new THREE.MeshStandardMaterial({
          color: 0xffffff, roughness: 0.3, metalness: 0.05,
          transparent: true, opacity: 0.0,
        });
        var ring = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.04), glowMat);
        ring.position.set(agent.pos.x, agent.pos.y - 0.05, agent.pos.z);
        ring.userData = { isGlowRing: true, agentIdx: ai };
        g.add(ring);
        var count = agent.id === 'harness' ? 6 : 4;
        var agentColors = ['#ffffff', '#B388D4', '#8E44AD', '#C39BD3'];
        for (var i = 0; i < count; i++) {
          var a = Math.random() * Math.PI * 2;
          var r = 0.07 + Math.random() * 0.12;
          var speed = 0.4 + Math.random() * 0.6;
          var col = agentColors[i % agentColors.length];
          var lm = new THREE.MeshStandardMaterial({
            color: col, roughness: 0.3, metalness: 0.05,
            transparent: true, opacity: 0.6,
          });
          var d = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.025), lm);
          d.position.set(agent.pos.x + Math.cos(a) * r, agent.pos.y + 0.15 + Math.random() * 0.10, agent.pos.z + Math.sin(a) * r);
          d.userData = {
            centerX: agent.pos.x, centerY: agent.pos.y + 0.15, centerZ: agent.pos.z,
            orbitAngle: a, orbitRadius: r, orbitSpeed: speed,
          };
          g.add(d);
          localParticlesData.push(d);
        }
      });

      /* ─── Arcs: agents ↔ collective pool ─── */
      var memoryArcs = [];

      function addMemArc(fromPos, toPos, arcColor, phaseStart, phaseEnd) {
        var dx = toPos.x - fromPos.x;
        var dz = toPos.z - fromPos.z;
        var dy = toPos.y - fromPos.y;
        var dist = Math.sqrt(dx*dx + dz*dz);
        var isVertical = dist < 0.05;
        var segments = isVertical ? 10 : Math.max(8, Math.round(dist * 6));
        var mat = new THREE.MeshStandardMaterial({
          color: arcColor, roughness: 0.48, metalness: 0.04,
          transparent: true, opacity: 0.20,
        });
        var s = 0.03;
        var arcGroup = new THREE.Group();
        for (var i = 0; i <= segments; i++) {
          var tt = i / segments;
          var bx, by, bz;
          if (isVertical) {
            bx = fromPos.x + Math.sin(tt * Math.PI) * 0.15;
            bz = fromPos.z;
            by = fromPos.y + dy * tt + Math.sin(tt * Math.PI) * 0.2;
          } else {
            bx = fromPos.x + dx * tt;
            bz = fromPos.z + dz * tt;
            by = fromPos.y + Math.sin(tt * Math.PI) * 0.25;
          }
          var b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
          b.position.set(bx, by, bz);
          arcGroup.add(b);
        }
        g.add(arcGroup);
        var pulses = [];
        for (var pi = 0; pi < 2; pi++) {
          var pm = new THREE.MeshStandardMaterial({
            color: pi === 0 ? 0xffffff : arcColor, roughness: 0.3, metalness: 0.1,
            transparent: true, opacity: 0.8,
          });
          var p = new THREE.Mesh(new THREE.BoxGeometry(0.035 - pi * 0.008, 0.035 - pi * 0.008, 0.035 - pi * 0.008), pm);
          p.userData = { isPulse: true, pulseIdx: pi };
          p.position.copy(fromPos);
          g.add(p);
          pulses.push(p);
        }
        memoryArcs.push({
          dx: dx, dz: dz, dy: dy, fromPos: fromPos, toPos: toPos,
          isVertical: isVertical,
          phaseStart: phaseStart, phaseEnd: phaseEnd, pulses: pulses,
          arcGroup: arcGroup,
        });
      }

      var poolCenter = { x: 0, y: poolY, z: 0 };

      agentPositions.forEach(function(agent) {
        if (agent.id === 'shared_memory') return;
        addMemArc(agent.pos, poolCenter, lightColor, 0.12, 0.35);
        addMemArc(poolCenter, agent.pos, lightColor, 0.65, 0.88);
      });

      addMemArc(poolCenter, { x: 0, y: vaultY, z: 0 }, '#C39BD3', 0.35, 0.50);
      addMemArc({ x: 0, y: vaultY, z: 0 }, poolCenter, '#C39BD3', 0.50, 0.65);

      g.userData.memoryArcs = memoryArcs;
      g.userData.localParticles = localParticlesData;
      g.userData.vaultSections = vaultSections;
      g.userData.dataFragments = dataFragments;
      g.userData.poolY = poolY;
      g.userData.vaultY = vaultY;
      g.userData.vaultBaseColor = baseColor;
      g.userData.vaultLightColor = '#C39BD3';
      g.userData.poolGlowMat = poolGlowMat;
      return g;
    }

    function buildHandoverFlow(color) {
      var g = new THREE.Group();
      var hPos = getAgentWorldPos('harness');
      var d1Pos = getAgentWorldPos('inner_loop');
      var d2Pos = getAgentWorldPos('shared_memory');
      var qaPos = getAgentWorldPos('handover');
      var phaseGroups = [];

      function makeBox(x, y, z, w, hh, d, c, op) {
        var b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), new THREE.MeshStandardMaterial({ color: c, roughness: 0.48, metalness: 0.04, transparent: true, opacity: op || 1 }));
        b.position.set(x, y, z); return b;
      }

      function buildArc(fromPos, toPos, color, op, thick) {
        var dx = toPos.x - fromPos.x, dz = toPos.z - fromPos.z, dy = toPos.y - fromPos.y;
        var dist = Math.sqrt(dx*dx + dz*dz), isV = dist < 0.05, segs = isV ? 10 : Math.max(8, Math.round(dist * 6));
        var s = thick || 0.03, grp = new THREE.Group();
        for (var i = 0; i <= segs; i++) {
          var tt = i/segs, bx, by, bz;
          if (isV) { bx = fromPos.x + Math.sin(tt*Math.PI)*0.15; bz = fromPos.z; by = fromPos.y + dy*tt + Math.sin(tt*Math.PI)*0.2; }
          else { bx = fromPos.x + dx*tt; bz = fromPos.z + dz*tt; by = fromPos.y + Math.sin(tt*Math.PI)*0.25; }
          grp.add(makeBox(bx, by, bz, s, s, s, color, op));
        }
        return grp;
      }

      /* Phase 1: Relay Race */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 1;
        var order = [hPos, d1Pos, d2Pos, qaPos, hPos];
        var cols = ['#FF8C42','#9B59B6','#8E44AD','#F1C40F'];
        var arcGroups = [];
        for (var i = 0; i < 4; i++) { var ag = buildArc(order[i], order[i+1], cols[i], 0.25, 0.03); pg.add(ag); arcGroups.push(ag); pg.add(makeLabel(i===0?'LIDER':i===1?'DEV 1':i===2?'DEV 2':'QA', cols[i], order[i].x, order[i].y+0.4, order[i].z)); }
        var tok = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.07,0.07), new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0 }));
        tok.position.copy(hPos); pg.add(tok);
        pg.userData.relayPath = order; pg.userData.relayToken = tok; pg.userData.relayArcs = arcGroups;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* Phase 2: Context Packet */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 2;
        pg.add(buildArc(d1Pos, qaPos, '#F1C40F', 0.25, 0.03));
        pg.add(makeLabel('CONTEXTO', '#F1C40F', (d1Pos.x+qaPos.x)/2, 1.5, (d1Pos.z+qaPos.z)/2));
        var pkt = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.04), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
        pkt.position.copy(d1Pos); pg.add(pkt);
        var frags = [];
        for (var fi = 0; fi < 8; fi++) {
          var f = new THREE.Mesh(new THREE.BoxGeometry(0.015,0.015,0.015), new THREE.MeshStandardMaterial({ color: fi%2===0?0xF1C40F:0xffffff, roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0 }));
          f.position.copy(qaPos); f.userData = { ox: (Math.random()-0.5)*0.18, oy: (Math.random()-0.5)*0.18, oz: (Math.random()-0.5)*0.18 }; pg.add(f); frags.push(f);
        }
        pg.userData.packet = pkt; pg.userData.fragments = frags; pg.userData.src = d1Pos; pg.userData.dst = qaPos;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* Phase 3: Routing Tree */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 3;
        var branches = [{to:d1Pos,label:'DEV 1',color:'#9B59B6'},{to:d2Pos,label:'DEV 2',color:'#8E44AD'},{to:qaPos,label:'QA',color:'#F1C40F'}];
        pg.add(makeLabel('RUTEADOR','#FF8C42',hPos.x,hPos.y+0.5,hPos.z));
        var routePulses = [];
        var routeArcs = [];
        branches.forEach(function(b, bi) {
          var ag = buildArc(hPos, b.to, b.color, 0.2, 0.025); pg.add(ag); routeArcs.push(ag);
          pg.add(makeLabel(b.label, b.color, b.to.x, b.to.y+0.4, b.to.z));
          var rp = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.04), new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
          rp.position.copy(hPos); rp.userData = { branchIdx: bi, dx: b.to.x-hPos.x, dz: b.to.z-hPos.z, dy: b.to.y-hPos.y }; pg.add(rp); routePulses.push(rp);
        });
        pg.userData.branches = branches; pg.userData.routePulses = routePulses; pg.userData.routeArcs = routeArcs;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

        /* Phase 4: Handshake 3-Way */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 4;
        var a = hPos, b = d1Pos;
        pg.add(makeLabel('SYN','#ffffff',(a.x+b.x)/2-0.2,(a.y+b.y)/2+0.3,(a.z+b.z)/2));
        pg.add(makeLabel('SYN-ACK','#F1C40F',(a.x+b.x)/2,(a.y+b.y)/2+0.15,(a.z+b.z)/2));
        pg.add(makeLabel('ACK','#2ECC71',(a.x+b.x)/2+0.2,(a.y+b.y)/2,(a.z+b.z)/2));
        var handshakePulses = [];
        var handshakeArcs = [];
        var hConfigs = [{color:'#ffffff',rev:false,off:0},{color:'#F1C40F',rev:true,off:0.04},{color:'#2ECC71',rev:false,off:-0.04}];
        hConfigs.forEach(function(cfg) {
          var fx = a.x+cfg.off, fy = a.y, fz = a.z, tx = b.x+cfg.off, ty = b.y, tz = b.z;
          if (cfg.rev) { var tmp; tmp=fx; fx=tx; tx=tmp; tmp=fy; fy=ty; ty=tmp; tmp=fz; fz=tz; tz=tmp; }
          var ag = buildArc({x:fx,y:fy,z:fz},{x:tx,y:ty,z:tz},cfg.color,0.2,0.025); pg.add(ag); handshakeArcs.push(ag);
          var hp = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.04), new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
          hp.position.set(fx,fy,fz); hp.userData = { dx:tx-fx, dz:tz-fz, dy:ty-fy, sx:fx, sy:fy, sz:fz }; pg.add(hp); handshakePulses.push(hp);
        });
        pg.userData.handshakePulses = handshakePulses; pg.userData.handshakeArcs = handshakeArcs;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      g.userData.phaseGroups = phaseGroups;
      g.userData.hPos = hPos; g.userData.d1Pos = d1Pos; g.userData.d2Pos = d2Pos; g.userData.qaPos = qaPos;
      return g;
    }

    function buildNetworkFlow(color) {
      var g = new THREE.Group();
      var agentIds = ['harness','inner_loop','outer_loop','coordination','communication','shared_memory','handover','agents_network'];
      var agentPoses = agentIds.map(function(id) { return getAgentWorldPos(id); });
      var phaseGroups = [];

      function makeBox(x, y, z, w, hh, d, c, op) {
        var b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), new THREE.MeshStandardMaterial({ color: c, roughness: 0.48, metalness: 0.04, transparent: true, opacity: op || 1 }));
        b.position.set(x, y, z); return b;
      }

      function buildArc(fromPos, toPos, color, op, thick) {
        var dx = toPos.x - fromPos.x, dz = toPos.z - fromPos.z, dy = toPos.y - fromPos.y;
        var dist = Math.sqrt(dx*dx + dz*dz), isV = dist < 0.05, segs = isV ? 10 : Math.max(6, Math.round(dist * 5));
        var s = thick || 0.025, grp = new THREE.Group();
        for (var i = 0; i <= segs; i++) {
          var tt = i/segs, bx, by, bz;
          if (isV) { bx = fromPos.x + Math.sin(tt*Math.PI)*0.12; bz = fromPos.z; by = fromPos.y + dy*tt + Math.sin(tt*Math.PI)*0.15; }
          else { bx = fromPos.x + dx*tt; bz = fromPos.z + dz*tt; by = fromPos.y + Math.sin(tt*Math.PI)*0.2; }
          grp.add(makeBox(bx, by, bz, s, s, s, color, op));
        }
        return grp;
      }

      function makeNode(pos, c) {
        return makeBox(pos.x, pos.y, pos.z, 0.05, 0.05, 0.05, c, 1);
      }

      /* Phase 1: Star */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 1;
        pg.add(makeLabel('ESTRELLA', color, 0, 1.8, 0));
        var centerP = agentPoses[0];
        for (var i = 1; i < agentPoses.length; i++) {
          pg.add(buildArc(centerP, agentPoses[i], color, 0.15, 0.025));
          pg.add(makeLabel(agentIds[i].substring(0, 4), '#00BCD4', agentPoses[i].x, agentPoses[i].y+0.3, agentPoses[i].z));
        }
        var starPulse = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.04), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
        starPulse.position.copy(centerP); pg.add(starPulse);
        pg.userData.centerP = centerP; pg.userData.agents = agentPoses; pg.userData.starPulse = starPulse;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* Phase 2: Mesh */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 2;
        pg.add(makeLabel('MALLA', color, 0, 1.8, 0));
        var meshPairs = [];
        for (var i = 0; i < agentPoses.length; i++) {
          for (var j = i+1; j < agentPoses.length; j++) {
            if (Math.random() < 0.45) {
              pg.add(buildArc(agentPoses[i], agentPoses[j], color, 0.1, 0.02));
              meshPairs.push({ a: i, b: j });
            }
          }
        }
        var meshPulses = [];
        for (var pi = 0; pi < 4; pi++) {
          var mp = new THREE.Mesh(new THREE.BoxGeometry(0.025,0.025,0.025), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
          mp.position.copy(agentPoses[0]); pg.add(mp); meshPulses.push(mp);
        }
        pg.userData.agentPoses = agentPoses; pg.userData.meshPulses = meshPulses; pg.userData.meshPairs = meshPairs;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* Phase 3: Pipeline */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 3;
        pg.add(makeLabel('PIPELINE', color, 0, 1.8, 0));
        var pipeOrder = [0, 1, 2, 4, 6, 5, 3, 7];
        for (var i = 0; i < pipeOrder.length - 1; i++) {
          pg.add(buildArc(agentPoses[pipeOrder[i]], agentPoses[pipeOrder[i+1]], color, 0.2, 0.025));
        }
        var pipePulse = new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.04), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
        pipePulse.position.copy(agentPoses[pipeOrder[0]]); pg.add(pipePulse);
        pg.userData.pipeOrder = pipeOrder; pg.userData.agentPoses = agentPoses; pg.userData.pipePulse = pipePulse;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      /* Phase 4: Dynamic */
      (function() {
        var pg = new THREE.Group(); pg.userData.phase = 4;
        pg.add(makeLabel('DINÁMICA', color, 0, 1.8, 0));
        var dynGroups = [];
        for (var gi = 0; gi < 4; gi++) {
          var a = Math.floor(Math.random() * agentPoses.length);
          var b = Math.floor(Math.random() * agentPoses.length);
          if (a === b) b = (b + 1) % agentPoses.length;
          var arcGrp = buildArc(agentPoses[a], agentPoses[b], '#F1C40F', 0.3, 0.03);
          arcGrp.visible = false;
          pg.add(arcGrp);
          var dp = new THREE.Mesh(new THREE.BoxGeometry(0.035,0.035,0.035), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0 }));
          dp.position.copy(agentPoses[a]); pg.add(dp);
          dynGroups.push({ a: a, b: b, arcGrp: arcGrp, pulse: dp, phaseOffset: gi * 0.25 });
        }
        pg.userData.dynGroups = dynGroups; pg.userData.agentPoses = agentPoses;
        pg.visible = false; g.add(pg); phaseGroups.push(pg);
      })();

      g.userData.phaseGroups = phaseGroups;
      g.userData.agentIds = agentIds;
      return g;
    }

    function buildLegend() {
      CONCEPTS.forEach(function(c, idx) {
        var item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.id = c.id;
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.innerHTML =
          '<div class="legend-dot" style="background:' + c.color + ';box-shadow:0 1px 6px ' + c.color + '60"></div>' +
          '<span class="legend-name">' + c.name + '</span>';
        item.addEventListener('click', function() { selectConcept(idx); });
        item.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectConcept(idx); }
        });
        legendEl.appendChild(item);
      });
    }

    function showInfo(c) {
      var col = new THREE.Color(c.color);
      var rgb = Math.round(col.r*255) + ',' + Math.round(col.g*255) + ',' + Math.round(col.b*255);
      var tags = c.tech.map(function(t) { return '<span class="info-tag">' + t + '</span>'; }).join('');
      var rulesHtml = '';
      if (c.llmRules && c.llmRules.length) {
        rulesHtml = '<div class="info-label">Reglas LLM</div><div class="info-rules">';
        c.llmRules.forEach(function(rule, i) {
          rulesHtml += '<div class="info-rule"><span class="num">' + (i+1) + '</span><span>' + rule + '</span></div>';
        });
        rulesHtml += '</div>';
      }
      var theoryHtml = '';
      if (c.theory) {
        theoryHtml =
          '<div class="info-label">Teor\u00eda</div>' +
          '<div class="info-theory">' +
            '<div class="info-theory-title">' + c.theory.title + '</div>' +
            '<div class="info-theory-text">' + c.theory.text + '</div>' +
            (c.theory.key ? '<div class="info-theory-key">' + c.theory.key + '</div>' : '') +
          '</div>';
      }
      infoContent.innerHTML =
        '<div class="info-chip" style="background:rgba(' + rgb + ',0.12);color:' + c.color + ';border:1px solid rgba(' + rgb + ',0.25)">' +
          '<span class="dot" style="background:' + c.color + '"></span>' + c.name +
        '</div>' +
        '<h2>' + c.name + '</h2>' +
        '<p class="info-desc">' + c.desc + '</p>' +
        '<div class="info-label">Analog\u00eda</div>' +
        '<div class="info-analogy" style="border-left:3px solid ' + c.color + '">' + c.analogy + '</div>' +
        '<div class="info-label">Tecnolog\u00edas</div>' +
        '<div class="info-tags">' + tags + '</div>' +
        rulesHtml +
        theoryHtml;
      infoPanel.scrollTop = 0;
      infoPanel.classList.add('open');
      infoPanel.setAttribute('aria-hidden', 'false');
    }

    function selectConcept(idx) {
      var c = CONCEPTS[idx];
      selected = c;
      controls.autoRotate = false;
      document.querySelectorAll('.legend-item').forEach(function(el) {
        el.classList.toggle('active', el.dataset.id === c.id);
      });

      conceptGroups.forEach(function(g) {
        g.children.forEach(function(child) {
          if (child.material) {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
            child.material.opacity = 1;
            child.material.transparent = false;
            child.scale.setScalar(1);
          }
        });
        g.userData.isHighlighted = false;
      });

      if (c.id === 'harness') {
        conceptGroups.forEach(function(g) {
          g.children.forEach(function(child) {
            if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
              child.material.opacity = 1; child.material.transparent = false;
              child.material.emissive = new THREE.Color(child.material.color);
              child.material.emissiveIntensity = 0.2;
            }
          });
          g.userData.isHighlighted = true;
        });
      } else if (c.id === 'outer_loop') {
        var involvedIds = ['harness', 'inner_loop', 'shared_memory', 'handover'];
        var devColors = { inner_loop: '#4FC3F7', shared_memory: '#4FC3F7' };
        conceptGroups.forEach(function(g) {
          var id = g.userData.concept.id;
          if (involvedIds.indexOf(id) >= 0) {
            var devColor = devColors[id];
            g.children.forEach(function(child) {
              if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
                child.material.opacity = 1;
                child.material.transparent = false;
                child.material.emissive = devColor ? new THREE.Color(devColor) : new THREE.Color(child.material.color);
                child.material.emissiveIntensity = 0.3;
              }
            });
            g.userData.isHighlighted = true;
          } else {
            g.children.forEach(function(child) {
              if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
                child.material.opacity = 0.08;
                child.material.transparent = true;
              }
              if (child.userData && child.userData.isPulse) {
                child.material.opacity = 0;
              }
            });
            g.userData.isHighlighted = false;
          }
        });
      } else if (c.id === 'coordination') {
        var involvedIds = ['harness', 'inner_loop', 'shared_memory', 'handover', 'agents_network'];
        conceptGroups.forEach(function(g) {
          var id = g.userData.concept.id;
          if (involvedIds.indexOf(id) >= 0) {
            g.children.forEach(function(child) {
              if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
                child.material.opacity = 1;
                child.material.transparent = false;
                child.material.emissive = new THREE.Color(child.material.color);
                child.material.emissiveIntensity = 0.3;
              }
            });
            g.userData.isHighlighted = true;
          } else {
            g.children.forEach(function(child) {
              if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
                child.material.opacity = 0.08;
                child.material.transparent = true;
              }
              if (child.userData && child.userData.isPulse) {
                child.material.opacity = 0;
              }
            });
            g.userData.isHighlighted = false;
          }
        });
      } else if (c.id === 'handover') {
        conceptGroups.forEach(function(g) {
          g.children.forEach(function(child) {
            if (child.material) { child.material.opacity = 1; child.material.transparent = false; child.material.emissive = new THREE.Color(0x000000); child.material.emissiveIntensity = 0; }
          });
          g.userData.isHighlighted = false;
        });
      } else if (c.id === 'agents_network') {
        conceptGroups.forEach(function(g) {
          g.children.forEach(function(child) {
            if (child.material) { child.material.opacity = 1; child.material.transparent = false; child.material.emissive = new THREE.Color(0x000000); child.material.emissiveIntensity = 0; }
          });
          g.userData.isHighlighted = false;
        });
      } else if (c.id === 'shared_memory') {
        conceptGroups.forEach(function(g) {
          g.children.forEach(function(child) {
            if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
              child.material.opacity = 1;
              child.material.transparent = false;
              child.material.emissive = new THREE.Color(child.material.color);
              child.material.emissiveIntensity = 0.25;
            }
          });
          g.userData.isHighlighted = true;
        });
      } else {
        conceptGroups.forEach(function(g) {
          var isTarget = g.userData.concept.id === c.id;
          g.children.forEach(function(child) {
            if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
              child.material.opacity = isTarget ? 1 : 0.15;
              child.material.transparent = !isTarget;
            }
            if (child.userData && child.userData.isPulse) {
              child.material.opacity = isTarget ? 0.8 : 0;
            }
          });
          g.userData.isHighlighted = false;
        });
      }

      ensureAccessory(c);
      Object.keys(conceptAccessories).forEach(function(key) {
        if (conceptAccessories[key]) {
          conceptAccessories[key].visible = (key === c.id);
        }
      });
      showInfo(c);
    }

    function closePanel() {
      selected = null;
      controls.autoRotate = true;
      document.querySelectorAll('.legend-item').forEach(function(el) { el.classList.remove('active'); });
      infoPanel.classList.remove('open');
      infoPanel.setAttribute('aria-hidden', 'true');
      label.classList.remove('show');
      conceptGroups.forEach(function(g) {
        g.children.forEach(function(child) {
          if (child.material) {
            child.material.opacity = 1;
            child.material.transparent = false;
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
            child.scale.setScalar(1);
          }
        });
        g.userData.isHighlighted = false;
      });
      Object.keys(conceptAccessories).forEach(function(key) {
        if (conceptAccessories[key]) conceptAccessories[key].visible = false;
      });
      controls.enableDamping = false;
      camera.position.copy(DEFAULT_CAM_POS);
      controls.target.copy(DEFAULT_CAM_TGT);
      controls.update();
      controls.enableDamping = true;
    }

    function setHover(group) {
      if (hovered === group) return;
      if (hovered && (!selected || hovered.userData.concept.id !== selected.id)) {
        hovered.children.forEach(function(c) {
          if (c.material) { c.material.opacity = 1; c.material.transparent = false; }
        });
      }
      hovered = group;
      if (hovered && (!selected || hovered.userData.concept.id !== selected.id)) {
        hovered.children.forEach(function(c) {
          if (c.material) { c.material.opacity = 0.75; c.material.transparent = true; }
        });
      }
      renderer.domElement.style.cursor = hovered ? 'pointer' : 'default';
    }

    function hitTest() {
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(conceptGroups, true);
      if (hits.length > 0) {
        var obj = hits[0].object;
        while (obj && !obj.userData.concept) obj = obj.parent;
        return obj || null;
      }
      return null;
    }

    function bindEvents() {
      raycaster = new THREE.Raycaster();
      renderer.domElement.addEventListener('mousemove', function(e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        if (label.classList.contains('show')) {
          label.style.left = e.clientX + 'px';
          label.style.top = e.clientY + 'px';
        }
      });
      renderer.domElement.addEventListener('click', function() {
        if (hovered) {
          var idx = CONCEPTS.indexOf(hovered.userData.concept);
          if (idx >= 0) selectConcept(idx);
        }
      });
      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closePanel(); return; }
        if (selected && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          var curIdx = CONCEPTS.indexOf(selected);
          if (curIdx >= 0) {
            var dir = e.key === 'ArrowRight' ? 1 : -1;
            var nextIdx = (curIdx + dir + CONCEPTS.length) % CONCEPTS.length;
            selectConcept(nextIdx);
          }
        }
      });
      closeRef.current.addEventListener('click', closePanel);
      var handle = resizeRef.current;
      var dragging = false, startX = 0, startW = 0;
      handle.addEventListener('mousedown', function(e) {
        dragging = true; startX = e.clientX; startW = infoPanel.offsetWidth;
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
      });
      window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        var newW = Math.max(260, Math.min(520, startW - (e.clientX - startX)));
        infoPanel.style.width = newW + 'px';
      });
      window.addEventListener('mouseup', function() {
        if (dragging) { dragging = false; document.body.style.cursor = ''; }
      });
      window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    var rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      controls.update();
      var t = clock.getElapsedTime();
      var hit = hitTest();
      if (hit !== hovered) setHover(hit);
      if (hovered && !selected) {
        label.innerHTML = '<span style="display:inline-block;width:7px;height:7px;border-radius:2px;background:' +
          hovered.userData.concept.color + ';margin-right:6px;vertical-align:middle"></span>' +
          hovered.userData.concept.name;
        label.classList.add('show');
      } else {
        label.classList.remove('show');
      }
      if (selected && conceptAccessories[selected.id]) {
        var acc = conceptAccessories[selected.id];
        if (selected.id === 'inner_loop') acc.rotation.y = t * 0.5;
        if (selected.id === 'outer_loop') {
          var flowArcs = acc.userData.flowArcs;
          if (flowArcs) {
            var cycle = (t * SPEED) % 1;
            for (var fi = 0; fi < flowArcs.length; fi++) {
              var arc = flowArcs[fi];
              var active = cycle >= arc.phaseStart && cycle < arc.phaseEnd;
              if (arc.arcGroup) arc.arcGroup.visible = active;
              for (var pi = 0; pi < arc.pulses.length; pi++) {
                var pulse = arc.pulses[pi];
                if (active) {
                  var stagger = pulse.userData.pulseIdx * 0.07;
                  var pos = Math.max(0, Math.min(1, ((cycle - arc.phaseStart) / (arc.phaseEnd - arc.phaseStart)) - stagger));
                  pulse.position.x = arc.fromPos.x + arc.dx * pos;
                  pulse.position.z = arc.fromPos.z + arc.dz * pos;
                  pulse.position.y = arc.fromPos.y + Math.sin(pos * Math.PI) * 0.35;
                  pulse.visible = pos > 0.01 && pos < 1;
                  pulse.material.opacity = pos > 0.01 && pos < 1 ? 0.85 : 0;
                } else {
                  pulse.visible = false;
                }
              }
            }
          }
        }
        if (selected.id === 'coordination') {
          var coordArcs = acc.userData.coordinationArcs;
          var partGroups = acc.userData.partGroups;
          var devCount = acc.userData.devCount || 3;
          if (coordArcs) {
            var cycle = (t * SPEED) % 1;
            for (var fi = 0; fi < coordArcs.length; fi++) {
              var arc = coordArcs[fi];
              var active = cycle >= arc.phaseStart && cycle < arc.phaseEnd;
              if (arc.arcGroup) arc.arcGroup.visible = active;
              for (var pi = 0; pi < arc.pulses.length; pi++) {
                var pulse = arc.pulses[pi];
                if (active) {
                  var stagger = pulse.userData.pulseIdx * 0.06;
                  var pos = Math.max(0, Math.min(1, ((cycle - arc.phaseStart) / (arc.phaseEnd - arc.phaseStart)) - stagger));
                  if (arc.isVertical) {
                    pulse.position.x = arc.fromPos.x + Math.sin(pos * Math.PI) * 0.2;
                    pulse.position.z = arc.fromPos.z;
                    pulse.position.y = arc.fromPos.y + arc.dy * pos + Math.sin(pos * Math.PI) * 0.25;
                  } else {
                    pulse.position.x = arc.fromPos.x + arc.dx * pos;
                    pulse.position.z = arc.fromPos.z + arc.dz * pos;
                    pulse.position.y = arc.fromPos.y + Math.sin(pos * Math.PI) * 0.3;
                  }
                  pulse.visible = pos > 0.01 && pos < 1;
                  pulse.material.opacity = pos > 0.01 && pos < 1 ? 0.85 : 0;
                } else {
                  pulse.visible = false;
                }
              }
            }
          }
          if (partGroups) {
            for (var di = 0; di < devCount; di++) {
              var deliveryPhase = (di * 0.33 + 0.33);
              if (partGroups[di]) partGroups[di].visible = cycle > deliveryPhase;
            }
          }
        }
        if (selected.id === 'communication') {
          var ud = acc.userData;
          acc.children.forEach(function(child) {
            if (child.userData && child.userData.arcIdx !== undefined) {
              var wave = 0.2 + Math.sin(t * 1.2 + child.userData.arcIdx * 0.6) * 0.15;
              child.material.opacity = Math.max(0.05, wave);
            }
            if (child.userData && child.userData.isPulse) {
              var p = (Math.sin(t * 1.4) + 1) / 2;
              var pp = child.userData.dir === 1 ? p : (child.userData.dir === -1 ? (1 - p) : p);
              if (child.userData.dir === 0.7) pp = (p + 0.3) % 1;
              if (child.userData.dir === -0.7) pp = ((1 - p) + 0.3) % 1;
              child.position.x = ud.arcDx * pp;
              child.position.z = ud.arcDz * pp;
              child.position.y = Math.sin(pp * Math.PI) * 0.4 + 0.1;
            }
          });
        }
        if (selected.id === 'handover') {
          var phaseGroups = acc.userData.phaseGroups;
          var hPos = acc.userData.hPos, d1Pos = acc.userData.d1Pos, d2Pos = acc.userData.d2Pos, qaPos = acc.userData.qaPos;
          if (phaseGroups) {
            var cycle = (t * SPEED) % 1;
            var activePhase = 0;
            if (cycle < 0.22) activePhase = 1;
            else if (cycle < 0.44) activePhase = 2;
            else if (cycle < 0.66) activePhase = 3;
            else if (cycle < 0.88) activePhase = 4;

            var curGroup = null;
            phaseGroups.forEach(function(pg) { pg.visible = pg.userData.phase === activePhase; if (pg.userData.phase === activePhase) curGroup = pg; });

            function highlightAgents(ids) {
              conceptGroups.forEach(function(g) {
                var id = g.userData.concept.id;
                var involved = ids.indexOf(id) >= 0;
                g.children.forEach(function(child) {
                  if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
                    child.material.opacity = involved ? 1 : 0.08;
                    child.material.transparent = !involved;
                    if (involved) { child.material.emissive = new THREE.Color(child.material.color); child.material.emissiveIntensity = 0.25; }
                    else { child.material.emissive = new THREE.Color(0x000000); child.material.emissiveIntensity = 0; }
                  }
                });
                g.userData.isHighlighted = involved;
              });
            }

            /* Phase 1: Relay Race */
            if (activePhase === 1) {
              highlightAgents(['harness', 'inner_loop', 'shared_memory', 'handover']);
              var tok = curGroup.userData.relayToken;
              var path = curGroup.userData.relayPath;
              var relayArcs = curGroup.userData.relayArcs;
              if (tok && path) {
                var sub = cycle / 0.22;
                var segIdx = Math.min(3, Math.floor(sub * 4));
                var segT = ((sub * 4) - segIdx);
                var p0 = path[segIdx], p1 = path[Math.min(segIdx+1, 4)];
                tok.position.set(p0.x + (p1.x-p0.x)*segT, p0.y + (p1.y-p0.y)*segT + Math.sin(segT*Math.PI)*0.15, p0.z + (p1.z-p0.z)*segT);
                tok.material.opacity = 1; tok.scale.setScalar(1 + Math.sin(t*6)*0.2);
                if (relayArcs) relayArcs.forEach(function(ag, idx) { ag.visible = idx === segIdx; });
              }
            }

            /* Phase 2: Context Packet */
            if (activePhase === 2) {
              highlightAgents(['inner_loop', 'handover']);
              var sub = (cycle - 0.22) / 0.22;
              var pkt = curGroup.userData.packet, src = curGroup.userData.src, dst = curGroup.userData.dst, frags = curGroup.userData.fragments;
              if (pkt && src && dst) {
                pkt.position.x = src.x + (dst.x-src.x)*sub; pkt.position.z = src.z + (dst.z-src.z)*sub;
                pkt.position.y = src.y + (dst.y-src.y)*sub + Math.sin(sub*Math.PI)*0.25;
                var scale = 0.3 + sub * 2.7;
                pkt.scale.setScalar(scale); pkt.material.opacity = sub < 0.95 ? 1 : 0;
                if (frags) frags.forEach(function(f) {
                  f.material.opacity = sub > 0.85 ? 0.7 : 0;
                  f.position.set(dst.x + f.userData.ox * ((sub-0.85)/0.15), dst.y + f.userData.oy * ((sub-0.85)/0.15) + Math.sin(sub*10)*0.02, dst.z + f.userData.oz * ((sub-0.85)/0.15));
                });
              }
            }

            /* Phase 3: Routing Tree */
            if (activePhase === 3) {
              var sub = (cycle - 0.44) / 0.22;
              var branchIdx = Math.min(2, Math.floor(sub * 3));
              var branchTargets = ['inner_loop', 'shared_memory', 'handover'];
              highlightAgents(['harness', branchTargets[branchIdx]]);
              var pulses = curGroup.userData.routePulses;
              var routeArcs = curGroup.userData.routeArcs;
              if (pulses) {
                pulses.forEach(function(rp, ri) {
                  var pSub = Math.max(0, Math.min(1, (sub - ri / 3) * 3));
                  rp.position.x = hPos.x + rp.userData.dx * pSub;
                  rp.position.z = hPos.z + rp.userData.dz * pSub;
                  rp.position.y = hPos.y + rp.userData.dy * pSub + Math.sin(pSub*Math.PI) * 0.2;
                  rp.material.opacity = pSub > 0.01 && pSub < 1 ? 0.8 : 0;
                });
              }
              if (routeArcs) routeArcs.forEach(function(ag, ri) {
                var aSub = Math.max(0, Math.min(1, (sub - ri / 3) * 3));
                ag.visible = aSub > 0.01 && aSub < 1;
              });
            }

            /* Phase 4: Handshake 3-Way */
            if (activePhase === 4) {
              highlightAgents(['harness', 'inner_loop']);
              var sub = (cycle - 0.66) / 0.22;
              var pulses = curGroup.userData.handshakePulses;
              var handshakeArcs = curGroup.userData.handshakeArcs;
              if (pulses) {
                pulses.forEach(function(hp, hi) {
                  var hSub = Math.max(0, Math.min(1, (sub - hi / 3) * 3));
                  hp.position.set(
                    hp.userData.sx + hp.userData.dx * hSub,
                    hp.userData.sy + hp.userData.dy * hSub + Math.sin(hSub*Math.PI)*0.2,
                    hp.userData.sz + hp.userData.dz * hSub
                  );
                  hp.material.opacity = hSub > 0.01 && hSub < 1 ? 0.8 : 0;
                });
              }
              if (handshakeArcs) handshakeArcs.forEach(function(ag, hi) {
                var hSub = Math.max(0, Math.min(1, (sub - hi / 3) * 3));
                ag.visible = hSub > 0.01 && hSub < 1;
              });
            }
          }
        }
        if (selected.id === 'harness') {
          var phaseGroups = acc.userData.phaseGroups;
          if (phaseGroups) {
            var cycle = (t * SPEED) % 1;
            var activePhase = 0;
            if (cycle < 0.25) activePhase = 1;
            else if (cycle < 0.50) activePhase = 2;
            else if (cycle < 0.75) activePhase = 3;
            else activePhase = 4;
            var curGroup = null;
            phaseGroups.forEach(function(pg) { pg.visible = pg.userData.phase === activePhase; if (pg.userData.phase === activePhase) curGroup = pg; });

            /* Phase 1: Control Central — frame pulses, arcs shine */
            if (activePhase === 1) {
              var sub = cycle / 0.25;
              var intensity = Math.sin(sub * Math.PI * 4) * 0.5 + 0.5;
              curGroup.children.forEach(function(child) {
                if (child.material && child.material.opacity < 0.7) {
                  child.material.opacity = 0.1 + intensity * 0.15;
                }
              });
            }

            /* Phase 2: Percepción — particles flow from agents to center */
            if (activePhase === 2) {
              var periParticles = curGroup.userData.periParticles;
              if (periParticles) periParticles.forEach(function(p) {
                var ud = p.userData;
                var pos = ((t * 0.3 + ud.offset) % 1);
                p.position.x = ud.dirX * pos;
                p.position.z = ud.dirZ * pos;
                p.position.y = Math.sin(pos * Math.PI) * 0.15;
                p.material.opacity = pos < 0.95 ? 0.6 : 0;
              });
            }

            /* Phase 3: Orquestación — pulses travel to each agent sequentially */
            if (activePhase === 3) {
              var orchePulses = curGroup.userData.orchePulses;
              var orcheArcs = curGroup.userData.orcheArcs;
              var sub = (cycle - 0.50) / 0.25;
              if (orchePulses) orchePulses.forEach(function(p, i) {
                var pSub = Math.max(0, Math.min(1, (sub * orchePulses.length - i)));
                p.position.x = p.userData.dx * pSub;
                p.position.z = p.userData.dz * pSub;
                p.position.y = Math.sin(pSub * Math.PI) * 0.2;
                p.material.opacity = pSub > 0.01 && pSub < 1 ? 0.8 : 0;
              });
              if (orcheArcs) orcheArcs.forEach(function(ag, i) {
                var aSub = Math.max(0, Math.min(1, (sub * orcheArcs.length - i)));
                ag.visible = aSub > 0.01 && aSub < 1;
              });
            }

            /* Phase 4: Supervisión — bidirectional monitoring pulses */
            if (activePhase === 4) {
              var supParticles = curGroup.userData.supParticles;
              var sub = (cycle - 0.75) / 0.25;
              if (supParticles) supParticles.forEach(function(p) {
                var ud = p.userData;
                var pos = ((sub * ud.dir + 0.5 + ud.offset) % 1) * 2 - 1;
                var pp = Math.max(0, Math.min(1, Math.abs(pos)));
                var dir = pos > 0 ? 1 : -1;
                p.position.x = ud.dx * pp * dir;
                p.position.z = ud.dz * pp * dir;
                p.position.y = Math.sin(pp * Math.PI) * 0.12;
                p.material.opacity = pp < 0.95 ? 0.5 : 0;
              });
            }
          }
        }
        if (selected.id === 'shared_memory') {
          var memoryArcs = acc.userData.memoryArcs;
          var localParticles = acc.userData.localParticles;
          var vaultSections = acc.userData.vaultSections;
          var dataFragments = acc.userData.dataFragments;
          var cycle = (t * SPEED) % 1;

          /* Arc pulses */
          if (memoryArcs) {
            for (var fi = 0; fi < memoryArcs.length; fi++) {
              var arc = memoryArcs[fi];
              var active = cycle >= arc.phaseStart && cycle < arc.phaseEnd;
              if (arc.arcGroup) arc.arcGroup.visible = active;
              for (var pi = 0; pi < arc.pulses.length; pi++) {
                var pulse = arc.pulses[pi];
                if (active) {
                  var stagger = pulse.userData.pulseIdx * 0.06;
                  var pos = Math.max(0, Math.min(1, ((cycle - arc.phaseStart) / (arc.phaseEnd - arc.phaseStart)) - stagger));
                  if (arc.isVertical) {
                    pulse.position.x = arc.fromPos.x + Math.sin(pos * Math.PI) * 0.15;
                    pulse.position.z = arc.fromPos.z;
                    pulse.position.y = arc.fromPos.y + arc.dy * pos + Math.sin(pos * Math.PI) * 0.2;
                  } else {
                    pulse.position.x = arc.fromPos.x + arc.dx * pos;
                    pulse.position.z = arc.fromPos.z + arc.dz * pos;
                    pulse.position.y = arc.fromPos.y + Math.sin(pos * Math.PI) * 0.25;
                  }
                  pulse.visible = pos > 0.01 && pos < 1;
                  pulse.material.opacity = pos > 0.01 && pos < 1 ? 0.8 : 0;
                } else {
                  pulse.visible = false;
                }
              }
            }
          }

          /* Local particles — fast orbit during local phases, highlight rings */
          var isLocalPhase = (cycle < 0.12 || cycle >= 0.88);
          if (localParticles) {
            var localSpeed = isLocalPhase ? 3.0 : 0.8;
            for (var li = 0; li < localParticles.length; li++) {
              var lp = localParticles[li];
              var ud = lp.userData;
              ud.orbitAngle += 0.016 * ud.orbitSpeed * localSpeed;
              lp.position.x = ud.centerX + Math.cos(ud.orbitAngle) * ud.orbitRadius;
              lp.position.z = ud.centerZ + Math.sin(ud.orbitAngle) * ud.orbitRadius;
              lp.material.opacity = isLocalPhase ? 0.8 : 0.2;
            }
          }
          acc.children.forEach(function(child) {
            if (child.userData && child.userData.isGlowRing) {
              child.material.opacity = isLocalPhase ? 0.4 : 0.0;
              var s = isLocalPhase ? 1 + Math.sin(t * 3 + child.userData.agentIdx) * 0.3 : 1;
              child.scale.setScalar(s);
            }
          });

          /* Data fragments above pool — float up during write/read */
          if (dataFragments) {
            var writeActive = cycle >= 0.12 && cycle < 0.35;
            var readActive = cycle >= 0.65 && cycle < 0.88;
            var collectActive = writeActive || readActive;
            for (var di = 0; di < dataFragments.length; di++) {
              var df = dataFragments[di];
              var ud = df.userData;
              if (collectActive) {
                var rise = Math.sin(t * 1.2 + ud.phase) * 0.03 + 0.03;
                df.position.y = ud.baseY + rise;
                df.material.opacity = 0.6 + Math.sin(t * 2 + ud.phase) * 0.2;
              } else {
                df.position.y = ud.baseY;
                df.material.opacity = 0.0;
              }
            }
          }

          /* Vault sections — accumulate across cycles */
          if (vaultSections) {
            if (!acc.userData._vaultMax) acc.userData._vaultMax = 0;
            if (cycle > acc.userData._vaultMax) acc.userData._vaultMax = cycle;
            for (var si = 0; si < vaultSections.length; si++) {
              var threshold = (si + 1) / vaultSections.length;
              var isLit = acc.userData._vaultMax > threshold || (cycle >= 0.35 && cycle < (0.35 + (si + 1) * 0.075));
              vaultSections[si].material.color.set(isLit ? acc.userData.vaultLightColor : acc.userData.vaultBaseColor);
              vaultSections[si].material.opacity = isLit ? 0.7 : 0.15;
            }
          }

          /* Pool core pulse */
          acc.children.forEach(function(child) {
            if (child.userData && child.userData.isCore) {
              var writeActive = cycle >= 0.12 && cycle < 0.35;
              var readActive = cycle >= 0.65 && cycle < 0.88;
              var active = writeActive || readActive;
              var intensity = active ? 0.8 + Math.sin(t * 2) * 0.2 : 0.5;
              child.scale.setScalar(intensity);
              child.material.opacity = active ? 0.7 : 0.3;
            }
          });
        }
        if (selected.id === 'agents_network') {
          var phaseGroups = acc.userData.phaseGroups;
          if (phaseGroups) {
            var cycle = (t * SPEED) % 1;
            var activePhase = 0;
            if (cycle < 0.25) activePhase = 1;
            else if (cycle < 0.50) activePhase = 2;
            else if (cycle < 0.75) activePhase = 3;
            else activePhase = 4;

            var curGroup = null;
            phaseGroups.forEach(function(pg) { pg.visible = pg.userData.phase === activePhase; if (pg.userData.phase === activePhase) curGroup = pg; });

            function highlightAll(ids) {
              conceptGroups.forEach(function(g) {
                var involved = ids.indexOf(g.userData.concept.id) >= 0;
                g.children.forEach(function(child) {
                  if (child.material && !child.userData.isPulse && !child.userData.isHalo) {
                    child.material.opacity = involved ? 1 : 0.08; child.material.transparent = !involved;
                    if (involved) { child.material.emissive = new THREE.Color(child.material.color); child.material.emissiveIntensity = 0.25; }
                    else { child.material.emissive = new THREE.Color(0x000000); child.material.emissiveIntensity = 0; }
                  }
                });
              });
            }

            if (activePhase === 1) {
              highlightAll(acc.userData.agentIds);
              var sp = curGroup.userData.starPulse, cp = curGroup.userData.centerP, agents = curGroup.userData.agents;
              if (sp && cp && agents) {
                var sub = cycle / 0.25;
                var targetIdx = Math.min(agents.length - 1, 1 + Math.floor(sub * (agents.length - 2)));
                var tgt = agents[targetIdx] || agents[agents.length-1];
                var p = (sub * (agents.length - 2)) % 1;
                sp.position.set(cp.x + (tgt.x-cp.x)*p, cp.y + (tgt.y-cp.y)*p + Math.sin(p*Math.PI)*0.2, cp.z + (tgt.z-cp.z)*p);
                sp.material.opacity = 1;
              }
            }

            if (activePhase === 2) {
              highlightAll(acc.userData.agentIds);
              var pulses = curGroup.userData.meshPulses, poses = curGroup.userData.agentPoses, pairs = curGroup.userData.meshPairs;
              if (pulses && poses && pairs) {
                var sub = cycle / 0.25;
                pulses.forEach(function(mp, mpi) {
                  var idx = Math.floor((sub + mpi * 0.25) * pairs.length) % pairs.length;
                  var pair = pairs[idx];
                  if (pair) {
                    var pA = poses[pair.a], pB = poses[pair.b];
                    var pp = ((sub + mpi * 0.25) * 2) % 1;
                    mp.position.set(pA.x + (pB.x-pA.x)*pp, pA.y + (pB.y-pA.y)*pp + Math.sin(pp*Math.PI)*0.15, pA.z + (pB.z-pA.z)*pp);
                    mp.material.opacity = 0.7;
                  }
                });
              }
            }

            if (activePhase === 3) {
              highlightAll(acc.userData.agentIds);
              var pipePulse = curGroup.userData.pipePulse, pipeOrder = curGroup.userData.pipeOrder, poses = curGroup.userData.agentPoses;
              if (pipePulse && pipeOrder && poses) {
                var sub = cycle / 0.25;
                var segIdx = Math.min(pipeOrder.length - 2, Math.floor(sub * (pipeOrder.length - 1)));
                var segT = (sub * (pipeOrder.length - 1)) - segIdx;
                var pA = poses[pipeOrder[segIdx]], pB = poses[pipeOrder[segIdx + 1]];
                pipePulse.position.set(pA.x + (pB.x-pA.x)*segT, pA.y + (pB.y-pA.y)*segT + Math.sin(segT*Math.PI)*0.2, pA.z + (pB.z-pA.z)*segT);
                pipePulse.material.opacity = 1;
              }
            }

            if (activePhase === 4) {
              highlightAll(acc.userData.agentIds);
              var dynGroups = curGroup.userData.dynGroups, poses = curGroup.userData.agentPoses;
              if (dynGroups && poses) {
                var sub = (cycle - 0.75) / 0.25;
                dynGroups.forEach(function(dg) {
                  var local = ((sub + dg.phaseOffset) * 2) % 1;
                  var visible = local < 0.7;
                  dg.arcGrp.visible = visible;
                  if (visible) {
                    var pA = poses[dg.a], pB = poses[dg.b];
                    dg.pulse.position.set(pA.x + (pB.x-pA.x)*local, pA.y + (pB.y-pA.y)*local + Math.sin(local*Math.PI)*0.15, pA.z + (pB.z-pA.z)*local);
                    dg.pulse.material.opacity = 0.7;
                  } else {
                    dg.pulse.material.opacity = 0;
                  }
                });
              }
            }
          }
        }
      }
      renderer.render(scene, camera);
      if (camDebug) {
        camDebug.textContent = 'cam: ' + camera.position.x.toFixed(2) + ',' + camera.position.y.toFixed(2) + ',' + camera.position.z.toFixed(2) + '  tgt: ' + controls.target.x.toFixed(2) + ',' + controls.target.y.toFixed(2) + ',' + controls.target.z.toFixed(2);
      }
    }

    init();
    setTimeout(function() {
      if (loadingEl) loadingEl.classList.add('done');
    }, 100);

    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ['outer_loop', 'coordination', 'shared_memory', 'handover', 'agents_network'].forEach(function(key) {
        var flow = conceptAccessories && conceptAccessories[key];
        if (flow && scene) scene.remove(flow);
      });
      while (legendEl.firstChild) legendEl.removeChild(legendEl.firstChild);
    };
  }, []);

  return (
    <div className="page-mas">
      <div className="loading" ref={loadingRef}>
        <div className="loading-text">{t('mas.loading')}</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
      </div>
      <SiteNav brand="Cerebro ↔ IA" />
      <div className="title-bar">
        <h1><span>{t('mas.heading').split(' — ')[0]}</span> — {t('mas.heading').split(' — ')[1]}</h1>
        <p>{t('mas.subtitle')}</p>
      </div>
      <div className="legend" id="legend" ref={legendRef} role="list" aria-label={t('mas.legend')}>
        <div className="legend-head">{t('mas.legend')}</div>
      </div>
      <div className="hover-label" id="hover-label" ref={hoverLabelRef}></div>
      <div className="info-panel" id="info-panel" ref={infoPanelRef} role="dialog" aria-label="Detalle del concepto" aria-modal="true" aria-hidden="true">
        <div className="info-resize" id="info-resize" ref={resizeRef}></div>
        <button className="info-close" id="info-close" ref={closeRef} aria-label="Cerrar panel">×</button>
        <div id="info-content" ref={infoContentRef}></div>
      </div>
      <div className="hints">
        <span ref={camDebugRef} className="cam-debug"></span>
        <kbd>←</kbd> <kbd>→</kbd> {t('mas.hints')}
      </div>
      <div className="footer">{t('mas.footer')}</div>
    </div>
  );
}
