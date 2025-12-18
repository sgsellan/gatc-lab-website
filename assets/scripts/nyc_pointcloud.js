// assets/scripts/nyc_pointcloud.js
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { PLYLoader } from './vendor/PLYLoader.js';

export function initNYCPointCloud(canvas) {
  console.log('[nyc_pointcloud] initNYCPointCloud start', { canvas });
  console.log('[nyc_pointcloud] Imports check', {
    THREE_present: !!THREE,
    OrbitControls_present: !!OrbitControls,
    PLYLoader_present: !!PLYLoader
  });
  console.log('[nyc_pointcloud] User agent', navigator.userAgent);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  console.log('[nyc_pointcloud] Renderer created');
  renderer.setPixelRatio(window.devicePixelRatio);
  // Transparent background to blend with page
  // No clearColor set so it uses transparent
  const gl = renderer.getContext();
  console.log('[nyc_pointcloud] WebGL context', gl ? 'OK' : 'FAILED');

  const scene = new THREE.Scene();
  console.log('[nyc_pointcloud] Scene created');

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  // Angled, closer initial view (approx 45°)
  camera.position.set(1.5, 1.5, 1.5);
  camera.lookAt(0, 0, 0);
  console.log('[nyc_pointcloud] Camera positioned', camera.position);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // Auto-rotate for a bird's-eye motion until user interacts
  controls.autoRotate = true;
  controls.autoRotateSpeed = 3.0; // faster spin
  controls.minDistance = 0.3;
  controls.maxDistance = 4;
  controls.addEventListener('start', () => {
    // Stop auto-rotation on first user interaction
    controls.autoRotate = false;
  });
  console.log('[nyc_pointcloud] Controls initialized');

  const loader = new PLYLoader();
  console.log('[nyc_pointcloud] Loading PLY: assets/models/columbia.ply');
  loader.load('/assets/models/columbia.ply', (geometry) => {
    console.log('[nyc_pointcloud] PLY loaded');
    geometry.computeBoundingBox();

    const box = geometry.boundingBox;
    const center = new THREE.Vector3();
    box.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.0 / maxDim;
    geometry.scale(scale, scale, scale);

    const DPR = window.devicePixelRatio || 1;
    const material = new THREE.PointsMaterial({
      // Smaller points for better definition; normalize by DPR
      size: 0.02 / DPR,
      sizeAttenuation: true,
      // Force uniform lab accent color
      vertexColors: false,
    //   color: 0xab2673
      color: 0xB9D9EB
    });

    const points = new THREE.Points(geometry, material);
    // Reorient: convert Z-up -> Y-up (rotate -90° about X)
    points.rotation.x = -Math.PI * 0.5;
    scene.add(points);
    console.log('[nyc_pointcloud] Points added to scene', { count: geometry.attributes.position.count });
  }, (xhr) => {
    const total = xhr.total || 0;
    const loaded = xhr.loaded || 0;
    console.log('[nyc_pointcloud] Loading progress', { loaded, total });
  }, (error) => {
    console.error('[nyc_pointcloud] PLY load error', error);
  });

  // Axes helper removed for production

  function resize() {
    const parent = canvas.parentElement;
    let w = parent.clientWidth;
    let h = parent.clientHeight || canvas.clientHeight || 300;
    if (!w || w <= 0) w = 500; // debug fallback
    if (!h || h <= 0) h = 420; // debug fallback
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    console.log('[nyc_pointcloud] resize', { w, h, canvasCss: { w: canvas.clientWidth, h: canvas.clientHeight }, canvasBuf: { w: canvas.width, h: canvas.height } });
  }

  window.addEventListener('resize', resize);
  resize();
  // Force an immediate render for sanity before the loop
  try {
    renderer.render(scene, camera);
    console.log('[nyc_pointcloud] Immediate render done');
  } catch (e) {
    console.error('[nyc_pointcloud] Immediate render error', e);
  }

  let frame = 0;
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    frame++;
  }
  console.log('[nyc_pointcloud] Starting animation loop');
  if (renderer.setAnimationLoop) {
    renderer.setAnimationLoop(animate);
  } else {
    function rafLoop() {
      requestAnimationFrame(rafLoop);
      animate();
    }
    rafLoop();
  }
}