import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshCutter } from './meshCutter';

export type Mode = 'navigate' | 'cut';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class CutManager {
  private mode: Mode = 'navigate';
  private listeners: Array<(mode: Mode) => void> = [];
  private dragStart: { x: number; y: number } | null = null;
  private svg: SVGSVGElement;
  private line: SVGLineElement;
  private parts: THREE.Mesh[] = [];
  private cutter = new MeshCutter();

  constructor(
    private camera: THREE.PerspectiveCamera,
    private controls: OrbitControls,
    private scene: THREE.Scene,
  ) {
    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;display:none';
    this.line = document.createElementNS(SVG_NS, 'line');
    this.line.setAttribute('stroke', '#ff4444');
    this.line.setAttribute('stroke-width', '2');
    this.line.setAttribute('stroke-dasharray', '6,4');
    this.svg.appendChild(this.line);
    document.body.appendChild(this.svg);

    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.mode !== 'cut') return;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.line.setAttribute('x1', String(e.clientX));
    this.line.setAttribute('y1', String(e.clientY));
    this.line.setAttribute('x2', String(e.clientX));
    this.line.setAttribute('y2', String(e.clientY));
    this.svg.style.display = 'block';
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragStart) return;
    this.line.setAttribute('x2', String(e.clientX));
    this.line.setAttribute('y2', String(e.clientY));
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.dragStart) return;
    const end = { x: e.clientX, y: e.clientY };
    const plane = this.buildCutPlane(this.dragStart, end);
    this.applyCut(plane);
    this.dragStart = null;
    this.svg.style.display = 'none';
  };

  private applyCut(plane: THREE.Plane): void {
    const next: THREE.Mesh[] = [];
    for (const part of this.parts) {
      const [a, b] = this.cutter.cut(part, plane);
      this.scene.remove(part);
      part.geometry.dispose();
      this.scene.add(a);
      this.scene.add(b);
      next.push(a, b);
    }
    this.parts = next;
  }

  setParts(meshes: THREE.Mesh[]): void {
    for (const part of this.parts) {
      this.scene.remove(part);
      part.geometry.dispose();
    }
    this.parts = [];
    for (const mesh of meshes) {
      this.scene.attach(mesh);
      this.parts.push(mesh);
    }
  }

  private buildCutPlane(
    start: { x: number; y: number },
    end: { x: number; y: number },
  ): THREE.Plane {
    const startWorld = this.screenToWorld(start.x, start.y);
    const endWorld = this.screenToWorld(end.x, end.y);
    return new THREE.Plane().setFromCoplanarPoints(
      startWorld,
      endWorld,
      this.camera.position.clone(),
    );
  }

  private screenToWorld(px: number, py: number): THREE.Vector3 {
    const ndc = new THREE.Vector3(
      (px / window.innerWidth) * 2 - 1,
      -(py / window.innerHeight) * 2 + 1,
      0.5,
    );
    return ndc.unproject(this.camera);
  }

  getMode(): Mode {
    return this.mode;
  }

  setMode(mode: Mode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.controls.enabled = mode === 'navigate';
    this.listeners.forEach((fn) => fn(mode));
  }

  toggleMode(): void {
    this.setMode(this.mode === 'navigate' ? 'cut' : 'navigate');
  }

  onModeChange(fn: (mode: Mode) => void): void {
    this.listeners.push(fn);
  }
}
