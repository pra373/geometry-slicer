import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

const loader = new GLTFLoader();
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.glb,.gltf';
fileInput.style.cssText = 'position:fixed;top:10px;left:10px;';
fileInput.onchange = async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const gltf = await loader.loadAsync(url);
  scene.remove(currentModel);
  scene.add(gltf.scene);
  currentModel = gltf.scene;
};
document.body.appendChild(fileInput);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.013;
  controls.update();
  renderer.render(scene, camera);
});
