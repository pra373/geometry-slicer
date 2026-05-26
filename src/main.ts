import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ModelLoader } from './loader';
import { CutManager } from './cutManager';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(2, 2, 3);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const grid = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
grid.position.y = -0.5;
scene.add(grid);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(5, 10, 7);
scene.add(dir);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x4f9eff, roughness: 0.4, metalness: 0.1 }),
);
cube.position.y = 0.5;
scene.add(cube);

let currentModel: THREE.Object3D = cube;

const modelLoader = new ModelLoader();
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.glb,.gltf';
fileInput.style.cssText = 'position:fixed;top:10px;left:10px;';
fileInput.onchange = async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const model = await modelLoader.loadFromFile(file);
  scene.remove(currentModel);
  scene.add(model);
  currentModel = model;
};
document.body.appendChild(fileInput);

const cutManager = new CutManager(controls);

const hud = document.createElement('div');
hud.style.cssText =
  'position:fixed;top:10px;right:10px;padding:8px 12px;background:rgba(0,0,0,0.6);' +
  'color:#fff;font-family:sans-serif;font-size:14px;border-radius:4px;';
document.body.appendChild(hud);

const updateHud = (mode: string) => {
  hud.textContent = `Mode: ${mode}  (press C to toggle)`;
};
updateHud(cutManager.getMode());
cutManager.onModeChange(updateHud);

window.addEventListener('keydown', (e) => {
  if (e.key === 'c' || e.key === 'C') cutManager.toggleMode();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
