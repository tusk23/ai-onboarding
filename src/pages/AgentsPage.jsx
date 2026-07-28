import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SiteNav from '../components/SiteNav.jsx';
import './agents.css';

export default function AgentsPage() {
  const containerRef = useRef(null);
  const loadingRef = useRef(null);
  const hoverLabelRef = useRef(null);
  const infoPanelRef = useRef(null);
  const panelTitleRef = useRef(null);
  const panelContentRef = useRef(null);
  const closePanelRef = useRef(null);
  const legendRef = useRef(null);
  const resizeHandleRef = useRef(null);

  useEffect(() => {
    document.title = 'Agentes Autónomos — Cerebro ↔ IA';

    const container = containerRef.current;
    const loadingEl = loadingRef.current;
    const label = hoverLabelRef.current;
    const infoPanel = infoPanelRef.current;
    const panelTitle = panelTitleRef.current;
    const panelContent = panelContentRef.current;

    var scene, camera, renderer, controls, raycaster, mouse;
    var robotGroup, conceptGroups = {}, conceptObjects = {};
    var cycleGroup;
    var particles = [], platformMesh;
    var activeConcept = null;
    var clock = new THREE.Clock();

    var DARK = 0x2a3040, MID = 0x384050, PANEL = 0x455060, HIGHLIGHT = 0x505870, SILVER = 0x8898aa, DSILVER = 0x6a7a90;

    var ROBOT_CONCEPTS = {
      percepcion: { color: 0x4FC3F7, label: 'Percepción', css: '#4FC3F7',
        analogy: 'Los sensores del agente — cómo recibe información del mundo exterior. En un LLM: el prompt, el historial de conversación, los datos de las herramientas.',
        rules: ['Los sensores determinan qué tan bien el agente entiende su entorno', 'La percepción debe ser multi-modal: texto, imágenes, estructuras de datos', 'Un agente sin percepción actualizada toma decisiones obsoletas', 'El contexto window es el "campo de visión" del agente'],
        theory: 'En la arquitectura de un agente, la percepción es la capa de entrada que filtra y estructura la información cruda del mundo. Incluye parsing de prompts, procesamiento de herramientas y mantenimiento del contexto.',
        insight: 'La calidad de la percepción define el techo de inteligencia del agente.'
      },
      razonamiento: { color: 0x9B59B6, label: 'Razonamiento', css: '#9B59B6',
        analogy: 'El cerebro del agente — donde transforma percepción en decisión. Chain-of-Thought, Tree-of-Thought, planificación jerárquica.',
        rules: ['Chain-of-Thought descompleja problemas en pasos manejables', 'El razonamiento debe ser verificable: cada paso debe justificarse', 'Memorizar patrones no es razonar — comprender sí', 'La planificación jerárquica supera la lineal en problemas complejos'],
        theory: 'El razonamiento en LLMs evolucionó de simple completion a cadenas de pensamiento estructuradas. Los agentes modernos combinan CoT, ToT y reflection para construir razonamientos robustos.',
        insight: 'Pensar no es solo generar tokens — es reducir la entropía de las opciones.'
      },
      memoria: { color: 0xE91E63, label: 'Memoria', css: '#E91E63',
        analogy: 'El almacén del agente — lo que recuerda entre sesiones, entre herramientas, entre decisiones.',
        rules: ['La memoria a corto plazo se pierde entre conversaciones', 'RAG es buscar en los propios recuerdos del agente', 'La memoria episódica es más útil que la semántica pura', 'Un agente sin memoria repite los mismos errores'],
        theory: 'Tres capas: Working Memory (contexto activo), Episodic Memory (experiencias pasadas) y Semantic Memory (conocimiento general). El diseño de la arquitectura de memoria determina la sofisticación del agente.',
        insight: 'La memoria transforma un prompt en una relación continua.'
      },
      accion: { color: 0x2ECC71, label: 'Acción', css: '#2ECC71',
        analogy: 'Los efectores del agente — cómo transforma decisiones en cambios reales en el mundo. Tool calls, API writes, código generado.',
        rules: ['La acción debe ser observable y reversible cuando sea posible', 'Cada acción tiene un costo computacional y potencialmente real', 'La mejor acción es la más simple que logra la meta', 'El feedback post-acción alimenta la memoria del agente'],
        theory: 'El ciclo percepción-razonamiento-acción es el heartbeat de todo agente. Cada iteración produce un paso concreto que modifica el estado del mundo o del propio agente.',
        insight: 'Un agente que solo razona sin actuar es un filósofo sin clientes.'
      },
      herramientas: { color: 0xF1C40F, label: 'Herramientas', css: '#F1C40F',
        analogy: 'Las herramientas externas que el agente puede invocar — extensiones de sus capacidades naturales. MCP, APIs, bases de datos, navegadores.',
        rules: ['Las herramientas amplían el espacio de acciones posible', 'Elegir la herramienta correcta es tan importante como usarla bien', 'Las herramientas deben ser descritas claramente para que el agente las entienda', 'MCP estandariza la interfaz entre agentes y herramientas'],
        theory: 'Model Context Protocol es el estándar emergente para conectar agentes con herramientas. Define una capa de abstracción que permite interoperabilidad entre diferentes agentes y proveedores.',
        insight: 'Las herramientas no reemplazan al razonamiento — lo amplifican.'
      }
    };

    function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c0f16);
      scene.fog = new THREE.FogExp2(0x0c0f16, 0.04);

      camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(2.8, 2.0, 4.5);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.target.set(0, 1.2, -0.2);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 4;
      controls.maxDistance = 20;
      controls.maxPolarAngle = Math.PI * 0.55;

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2(-999, -999);

      scene.add(new THREE.HemisphereLight(0xddeeff, 0x334466, 0.55));
      var key = new THREE.DirectionalLight(0xfff4e8, 1.5); key.position.set(5, 9, 6); scene.add(key);
      var fill = new THREE.DirectionalLight(0x8899cc, 0.35); fill.position.set(-6, 3, -4); scene.add(fill);
      var rim = new THREE.DirectionalLight(0xffeedd, 0.25); rim.position.set(0, 5, -7); scene.add(rim);
      var under = new THREE.PointLight(0x4466aa, 0.3, 10); under.position.set(0, -3, 0); scene.add(under);

      var grid = new THREE.GridHelper(40, 40, 0x1a2238, 0x141c2c);
      grid.material.opacity = 0.3; grid.material.transparent = true; scene.add(grid);

      buildPlatform();
      buildRobot();
      buildAgentCycle();
      buildHolograms();
      buildParticles();

      window.addEventListener('resize', onResize);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onClick);

      function onKeyDown(e) { if (e.key === 'Escape') closePanel(); }
      document.addEventListener('keydown', onKeyDown);
      closePanelRef.current.addEventListener('click', closePanel);

      var legendItems = legendRef.current.querySelectorAll('.item');
      legendItems.forEach(function (el) {
        el.addEventListener('click', function () { selectConcept(el.dataset.concept); });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectConcept(el.dataset.concept); }
        });
      });

      var loadTimeout = setTimeout(function () { loadingEl.classList.add('done'); }, 400);

      animate();

      return { onKeyDown, loadTimeout };
    }

    function addBlock(group, concept, x, y, z, w, h, d, color) {
      var geo = new THREE.BoxGeometry(w, h, d);
      var mat = new THREE.MeshLambertMaterial({ color: color, flatShading: true, transparent: true, opacity: 1 });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData.concept = concept;
      group.add(mesh);
      return mesh;
    }

    function buildPlatform() {
      var g = new THREE.Group();
      var base = new THREE.CylinderGeometry(2.0, 2.0, 0.06, 32);
      var m = new THREE.MeshLambertMaterial({ color: 0x1a2540, flatShading: true, transparent: true, opacity: 0.85 });
      platformMesh = new THREE.Mesh(base, m); g.add(platformMesh);
      var ring = new THREE.RingGeometry(1.85, 2.05, 48);
      var rm = new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      var ringMesh = new THREE.Mesh(ring, rm); ringMesh.rotation.x = -Math.PI / 2; ringMesh.position.y = 0.04; g.add(ringMesh);
      var ring2 = new THREE.RingGeometry(1.3, 1.35, 48);
      var rm2 = new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
      var ring2Mesh = new THREE.Mesh(ring2, rm2); ring2Mesh.rotation.x = -Math.PI / 2; ring2Mesh.position.y = 0.05; g.add(ring2Mesh);
      g.position.y = 0.03;
      scene.add(g);
    }

    function buildRobot() {
      robotGroup = new THREE.Group();
      ['percepcion', 'razonamiento', 'memoria', 'accion', 'herramientas'].forEach(function (k) {
        conceptGroups[k] = new THREE.Group();
        conceptGroups[k].userData.concept = k;
        robotGroup.add(conceptGroups[k]);
      });

      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.10, 0, 1.4, 0.75, 0.9, 0x9B59B6);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.53, 0, 1.35, 0.12, 0.85, 0x7d4a90);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.10, -0.44, 1.2, 0.55, 0.04, PANEL);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.10, 0.44, 1.3, 0.65, 0.04, PANEL);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.27, -0.46, 1.1, 0.035, 0.02, HIGHLIGHT);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.10, -0.46, 0.035, 0.5, 0.02, HIGHLIGHT);
      addBlock(conceptGroups.razonamiento, 'razonamiento', -0.35, 1.00, -0.46, 0.4, 0.25, 0.02, MID);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0.35, 1.00, -0.46, 0.4, 0.25, 0.02, MID);
      addBlock(conceptGroups.razonamiento, 'razonamiento', -0.25, 1.37, -0.46, 0.3, 0.025, 0.02, DARK);
      addBlock(conceptGroups.razonamiento, 'razonamiento', -0.25, 1.32, -0.46, 0.3, 0.025, 0.02, DARK);
      addBlock(conceptGroups.razonamiento, 'razonamiento', -0.25, 1.27, -0.46, 0.3, 0.025, 0.02, DARK);
      conceptObjects.ledL = addBlock(conceptGroups.razonamiento, 'razonamiento', 0.35, 1.37, -0.46, 0.07, 0.07, 0.03, 0x2ECC71);
      conceptObjects.ledR = addBlock(conceptGroups.razonamiento, 'razonamiento', 0.35, 1.25, -0.46, 0.07, 0.07, 0.03, 0xF1C40F);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 0.69, 0, 1.35, 0.1, 0.85, DARK);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.65, 0, 0.3, 0.15, 0.3, DARK);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.73, 0, 0.22, 0.1, 0.22, MID);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 1.97, 0, 0.8, 0.25, 0.55, 0x9B59B6);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 2.17, 0, 0.12, 0.2, 0.12, DARK);
      addBlock(conceptGroups.razonamiento, 'razonamiento', 0, 2.33, 0, 0.18, 0.12, 0.18, MID);

      addBlock(conceptGroups.percepcion, 'percepcion', -0.28, 2.60, 0, 0.44, 0.38, 0.45, 0x3a4565);
      addBlock(conceptGroups.percepcion, 'percepcion', -0.28, 2.60, -0.22, 0.48, 0.42, 0.04, MID);
      conceptObjects.eyeL = addBlock(conceptGroups.percepcion, 'percepcion', -0.28, 2.60, -0.24, 0.36, 0.30, 0.06, 0x4FC3F7);
      conceptObjects.pupilL = addBlock(conceptGroups.percepcion, 'percepcion', -0.28, 2.60, -0.28, 0.14, 0.12, 0.04, 0x81D4FA);
      addBlock(conceptGroups.percepcion, 'percepcion', -0.28, 2.81, -0.20, 0.42, 0.03, 0.03, SILVER);
      addBlock(conceptGroups.percepcion, 'percepcion', 0.28, 2.60, 0, 0.44, 0.38, 0.45, 0x3a4565);
      addBlock(conceptGroups.percepcion, 'percepcion', 0.28, 2.60, -0.22, 0.48, 0.42, 0.04, MID);
      conceptObjects.eyeR = addBlock(conceptGroups.percepcion, 'percepcion', 0.28, 2.60, -0.24, 0.36, 0.30, 0.06, 0x4FC3F7);
      conceptObjects.pupilR = addBlock(conceptGroups.percepcion, 'percepcion', 0.28, 2.60, -0.28, 0.14, 0.12, 0.04, 0x81D4FA);
      addBlock(conceptGroups.percepcion, 'percepcion', 0.28, 2.81, -0.20, 0.42, 0.03, 0.03, SILVER);
      addBlock(conceptGroups.percepcion, 'percepcion', 0, 2.60, 0, 0.12, 0.2, 0.35, DARK);
      addBlock(conceptGroups.percepcion, 'percepcion', -0.15, 2.87, 0, 0.05, 0.18, 0.05, DARK);
      addBlock(conceptGroups.percepcion, 'percepcion', -0.15, 3.00, 0, 0.04, 0.1, 0.04, MID);
      conceptObjects.antennaLed = addBlock(conceptGroups.percepcion, 'percepcion', -0.15, 3.10, 0, 0.09, 0.06, 0.09, 0x4FC3F7);
      addBlock(conceptGroups.percepcion, 'percepcion', 0.12, 2.83, 0.05, 0.04, 0.12, 0.04, DARK);
      addBlock(conceptGroups.percepcion, 'percepcion', 0.12, 2.93, 0.05, 0.07, 0.04, 0.07, SILVER);

      addBlock(conceptGroups.memoria, 'memoria', 0, 1.97, 0, 0.5, 0.18, 0.4, 0xE91E63);
      addBlock(conceptGroups.memoria, 'memoria', -0.14, 1.91, 0.12, 0.16, 0.1, 0.1, 0xC2185B);
      addBlock(conceptGroups.memoria, 'memoria', 0.14, 2.03, -0.08, 0.16, 0.1, 0.1, 0xC2185B);
      addBlock(conceptGroups.memoria, 'memoria', 0, 2.05, 0.15, 0.12, 0.08, 0.08, 0xAD1457);

      addBlock(conceptGroups.accion, 'accion', -0.72, 0.32, 0, 0.52, 0.55, 1.1, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.32, -0.52, 0.56, 0.45, 0.2, 0x1FA85A);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.32, 0.52, 0.56, 0.45, 0.2, 0x1FA85A);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.62, 0, 0.54, 0.08, 1.0, DSILVER);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.08, 0, 0.54, 0.08, 1.0, DSILVER);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.32, -0.35, 0.2, 0.2, 0.2, DARK);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.32, 0, 0.2, 0.2, 0.2, DARK);
      addBlock(conceptGroups.accion, 'accion', -0.72, 0.32, 0.35, 0.2, 0.2, 0.2, DARK);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.32, 0, 0.52, 0.55, 1.1, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.32, -0.52, 0.56, 0.45, 0.2, 0x1FA85A);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.32, 0.52, 0.56, 0.45, 0.2, 0x1FA85A);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.62, 0, 0.54, 0.08, 1.0, DSILVER);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.08, 0, 0.54, 0.08, 1.0, DSILVER);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.32, -0.35, 0.2, 0.2, 0.2, DARK);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.32, 0, 0.2, 0.2, 0.2, DARK);
      addBlock(conceptGroups.accion, 'accion', 0.72, 0.32, 0.35, 0.2, 0.2, 0.2, DARK);
      addBlock(conceptGroups.accion, 'accion', 0, 0.32, 0, 0.5, 0.2, 0.35, DARK);
      addBlock(conceptGroups.accion, 'accion', 0, 0.68, 0, 0.38, 0.15, 0.32, DARK);
      addBlock(conceptGroups.accion, 'accion', -0.35, 0.55, 0, 0.15, 0.12, 0.28, MID);
      addBlock(conceptGroups.accion, 'accion', 0.35, 0.55, 0, 0.15, 0.12, 0.28, MID);
      addBlock(conceptGroups.accion, 'accion', 0, 0.60, -0.22, 0.3, 0.1, 0.12, MID);

      addBlock(conceptGroups.accion, 'accion', -0.84, 1.28, 0, 0.24, 0.22, 0.22, MID);
      addBlock(conceptGroups.accion, 'accion', -0.88, 1.06, 0, 0.16, 0.30, 0.16, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', -0.88, 0.88, 0, 0.18, 0.14, 0.18, MID);
      addBlock(conceptGroups.accion, 'accion', -0.88, 0.88, -0.16, 0.14, 0.12, 0.20, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', -0.88, 0.88, -0.34, 0.16, 0.14, 0.10, 0x1FA85A);
      addBlock(conceptGroups.accion, 'accion', -0.88, 0.96, -0.42, 0.08, 0.08, 0.16, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', -0.88, 0.80, -0.42, 0.08, 0.08, 0.16, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', -0.88, 0.88, -0.42, 0.04, 0.04, 0.08, DARK);

      addBlock(conceptGroups.accion, 'accion', 0.84, 1.28, 0, 0.24, 0.22, 0.22, MID);
      addBlock(conceptGroups.accion, 'accion', 0.88, 1.06, 0, 0.16, 0.30, 0.16, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', 0.88, 0.88, 0, 0.18, 0.14, 0.18, MID);
      addBlock(conceptGroups.accion, 'accion', 0.88, 0.88, -0.16, 0.14, 0.12, 0.20, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', 0.88, 0.88, -0.34, 0.16, 0.14, 0.10, 0x1FA85A);
      addBlock(conceptGroups.accion, 'accion', 0.88, 0.96, -0.42, 0.08, 0.08, 0.16, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', 0.88, 0.80, -0.42, 0.08, 0.08, 0.16, 0x2ECC71);
      addBlock(conceptGroups.accion, 'accion', 0.88, 0.88, -0.42, 0.04, 0.04, 0.08, DARK);

      addBlock(conceptGroups.herramientas, 'herramientas', -0.88, 0.88, -0.50, 0.08, 0.10, 0.16, 0xF1C40F);
      addBlock(conceptGroups.herramientas, 'herramientas', -0.88, 0.88, -0.64, 0.06, 0.06, 0.06, 0xD4A900);
      addBlock(conceptGroups.herramientas, 'herramientas', -0.88, 0.88, -0.74, 0.04, 0.04, 0.18, SILVER);
      addBlock(conceptGroups.herramientas, 'herramientas', -0.88, 0.88, -0.88, 0.06, 0.02, 0.06, DSILVER);

      addBlock(conceptGroups.herramientas, 'herramientas', 0.88, 0.88, -0.50, 0.08, 0.10, 0.16, 0xF1C40F);
      addBlock(conceptGroups.herramientas, 'herramientas', 0.88, 0.88, -0.64, 0.06, 0.06, 0.06, 0xD4A900);
      addBlock(conceptGroups.herramientas, 'herramientas', 0.88, 0.88, -0.74, 0.04, 0.04, 0.14, SILVER);
      addBlock(conceptGroups.herramientas, 'herramientas', 0.84, 0.88, -0.84, 0.04, 0.10, 0.04, DSILVER);
      addBlock(conceptGroups.herramientas, 'herramientas', 0.92, 0.88, -0.84, 0.04, 0.10, 0.04, DSILVER);

      robotGroup.position.y = 0;
      scene.add(robotGroup);
    }

    function buildAgentCycle() {
      cycleGroup = new THREE.Group();
      cycleGroup.visible = true;

      var ringRadius = 1.8;
      var ringY = 4.5;
      var steps = [
        { label: 'Think', color: 0x9B59B6, angle: 0 },
        { label: 'Act', color: 0x2ECC71, angle: Math.PI * 2 / 3 },
        { label: 'Observe', color: 0x4FC3F7, angle: Math.PI * 4 / 3 }
      ];

      steps.forEach(function (s) {
        var x = Math.cos(s.angle) * ringRadius;
        var z = Math.sin(s.angle) * ringRadius;
        addBlock(cycleGroup, 'cycle', x, ringY, z, 0.4, 0.25, 0.35, s.color);
        addBlock(cycleGroup, 'cycle', x, ringY + 0.2, z, 0.35, 0.06, 0.3, 0x1a1e2a);
      });

      var ringGeo = new THREE.TorusGeometry(ringRadius, 0.025, 8, 48);
      var ringMat = new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.25 });
      var ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2; ring.position.y = ringY;
      cycleGroup.add(ring);

      var arrowGeo = new THREE.ConeGeometry(0.08, 0.2, 6);
      for (var i = 0; i < 3; i++) {
        var a = i * Math.PI * 2 / 3 + Math.PI / 3;
        var arrow = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.4 }));
        arrow.position.set(Math.cos(a) * ringRadius, ringY, Math.sin(a) * ringRadius);
        arrow.rotation.z = -a + Math.PI / 2;
        cycleGroup.add(arrow);
      }

      scene.add(cycleGroup);
    }

    function buildHolograms() {
      var holoData = [
        { pos: [-2.8, 3.0, 1.2], rot: [0, 0.35, 0.03], w: 1.2, h: 0.7, color: 0x4FC3F7 },
        { pos: [2.5, 3.5, -0.8], rot: [0, -0.25, 0], w: 1.0, h: 0.65, color: 0x9B59B6 },
        { pos: [0.8, 4.2, -2.2], rot: [0.1, 0.1, 0], w: 0.9, h: 0.6, color: 0x2ECC71 }
      ];
      holoData.forEach(function (hd) {
        var g = new THREE.Group();
        var frame = new THREE.BoxGeometry(hd.w, hd.h, 0.03);
        var fm = new THREE.MeshLambertMaterial({ color: 0x1a1e2a, flatShading: true, transparent: true, opacity: 0.7 });
        g.add(new THREE.Mesh(frame, fm));
        var glow = new THREE.BoxGeometry(hd.w * 0.96, hd.h * 0.92, 0.015);
        var gm = new THREE.MeshBasicMaterial({ color: hd.color, transparent: true, opacity: 0.06 });
        var gMesh = new THREE.Mesh(glow, gm); gMesh.position.z = 0.02; g.add(gMesh);
        var lineCount = Math.floor(hd.h / 0.14);
        for (var i = 0; i < lineCount; i++) {
          var lw = 0.15 + Math.random() * 0.55;
          var lg = new THREE.BoxGeometry(lw * hd.w, 0.025, 0.008);
          var lm = new THREE.MeshBasicMaterial({ color: hd.color, transparent: true, opacity: 0.12 + Math.random() * 0.18 });
          var lMesh = new THREE.Mesh(lg, lm);
          lMesh.position.set(-hd.w * 0.3 + Math.random() * hd.w * 0.2, -hd.h * 0.35 + i * (hd.h / lineCount), 0.025);
          g.add(lMesh);
        }
        g.position.set(hd.pos[0], hd.pos[1], hd.pos[2]);
        g.rotation.set(hd.rot[0], hd.rot[1], hd.rot[2]);
        g.userData.baseY = hd.pos[1];
        g.userData.phase = Math.random() * Math.PI * 2;
        g.userData.isHologram = true;
        particles.push(g);
        scene.add(g);
      });
    }

    function buildParticles() {
      for (var i = 0; i < 20; i++) {
        var s = 0.04 + Math.random() * 0.08;
        var pg = new THREE.BoxGeometry(s, s, s);
        var colors = [0x4FC3F7, 0x9B59B6, 0x2ECC71, 0xF1C40F, 0xFF8C42, 0xE91E63];
        var pm = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.15 + Math.random() * 0.2 });
        var p = new THREE.Mesh(pg, pm);
        var angle = Math.random() * Math.PI * 2;
        var radius = 2.5 + Math.random() * 4;
        p.position.set(Math.cos(angle) * radius, 0.5 + Math.random() * 5, Math.sin(angle) * radius);
        p.userData.speed = 0.08 + Math.random() * 0.2;
        p.userData.angle = angle;
        p.userData.radius = radius;
        p.userData.baseY = p.position.y;
        p.userData.rotSpeed = (Math.random() - 0.5) * 2;
        p.userData.isHologram = false;
        particles.push(p);
        scene.add(p);
      }
    }

    var rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      controls.update();

      particles.forEach(function (p) {
        if (p.userData.isHologram) {
          p.position.y = p.userData.baseY + Math.sin(t * 0.5 + p.userData.phase) * 0.12;
        } else {
          p.userData.angle += p.userData.speed * 0.008;
          p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
          p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
          p.position.y = p.userData.baseY + Math.sin(t * 0.4 + p.userData.angle) * 0.25;
          p.rotation.x += p.userData.rotSpeed * 0.015;
          p.rotation.y += p.userData.rotSpeed * 0.012;
        }
      });

      if (conceptObjects.antennaLed) conceptObjects.antennaLed.material.opacity = 0.5 + Math.sin(t * 3) * 0.5;
      if (conceptObjects.eyeL) { var ep = 0.6 + Math.sin(t * 2) * 0.4; conceptObjects.eyeL.material.opacity = ep; conceptObjects.eyeR.material.opacity = ep; }
      if (conceptObjects.pupilL) { conceptObjects.pupilL.material.opacity = 0.5 + Math.sin(t * 2.5) * 0.5; conceptObjects.pupilR.material.opacity = 0.5 + Math.sin(t * 2.5) * 0.5; }
      if (conceptObjects.ledL) { conceptObjects.ledL.material.opacity = 0.5 + Math.sin(t * 1.5) * 0.5; conceptObjects.ledR.material.opacity = 0.5 + Math.sin(t * 1.5 + 1) * 0.5; }
      if (platformMesh && platformMesh.parent && platformMesh.parent.children[1]) platformMesh.parent.children[1].material.opacity = 0.12 + Math.sin(t * 1.2) * 0.08;

      if (cycleGroup && cycleGroup.visible) cycleGroup.rotation.y += 0.003;

      renderer.render(scene, camera);
    }

    function onResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

    function onMouseMove(e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      label.style.left = (e.clientX + 14) + 'px';
      label.style.top = (e.clientY - 10) + 'px';
    }

    function conceptFromObject(obj) {
      while (obj) {
        if (obj.userData && obj.userData.concept) {
          if (ROBOT_CONCEPTS[obj.userData.concept] || obj.userData.concept === 'cycle')
            return obj.userData.concept;
        }
        obj = obj.parent;
      }
      return null;
    }

    function getHoveredConcept() {
      raycaster.setFromCamera(mouse, camera);
      var allMeshes = [];
      robotGroup.traverse(function (child) { if (child.isMesh) allMeshes.push(child); });
      var hits = raycaster.intersectObjects(allMeshes, false);
      if (hits.length > 0) {
        var c = conceptFromObject(hits[0].object);
        if (c && c !== 'cycle') return c;
      }
      return null;
    }

    function highlightConcept(concept) {
      robotGroup.traverse(function (child) {
        if (child.isMesh && child.material) {
          if (concept === null || concept === undefined) {
            child.material.opacity = 1;
          } else {
            var c = conceptFromObject(child);
            if (c === concept) {
              child.material.opacity = 1;
            } else {
              child.material.opacity = 0.15;
            }
          }
        }
      });
    }

    function selectConcept(id) {
      activeConcept = id;
      highlightConcept(id);
      updateLegend(id);
      openPanel(id);
    }

    function updateLegend(concept) {
      legendRef.current.querySelectorAll('.item').forEach(function (el) {
        el.classList.toggle('active', el.dataset.concept === concept);
      });
    }

    function openPanel(concept) {
      var data = ROBOT_CONCEPTS[concept];
      if (!data) return;

      panelTitle.innerHTML = '<span class="dot" style="background:' + data.css + '"></span>' + data.label;

      var html = '<div class="section"><div class="section-title">Analogía</div><div class="analogy">' + data.analogy + '</div></div>';

      html += '<div class="section"><div class="section-title">Reglas para agentes</div>';
      data.rules.forEach(function (r, i) {
        html += '<div class="rule"><span class="num">' + (i + 1) + '</span><span>' + r + '</span></div>';
      });
      html += '</div>';

      html += '<div class="section"><div class="section-title">Teoría</div>';
      html += '<div class="theory-box">' + data.theory + '</div>';
      html += '<div class="insight-box">' + data.insight + '</div></div>';

      panelContent.innerHTML = html;
      infoPanel.scrollTop = 0;
      infoPanel.classList.add('open');
      infoPanel.setAttribute('aria-hidden', 'false');
      label.classList.remove('visible');
    }

    function closePanel() {
      infoPanel.classList.remove('open');
      infoPanel.setAttribute('aria-hidden', 'true');
      activeConcept = null;
      highlightConcept(null);
      updateLegend(null);
    }

    function onClick(e) {
      if (e.target.closest && e.target.closest('#infoPanel')) return;
      if (e.target.closest && e.target.closest('#legend')) return;
      if (e.target.closest && e.target.closest('.nav')) return;

      var rect = renderer.domElement.getBoundingClientRect();
      var clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);

      var allMeshes = [];
      robotGroup.traverse(function (child) { if (child.isMesh) allMeshes.push(child); });

      var hits = raycaster.intersectObjects(allMeshes, false);
      if (hits.length > 0) {
        var c = conceptFromObject(hits[0].object);
        if (c && c !== 'cycle') {
          selectConcept(c);
          return;
        }
      }
    }

    var dragging = false, resizeStartX = 0, resizeStartWidth = 0;
    function onResizeMouseDown(e) {
      dragging = true; resizeStartX = e.clientX; resizeStartWidth = infoPanel.offsetWidth;
      document.body.style.cursor = 'col-resize'; e.preventDefault();
    }
    function onResizeMouseMove(e) {
      if (!dragging) return;
      var nw = resizeStartWidth - (e.clientX - resizeStartX);
      nw = Math.max(260, Math.min(520, nw));
      infoPanel.style.width = nw + 'px';
    }
    function onResizeMouseUp() { if (dragging) { dragging = false; document.body.style.cursor = ''; } }
    var handle = resizeHandleRef.current;
    handle.addEventListener('mousedown', onResizeMouseDown);
    document.addEventListener('mousemove', onResizeMouseMove);
    document.addEventListener('mouseup', onResizeMouseUp);

    var initResult = init();

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(initResult.loadTimeout);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      document.removeEventListener('keydown', initResult.onKeyDown);
      if (closePanelRef.current) {
        closePanelRef.current.removeEventListener('click', closePanel);
      }
      var legendItems = legendRef.current.querySelectorAll('.item');
      legendItems.forEach(function (el) { el.replaceWith(el.cloneNode(true)); });
      if (handle) {
        handle.removeEventListener('mousedown', onResizeMouseDown);
      }
      document.removeEventListener('mousemove', onResizeMouseMove);
      document.removeEventListener('mouseup', onResizeMouseUp);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="page-agents">
      <div id="scene-container" ref={containerRef}></div>
      <div className="loading" ref={loadingRef}>
        <div className="loading-text">Generando agente…</div>
        <div className="loading-bar"><div className="loading-fill"></div></div>
      </div>

      <a href="#main" className="skip-nav">Saltar al contenido</a>

      <SiteNav brand="Cerebro ↔ IA" />

      <main id="main">
        <div id="hero">
          <h1><span>Agentes IA</span> — El ciclo autónomo</h1>
          <div className="subtitle" id="heroSubtitle">Percepción → Razonamiento → Decisión → Acción</div>
        </div>

        <div id="legend" ref={legendRef} role="list" aria-label="Conceptos">
          <div className="section-label">Ciclo del Agente</div>
          <div className="item" data-concept="percepcion" role="listitem" tabIndex={0}><div className="dot" style={{ background: '#4FC3F7' }}></div><div className="label">Percepción</div></div>
          <div className="item" data-concept="razonamiento" role="listitem" tabIndex={0}><div className="dot" style={{ background: '#9B59B6' }}></div><div className="label">Razonamiento</div></div>
          <div className="item" data-concept="memoria" role="listitem" tabIndex={0}><div className="dot" style={{ background: '#E91E63' }}></div><div className="label">Memoria</div></div>
          <div className="item" data-concept="accion" role="listitem" tabIndex={0}><div className="dot" style={{ background: '#2ECC71' }}></div><div className="label">Acción</div></div>
          <div className="item" data-concept="herramientas" role="listitem" tabIndex={0}><div className="dot" style={{ background: '#F1C40F' }}></div><div className="label">Herramientas</div></div>
          <div className="divider"></div>
        </div>

        <div id="infoPanel" ref={infoPanelRef} role="dialog" aria-label="Detalle del concepto" aria-modal="true" aria-hidden="true">
          <div className="resize-handle" ref={resizeHandleRef}></div>
          <div className="panel-header">
            <button className="close-btn" ref={closePanelRef} aria-label="Cerrar panel">&times;</button>
            <div className="concept-title" id="panelTitle" ref={panelTitleRef} role="heading" aria-level="2"></div>
          </div>
          <div id="panelContent" ref={panelContentRef}></div>
        </div>

        <div id="hoverLabel" ref={hoverLabelRef} aria-hidden="true"></div>
        <div id="footer">IA Visual</div>
      </main>
    </div>
  );
}
