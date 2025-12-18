import { initNYCPointCloud } from './nyc_pointcloud.js';

console.log('[main.js] Module loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[main.js] DOMContentLoaded');
  const canvas = document.getElementById('nycCanvas');
  if (canvas) {
    console.log('[main.js] Found canvas #nycCanvas', canvas);
    try {
      initNYCPointCloud(canvas);
      console.log('[main.js] initNYCPointCloud called');
    } catch (e) {
      console.error('[main.js] initNYCPointCloud error:', e);
    }
  }
  else {
    console.warn('[main.js] Canvas #nycCanvas not found');
  }
});