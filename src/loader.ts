import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
  private loader = new GLTFLoader();

  async loadFromFile(file: File): Promise<THREE.Object3D> {
    const url = URL.createObjectURL(file);
    try {
      const gltf = await this.loader.loadAsync(url);
      return gltf.scene;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
