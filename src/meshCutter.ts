import * as THREE from 'three';

type Vertex = {
  pos: THREE.Vector3;
  uv: THREE.Vector2 | null;
  normal: THREE.Vector3 | null;
};

export class MeshCutter {
  cut(mesh: THREE.Mesh, plane: THREE.Plane): [THREE.Mesh, THREE.Mesh] {
    const localPlane = this.toLocalSpace(plane, mesh);
    const source = mesh.geometry.index
      ? mesh.geometry.toNonIndexed()
      : mesh.geometry.clone();

    const posAttr = source.getAttribute('position') as THREE.BufferAttribute;
    const uvAttr = source.getAttribute('uv') as THREE.BufferAttribute | undefined;
    const normAttr = source.getAttribute('normal') as THREE.BufferAttribute | undefined;

    const positive: Vertex[] = [];
    const negative: Vertex[] = [];

    for (let i = 0; i < posAttr.count; i += 3) {
      const a = this.readVertex(posAttr, uvAttr, normAttr, i);
      const b = this.readVertex(posAttr, uvAttr, normAttr, i + 1);
      const c = this.readVertex(posAttr, uvAttr, normAttr, i + 2);
      this.splitTriangle(a, b, c, localPlane, positive, negative);
    }

    const matA = (mesh.material as THREE.Material).clone();
    const matB = (mesh.material as THREE.Material).clone();
    const meshA = new THREE.Mesh(this.buildGeometry(positive), matA);
    const meshB = new THREE.Mesh(this.buildGeometry(negative), matB);
    meshA.position.copy(mesh.position);
    meshB.position.copy(mesh.position);
    meshA.quaternion.copy(mesh.quaternion);
    meshB.quaternion.copy(mesh.quaternion);
    meshA.scale.copy(mesh.scale);
    meshB.scale.copy(mesh.scale);

    const offset = plane.normal.clone().multiplyScalar(0.02);
    meshA.position.add(offset);
    meshB.position.sub(offset);

    return [meshA, meshB];
  }

  private toLocalSpace(plane: THREE.Plane, mesh: THREE.Mesh): THREE.Plane {
    mesh.updateMatrixWorld();
    const inverse = mesh.matrixWorld.clone().invert();
    return plane.clone().applyMatrix4(inverse);
  }

  private readVertex(
    posAttr: THREE.BufferAttribute,
    uvAttr: THREE.BufferAttribute | undefined,
    normAttr: THREE.BufferAttribute | undefined,
    i: number,
  ): Vertex {
    return {
      pos: new THREE.Vector3().fromBufferAttribute(posAttr, i),
      uv: uvAttr ? new THREE.Vector2().fromBufferAttribute(uvAttr, i) : null,
      normal: normAttr
        ? new THREE.Vector3().fromBufferAttribute(normAttr, i)
        : null,
    };
  }

  private splitTriangle(
    a: Vertex,
    b: Vertex,
    c: Vertex,
    plane: THREE.Plane,
    positive: Vertex[],
    negative: Vertex[],
  ): void {
    const verts = [a, b, c];
    const dists = [
      plane.distanceToPoint(a.pos),
      plane.distanceToPoint(b.pos),
      plane.distanceToPoint(c.pos),
    ];
    const pos: Vertex[] = [];
    const neg: Vertex[] = [];

    for (let i = 0; i < 3; i++) {
      const curr = verts[i];
      const next = verts[(i + 1) % 3];
      const dCurr = dists[i];
      const dNext = dists[(i + 1) % 3];

      if (dCurr >= 0) pos.push(curr);
      else neg.push(curr);

      if ((dCurr > 0 && dNext < 0) || (dCurr < 0 && dNext > 0)) {
        const t = dCurr / (dCurr - dNext);
        const cut = this.lerpVertex(curr, next, t);
        pos.push(cut);
        neg.push(cut);
      }
    }

    this.fanTriangulate(pos, positive);
    this.fanTriangulate(neg, negative);
  }

  private lerpVertex(a: Vertex, b: Vertex, t: number): Vertex {
    return {
      pos: new THREE.Vector3().lerpVectors(a.pos, b.pos, t),
      uv:
        a.uv && b.uv ? new THREE.Vector2().lerpVectors(a.uv, b.uv, t) : null,
      normal:
        a.normal && b.normal
          ? new THREE.Vector3()
              .lerpVectors(a.normal, b.normal, t)
              .normalize()
          : null,
    };
  }

  private fanTriangulate(poly: Vertex[], out: Vertex[]): void {
    if (poly.length < 3) return;
    for (let i = 1; i < poly.length - 1; i++) {
      out.push(poly[0], poly[i], poly[i + 1]);
    }
  }

  private buildGeometry(verts: Vertex[]): THREE.BufferGeometry {
    const positions = new Float32Array(verts.length * 3);
    const hasUV = verts.length > 0 && verts[0].uv !== null;
    const hasNormal = verts.length > 0 && verts[0].normal !== null;
    const uvs = hasUV ? new Float32Array(verts.length * 2) : null;
    const normals = hasNormal ? new Float32Array(verts.length * 3) : null;

    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      positions[i * 3] = v.pos.x;
      positions[i * 3 + 1] = v.pos.y;
      positions[i * 3 + 2] = v.pos.z;
      if (uvs && v.uv) {
        uvs[i * 2] = v.uv.x;
        uvs[i * 2 + 1] = v.uv.y;
      }
      if (normals && v.normal) {
        normals[i * 3] = v.normal.x;
        normals[i * 3 + 1] = v.normal.y;
        normals[i * 3 + 2] = v.normal.z;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (uvs) geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    if (normals) geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    else geom.computeVertexNormals();
    return geom;
  }
}
