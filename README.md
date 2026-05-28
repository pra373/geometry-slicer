# Geometry Slicer

A desktop-based 3D mesh editing tool where users can load a model, perform cutting gestures using the mouse, and split geometry into independently movable parts.

---

## Framework / Approach Used

**Framework:** Three.js  
**Language:** TypeScript  
**Bundler:** Vite

### Why Three.js over raw WebGL?

Reasoning:


- Although Three.js and the overall web application architecture—including tools like Vite and TypeScript—are completely new to me, Three.js provides the required abstraction over WebGL. This will significantly increase my development speed, which is crucial considering the tight time limit.

- Available implementation time is approximately **3 nights + Thursday until 12:00 AM**

- The decision was made to maximize progress on the core problem rather than rebuilding rendering infrastructure.

---

## Work Completed So Far

Current implementation progress:


- [x] Repository setup completed
- [x] Project initialized using Vite + TypeScript
- [x] Initial project structure prepared
- [x] Three.js environment setup completed
- [x] Camera setup completed
- [x] Orbit controls integrated
- [x] Basic lighting added
- [x] cut is added with red dotted line showing the cut plane before cutting

---

## Simplifications / Tradeoffs Due To Time Constraints

- Simple file explorer based loading workflow as The catalog system is mostly a UI concern and can be added later

- Added basic lighting only. advanced lighting can be added later. 

## Planned Next Steps

1. Enable dragging of individual pieces.

---