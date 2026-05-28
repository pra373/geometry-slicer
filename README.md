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

## Libraries Used

- **three** — WebGL abstraction (scene graph, camera, materials).
- **three/examples/jsm/controls/OrbitControls** — orbit/pan/zoom for navigate mode.
- **three/examples/jsm/loaders/GLTFLoader** — to load arbitrary GLTF models.

---

## Slicing Approach

All the cutting logic is handled by `MeshCutter`. You hand it a mesh and a cutting plane, and it gives you back two meshes — one for each side of the cut.

The idea is pretty simple: a mesh is just a pile of triangles, so the cutter goes through them one by one and asks "is this triangle on the left of the plane, the right, or sitting across it?"

To answer that, it measures the *signed distance* from each of the triangle's three vertices to the plane. Positive means one side, negative means the other.

- If all three distances have the same sign, the triangle is fully on one side and goes into that side's pile as-is.
- If the signs are mixed, the triangle straddles the plane and needs to be split.

For a straddling triangle, the cutter looks at each edge where the sign flips between its two endpoints, and finds the exact point on that edge where the distance becomes zero. That's just a linear interpolation between the two endpoints, weighted by how far each one sits from the plane. New vertices are dropped at those crossing points, and the smaller shapes on each side are stitched back into triangles before being added to their piles.

When the new vertices are created at edge crossings, their UVs and normals are blended from the original endpoints using the same weighting, so textures and lighting stay smooth across the cut.

At the end, the two new meshes are placed back at the original position, with a tiny nudge apart along the plane normal so you can actually see they've been split.

---

## Shading

The scene uses Three.js's built-in **physically-based shading** — no custom shaders are written. Primitives use `MeshStandardMaterial` with a roughness/metalness setup, and models loaded from GLTF keep whatever PBR materials they ship with.

Lighting is intentionally minimal: one `AmbientLight` for soft fill so nothing goes pitch-black, and one `DirectionalLight` from above-front to give surfaces a clear sense of shape.

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

Things skipped or simplified for time, in roughly the order I'd pick them up next:

1. **Dragging of individual pieces.** Cuts work, but the resulting halves can't yet be picked up and moved.
2. **Title screen with a Start button** before entering the 3D scene.
3. **Model loading via a file picker** instead of a catalog/thumbnail gallery — the catalog is a UI layer and doesn't affect the cutting logic.
4. **Basic lighting only** (ambient + one directional). Advanced lighting can be added later.

---