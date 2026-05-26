import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type Mode = 'navigate' | 'cut';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class CutManager {
  private mode: Mode = 'navigate';
  private listeners: Array<(mode: Mode) => void> = [];
  private dragStart: { x: number; y: number } | null = null;
  private svg: SVGSVGElement;
  private line: SVGLineElement;

  constructor(private controls: OrbitControls) {
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
    console.log('cut drag', this.dragStart, 'to', { x: e.clientX, y: e.clientY });
    this.dragStart = null;
    this.svg.style.display = 'none';
  };

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
