/**
 * shapes.js
 * 5대 입체도형 3D 지오메트리 및 전개도 힌지 피벗(Pivot) 정밀 수학 알고리즘
 * - 삼각기둥: 정삼각형 뚜껑 바깥쪽 전개 & 앞뒤 단면 완벽 덮기
 * - 육각뿔: 6각 별(Star) 완벽 대칭 펼침 & 중앙 단일 정점(Apex) 정밀 수렴
 * - 원기둥/직육면체/정육면체: 바닥 Y=0 완벽 안착 & 실(String) 구멍 정확한 궤적 동기화
 */

const ShapeDefinitions = {
  // 1. 정육면체 (Cube)
  cube: {
    title: "정육면체 (Cube)",
    icon: "📦",
    gradeBadge: "초등 5학년 2학기 5단원",
    curriculum: "grade5-2",
    faces: "6개",
    facesDesc: "크기가 모두 같은 정사각형",
    edges: "12개",
    vertices: "8개",
    mechanism: "정육면체 외곽 모서리 홀에 실을 관통시켜 손잡이를 당기면 4개의 옆면과 윗면이 동시에 위로 90도씩 솟아오르며 완벽한 정육면체 상자가 완성됩니다.",
    eduPoints: [
      "모든 면이 크기와 모양이 완전히 같은 합동인 정사각형입니다.",
      "마주보는 면끼리 평행하며, 만나는 모서리의 길이는 모두 같습니다.",
      "정육면체 전개도는 총 11가지 형태가 존재함을 탐구합니다."
    ]
  },

  // 2. 직육면체 (Cuboid)
  cuboid: {
    title: "직육면체 (Cuboid)",
    icon: "🎁",
    gradeBadge: "초등 5학년 2학기 5단원",
    curriculum: "grade5-2",
    faces: "6개",
    facesDesc: "3쌍의 마주보는 직사각형",
    edges: "12개",
    vertices: "8개",
    mechanism: "앞, 뒤, 좌, 우 4면이 바닥면을 기준으로 위로 90도씩 일어서고, 뒷면에 연결된 윗면이 덮이며 바닥(Y=0) 위에 안정적으로 직육면체가 조립됩니다.",
    eduPoints: [
      "크기와 모양이 서로 다른 3쌍의 직사각형으로 구성됩니다.",
      "마주보는 면은 서로 평행하고 합동(크기와 모양이 일치)입니다.",
      "끈을 당겨 닫힐 때 서로 만나는 모서리의 길이가 일치해야 상자가 닫힙니다."
    ]
  },

  // 3. 삼각기둥 (Triangular Prism)
  triPrism: {
    title: "삼각기둥 (Triangular Prism)",
    icon: "📐",
    gradeBadge: "초등 6학년 1학기 2단원",
    curriculum: "grade6-1",
    faces: "5개",
    facesDesc: "정삼각형 2개 + 직사각형 3개",
    edges: "9개",
    vertices: "6개",
    mechanism: "중앙 직사각형 양옆의 옆면이 위로 60도씩 일어나 텐트 모양의 삼각 지붕을 만들고, 상/하 정삼각형 뚜껑이 위로 90도 일어나 단면을 완벽히 덮습니다.",
    eduPoints: [
      "서로 평행하고 합동인 두 밑면의 모양이 '삼각형'이므로 삼각기둥이라 부릅니다.",
      "옆면은 모두 직사각형 모양으로 밑면과 수직을 이룹니다.",
      "기둥 도형의 모서리 수는 (밑면 변의 수 × 3 = 9개) 규칙을 가집니다."
    ]
  },

  // 4. 육각뿔 (Hexagonal Pyramid)
  hexPyramid: {
    title: "육각뿔 (Hexagonal Pyramid)",
    icon: "⛺",
    gradeBadge: "초등 6학년 1학기 2단원",
    curriculum: "grade6-1",
    faces: "7개",
    facesDesc: "정육각형 1개 + 이등변삼각형 6개",
    edges: "12개",
    vertices: "7개",
    mechanism: "바닥 정육각형 6개 변에서 별 모양으로 펼쳐진 이등변삼각형들이 위로 견인되며 중앙 상단의 한 꼭짓점(Apex)으로 완벽하게 모입니다.",
    eduPoints: [
      "밑면은 1개(정육각형)이고 옆면은 모두 합동인 이등변삼각형입니다.",
      "모든 옆면이 한 점에서 모이는 꼭짓점을 '각뿔의 꼭짓점'이라고 합니다.",
      "뿔 도형의 꼭짓점 수는 (밑면 꼭짓점 수 + 1 = 7개)입니다."
    ]
  },

  // 5. 원기둥 (Cylinder)
  cylinder: {
    title: "원기둥 (Cylinder)",
    icon: "🥫",
    gradeBadge: "초등 6학년 2학기 6단원",
    curriculum: "grade6-2",
    faces: "3개",
    facesDesc: "합동인 원 2개 + 굽은 옆면(직사각형)",
    edges: "2개 (곡선 모서리)",
    vertices: "0개",
    mechanism: "바닥에 놓인 직사각형 옆면이 둥근 곡면으로 말려들며 원통을 형성하고, 바닥 원과 상단 원이 맞물려 바닥(Y=0) 위에 똑바로 선 원기둥이 완성됩니다.",
    eduPoints: [
      "원기둥 전개도에서 '옆면 직사각형의 가로 길이' = '밑면 원의 둘레(원주 2πr)'.",
      "영상 속 실측 치수: 반지름 2.5cm일 때 원주 약 15.7cm (접착 여유분 포함 18cm).",
      "굽은 면(곡면)으로 둘러싸여 있어 다면체와 달리 꼭짓점이 존재하지 않습니다."
    ]
  },

  wrong_overlap: {
    title: "오답 전개도: 면 겹침 오류",
    icon: "⚠️",
    gradeBadge: "오답 전개도 실험실",
    curriculum: "all",
    faces: "6개",
    facesDesc: "정사각형 6개 (잘못된 배치)",
    edges: "충돌 발생",
    vertices: "미완성",
    mechanism: "우측에 날개가 2개 연속으로 붙어 있어 줄을 당기면 두 면이 서로 포개어지고, 반대쪽 면은 뻥 뚫려 상자가 닫히지 않습니다.",
    eduPoints: [
      "전개도를 접을 때 마주보는 면의 위치가 일치하지 않으면 면이 겹칩니다.",
      "어느 면이 중복되고 어느 면이 비어 있는지 아이가 직접 오류를 발견합니다."
    ]
  },

  wrong_openTop: {
    title: "오답 전개도: 뚜껑 열림 오류",
    icon: "⚠️",
    gradeBadge: "오답 전개도 실험실",
    curriculum: "all",
    faces: "6개",
    facesDesc: "정사각형 6개",
    edges: "미완성",
    vertices: "미완성",
    mechanism: "뚜껑 면이 엉뚱한 위치에 배치되어 줄을 당겨도 윗면이 닫히지 않고 앞쪽으로 삐져나옵니다.",
    eduPoints: [
      "직육면체/정육면체는 밑면과 평행한 윗면이 반드시 마주보는 위치에 있어야 합니다.",
      "끈을 당겼을 때 윗면이 닫히지 않는 이유를 시각적으로 확인합니다."
    ]
  }
};

/**
 * 정밀 3D 도형 빌더 클래스
 */
class ShapeBuilder {
  constructor() {
    this.colors = {
      base: 0x4f46e5,    // 인디고
      face1: 0x38bdf8,   // 스카이블루
      face2: 0x34d399,   // 에메랄드
      face3: 0xfbbf24,   // 앰버 옐로우
      face4: 0xf472b6,   // 핑크
      face5: 0xa78bfa,   // 바이올렛
      edge: 0x0f172a,    // 진한 네이비 외곽선
      string: 0xf97316,  // 주황색 인장 끈
      wrong: 0xf43f5e    // 오답 레드
    };
  }

  createEdges(geometry, color = this.colors.edge) {
    const wireframe = new THREE.EdgesGeometry(geometry);
    return new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color, linewidth: 2 }));
  }

  createFaceMesh(geometry, color) {
    const mat = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.35,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.add(this.createEdges(geometry));
    return mesh;
  }

  createVertexMarker(x, y, z) {
    const geo = new THREE.SphereGeometry(0.045, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(x, y, z);
    return sphere;
  }

  // ==========================================
  // 1. 정육면체 (Cube)
  // ==========================================
  buildCube(variant = 'net1') {
    const S = 1.6;
    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    const createFaceGeo = () => {
      const g = new THREE.PlaneGeometry(S, S);
      g.rotateX(-Math.PI / 2);
      return g;
    };

    // 바닥면
    const baseMesh = this.createFaceMesh(createFaceGeo(), this.colors.base);
    root.add(baseMesh);

    // 앞면 (위로 90도 일어남: -X 회전)
    const pFront = new THREE.Group();
    pFront.position.set(0, 0, S / 2);
    const frontMesh = this.createFaceMesh(createFaceGeo(), this.colors.face1);
    frontMesh.position.set(0, 0, S / 2);
    pFront.add(frontMesh);
    root.add(pFront);
    pivots.push({ group: pFront, axis: 'x', targetAngle: -Math.PI / 2 });

    // 뒷면 (위로 90도 일어남: +X 회전)
    const pBack = new THREE.Group();
    pBack.position.set(0, 0, -S / 2);
    const backMesh = this.createFaceMesh(createFaceGeo(), this.colors.face1);
    backMesh.position.set(0, 0, -S / 2);
    pBack.add(backMesh);
    root.add(pBack);
    pivots.push({ group: pBack, axis: 'x', targetAngle: Math.PI / 2 });

    // 윗면 (뒷면에 연결되어 뚜껑 닫힘: +X 회전)
    const pTop = new THREE.Group();
    pTop.position.set(0, 0, -S);
    const topMesh = this.createFaceMesh(createFaceGeo(), this.colors.face2);
    topMesh.position.set(0, 0, -S / 2);
    pTop.add(topMesh);
    pBack.add(pTop);
    pivots.push({ group: pTop, axis: 'x', targetAngle: Math.PI / 2 });

    // 좌측면 (위로 90도 일어남: +Z 회전)
    const pLeft = new THREE.Group();
    pLeft.position.set(-S / 2, 0, 0);
    const leftMesh = this.createFaceMesh(createFaceGeo(), this.colors.face3);
    leftMesh.position.set(-S / 2, 0, 0);
    pLeft.add(leftMesh);
    root.add(pLeft);
    pivots.push({ group: pLeft, axis: 'z', targetAngle: Math.PI / 2 });

    // 우측면 (위로 90도 일어남: -Z 회전)
    const pRight = new THREE.Group();
    pRight.position.set(S / 2, 0, 0);
    const rightMesh = this.createFaceMesh(createFaceGeo(), this.colors.face3);
    rightMesh.position.set(S / 2, 0, 0);
    pRight.add(rightMesh);
    root.add(pRight);
    pivots.push({ group: pRight, axis: 'z', targetAngle: -Math.PI / 2 });

    // 타공 구멍 위치 (전개도 면 위의 정확한 로컬 좌표)
    const addHole = (parent, lx, lz) => {
      const h = new THREE.Object3D();
      h.position.set(lx, 0.02, lz);
      parent.add(h);
      holeMarkers.push(h);
    };

    // 실 경로: 좌측면 -> 앞면 좌 -> 앞면 우 -> 우측면 -> 윗면 우 -> 윗면 좌 -> 좌측면 (루프)
    addHole(leftMesh, -S / 2 + 0.15, 0);
    addHole(frontMesh, -S / 2 + 0.15, S / 2 - 0.15);
    addHole(frontMesh, S / 2 - 0.15, S / 2 - 0.15);
    addHole(rightMesh, S / 2 - 0.15, 0);
    addHole(topMesh, S / 2 - 0.15, -S / 2 + 0.15);
    addHole(topMesh, -S / 2 + 0.15, -S / 2 + 0.15);
    addHole(leftMesh, -S / 2 + 0.15, 0);

    // 꼭짓점 마커
    const addVM = (parent, x, z) => {
      const vm = this.createVertexMarker(x, 0.03, z);
      parent.add(vm);
      vertexMarkers.push(vm);
    };
    addVM(baseMesh, -S/2, -S/2);
    addVM(baseMesh, S/2, -S/2);
    addVM(baseMesh, S/2, S/2);
    addVM(baseMesh, -S/2, S/2);

    return { root, pivots, holeMarkers, vertexMarkers, type: 'hierarchical', isWrong: false };
  }

  // ==========================================
  // 2. 직육면체 (Cuboid)
  // ==========================================
  buildCuboid() {
    const W = 2.2;
    const D = 1.4;
    const H = 1.0;
    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    const createGeo = (w, d) => {
      const g = new THREE.PlaneGeometry(w, d);
      g.rotateX(-Math.PI / 2);
      return g;
    };

    const baseMesh = this.createFaceMesh(createGeo(W, D), this.colors.base);
    root.add(baseMesh);

    const pFront = new THREE.Group();
    pFront.position.set(0, 0, D / 2);
    const frontMesh = this.createFaceMesh(createGeo(W, H), this.colors.face1);
    frontMesh.position.set(0, 0, H / 2);
    pFront.add(frontMesh);
    root.add(pFront);
    pivots.push({ group: pFront, axis: 'x', targetAngle: -Math.PI / 2 });

    const pBack = new THREE.Group();
    pBack.position.set(0, 0, -D / 2);
    const backMesh = this.createFaceMesh(createGeo(W, H), this.colors.face1);
    backMesh.position.set(0, 0, -H / 2);
    pBack.add(backMesh);
    root.add(pBack);
    pivots.push({ group: pBack, axis: 'x', targetAngle: Math.PI / 2 });

    const pTop = new THREE.Group();
    pTop.position.set(0, 0, -H);
    const topMesh = this.createFaceMesh(createGeo(W, D), this.colors.base);
    topMesh.position.set(0, 0, -D / 2);
    pTop.add(topMesh);
    pBack.add(pTop);
    pivots.push({ group: pTop, axis: 'x', targetAngle: Math.PI / 2 });

    const pLeft = new THREE.Group();
    pLeft.position.set(-W / 2, 0, 0);
    const leftMesh = this.createFaceMesh(createGeo(H, D), this.colors.face2);
    leftMesh.position.set(-H / 2, 0, 0);
    pLeft.add(leftMesh);
    root.add(pLeft);
    pivots.push({ group: pLeft, axis: 'z', targetAngle: Math.PI / 2 });

    const pRight = new THREE.Group();
    pRight.position.set(W / 2, 0, 0);
    const rightMesh = this.createFaceMesh(createGeo(H, D), this.colors.face2);
    rightMesh.position.set(H / 2, 0, 0);
    pRight.add(rightMesh);
    root.add(pRight);
    pivots.push({ group: pRight, axis: 'z', targetAngle: -Math.PI / 2 });

    return { root, pivots, holeMarkers, vertexMarkers, type: 'hierarchical', isWrong: false };
  }

  // ==========================================
  // 3. 삼각기둥 (Triangular Prism) - 정밀 뚜껑 기하학
  // ==========================================
  buildTriPrism() {
    const W = 1.6; // 한 변 길이
    const H = 2.2; // 기둥 높이
    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    const createGeo = (w, d) => {
      const g = new THREE.PlaneGeometry(w, d);
      g.rotateX(-Math.PI / 2);
      return g;
    };

    // 중앙 옆면 (바닥)
    const centerMesh = this.createFaceMesh(createGeo(W, H), this.colors.face1);
    root.add(centerMesh);

    // 좌측 옆면 (위로 60도 일어남)
    const pLeft = new THREE.Group();
    pLeft.position.set(-W / 2, 0, 0);
    const leftMesh = this.createFaceMesh(createGeo(W, H), this.colors.face2);
    leftMesh.position.set(-W / 2, 0, 0);
    pLeft.add(leftMesh);
    root.add(pLeft);
    pivots.push({ group: pLeft, axis: 'z', targetAngle: Math.PI / 3 });

    // 우측 옆면 (위로 60도 일어남)
    const pRight = new THREE.Group();
    pRight.position.set(W / 2, 0, 0);
    const rightMesh = this.createFaceMesh(createGeo(W, H), this.colors.face2);
    rightMesh.position.set(W / 2, 0, 0);
    pRight.add(rightMesh);
    root.add(pRight);
    pivots.push({ group: pRight, axis: 'z', targetAngle: -Math.PI / 3 });

    // 정삼각형 높이
    const triH = (Math.sqrt(3) / 2) * W;

    // 상단 정삼각형 뚜껑 (힌지: 0, 0, -H/2). 뒤쪽(음수 Z)으로 확실히 뻗어나감!
    const topTriGeo = new THREE.BufferGeometry();
    const topPositions = new Float32Array([
      -W / 2, 0, 0,
       W / 2, 0, 0,
       0,     0, -triH
    ]);
    topTriGeo.setAttribute('position', new THREE.BufferAttribute(topPositions, 3));
    topTriGeo.computeVertexNormals();

    const pTop = new THREE.Group();
    pTop.position.set(0, 0, -H / 2);
    const topMesh = this.createFaceMesh(topTriGeo, this.colors.base);
    pTop.add(topMesh);
    root.add(pTop);
    // 뒤쪽(-Z)에 누워있는 삼각형을 위(+Y)로 90도 세우려면 +X 회전!
    pivots.push({ group: pTop, axis: 'x', targetAngle: Math.PI / 2 });

    // 하단 정삼각형 뚜껑 (힌지: 0, 0, H/2). 앞쪽(양수 Z)으로 확실히 뻗어나감!
    const bottomTriGeo = new THREE.BufferGeometry();
    const bottomPositions = new Float32Array([
      -W / 2, 0, 0,
       W / 2, 0, 0,
       0,     0, triH
    ]);
    bottomTriGeo.setAttribute('position', new THREE.BufferAttribute(bottomPositions, 3));
    bottomTriGeo.computeVertexNormals();

    const pBottom = new THREE.Group();
    pBottom.position.set(0, 0, H / 2);
    const bottomMesh = this.createFaceMesh(bottomTriGeo, this.colors.base);
    pBottom.add(bottomMesh);
    root.add(pBottom);
    // 앞쪽(+Z)에 누워있는 삼각형을 위(+Y)로 90도 세우려면 -X 회전!
    pivots.push({ group: pBottom, axis: 'x', targetAngle: -Math.PI / 2 });

    // 실 타공 홀 (삼각형 꼭짓점과 양쪽 날개 연결)
    const addHole = (parent, x, z) => {
      const h = new THREE.Object3D();
      h.position.set(x, 0.02, z);
      parent.add(h);
      holeMarkers.push(h);
    };
    addHole(topMesh, 0, -triH + 0.1);
    addHole(leftMesh, -W / 2, -H / 2 + 0.2);
    addHole(leftMesh, -W / 2, H / 2 - 0.2);
    addHole(bottomMesh, 0, triH - 0.1);
    addHole(rightMesh, W / 2, H / 2 - 0.2);
    addHole(rightMesh, W / 2, -H / 2 + 0.2);
    addHole(topMesh, 0, -triH + 0.1);

    return { root, pivots, holeMarkers, vertexMarkers, type: 'hierarchical', isWrong: false };
  }

  // ==========================================
  // 4. 육각뿔 (Hexagonal Pyramid) - 완벽 대칭 별 모양 & 단일 Apex 수렴
  // ==========================================
  buildHexPyramid() {
    const R = 1.3;      // 정육각형 한 변 길이
    const S = R;
    const triL = 2.4;   // 옆면 삼각형 높이
    const rIn = R * (Math.sqrt(3) / 2); // 내접원 반경
    // 힌지가 위로 넘어와 안쪽 꼭짓점으로 모이는 정확한 3D 회전각
    const thetaBase = Math.acos(rIn / triL);
    const foldAngle = Math.PI - thetaBase; // 180도 - 약 62도 = 약 118도 안쪽 회전!

    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    // 정육각형 밑면 (XZ 평면)
    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = R * Math.cos(a);
      const y = R * Math.sin(a);
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();
    const hexGeo = new THREE.ShapeGeometry(hexShape);
    hexGeo.rotateX(-Math.PI / 2);
    const hexMesh = this.createFaceMesh(hexGeo, this.colors.base);
    root.add(hexMesh);

    // 옆면 이등변삼각형 지오메트리 (바닥 XZ 평면, 힌지는 X축 [-S/2, S/2], 꼭짓점은 +Z 방향 triL)
    const triGeo = new THREE.BufferGeometry();
    const triPos = new Float32Array([
      -S / 2, 0, 0,
       S / 2, 0, 0,
       0,     0, triL
    ]);
    triGeo.setAttribute('position', new THREE.BufferAttribute(triPos, 3));
    triGeo.computeVertexNormals();

    // 6개 변에 삼각형 힌지 장착 (정확한 바깥쪽 방사형 배치)
    for (let i = 0; i < 6; i++) {
      const alpha_i = (i * Math.PI) / 3 + Math.PI / 6;
      const edgeCenterX = rIn * Math.cos(alpha_i);
      const edgeCenterZ = rIn * Math.sin(alpha_i);

      const pGroup = new THREE.Group();
      pGroup.position.set(edgeCenterX, 0, edgeCenterZ);
      // 로컬 +Z축이 바깥쪽 방사형(alpha_i)을 향하도록 회전
      pGroup.rotation.y = Math.PI / 2 - alpha_i;

      const triMesh = this.createFaceMesh(triGeo, i % 2 === 0 ? this.colors.face1 : this.colors.face2);
      pGroup.add(triMesh);
      root.add(pGroup);

      // 접힐 때: X축을 기준으로 위로 넘어가서 중심 상단(Apex)으로 모임!
      pivots.push({ group: pGroup, axis: 'x', targetAngle: -foldAngle });

      // 삼각형 꼭짓점에 타공 구멍 마커 등록
      const hole = new THREE.Object3D();
      hole.position.set(0, 0.02, triL);
      triMesh.add(hole);
      holeMarkers.push(hole);
    }

    // 폐곡선 루프로 첫 번째 꼭짓점 한 번 더 등록하여 6각 별 끈 완성
    if (holeMarkers.length > 0) {
      holeMarkers.push(holeMarkers[0]);
    }

    return { root, pivots, holeMarkers, vertexMarkers, type: 'hierarchical', isWrong: false };
  }

  // ==========================================
  // 5. 원기둥 (Cylinder)
  // ==========================================
  buildCylinder() {
    const R = 0.9;
    const H = 2.0;
    const W = 2 * Math.PI * R;
    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    const segX = 48;
    const segY = 8;
    const cylinderGeo = new THREE.PlaneGeometry(W, H, segX, segY);
    cylinderGeo.translate(0, H / 2, 0); // Y=0 바닥 위에 안착
    const originalPositions = cylinderGeo.attributes.position.clone();

    const cylinderMat = new THREE.MeshStandardMaterial({
      color: this.colors.face1,
      side: THREE.DoubleSide,
      roughness: 0.35,
      metalness: 0.1
    });
    const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinderMesh.add(this.createEdges(cylinderGeo, 0x0284c7));
    root.add(cylinderMesh);

    const capGeo = new THREE.CircleGeometry(R, 32);
    capGeo.rotateX(-Math.PI / 2);

    const pBottom = new THREE.Group();
    pBottom.position.set(0, 0, 0);
    const bCapMesh = this.createFaceMesh(capGeo, this.colors.base);
    pBottom.add(bCapMesh);
    root.add(pBottom);

    const pTop = new THREE.Group();
    pTop.position.set(0, H, 0);
    const tCapMesh = this.createFaceMesh(capGeo, this.colors.base);
    pTop.add(tCapMesh);
    root.add(pTop);

    const updateBending = (t) => {
      const pos = cylinderGeo.attributes.position;
      const orig = originalPositions.array;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const uX = orig[i * 3];
        const origY = orig[i * 3 + 1];

        if (t <= 0.001) {
          pos.setXYZ(i, uX, origY, 0);
        } else {
          const normX = uX / (W / 2);
          const angle = normX * Math.PI * t;

          const curvedX = R * Math.sin(angle);
          const curvedZ = -R * (1 - Math.cos(angle)) * t;

          const finalX = THREE.MathUtils.lerp(uX, curvedX, t);
          const finalZ = THREE.MathUtils.lerp(0, curvedZ, t);

          pos.setXYZ(i, finalX, origY, finalZ);
        }
      }
      pos.needsUpdate = true;
      cylinderGeo.computeVertexNormals();

      const capZ = -R * t;
      pBottom.position.z = capZ;
      pTop.position.z = capZ;

      bCapMesh.material.opacity = Math.max(0.1, t);
      bCapMesh.material.transparent = t < 0.99;
      tCapMesh.material.opacity = Math.max(0.1, t);
      tCapMesh.material.transparent = t < 0.99;
    };

    return { root, pivots, holeMarkers, vertexMarkers, type: 'cylinder', updateBending, isWrong: false };
  }

  // ==========================================
  // 6. 오답 전개도: 면 겹침
  // ==========================================
  buildWrongOverlap() {
    const S = 1.6;
    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    const createFaceGeo = () => {
      const g = new THREE.PlaneGeometry(S, S);
      g.rotateX(-Math.PI / 2);
      return g;
    };

    const baseMesh = this.createFaceMesh(createFaceGeo(), this.colors.base);
    root.add(baseMesh);

    const pFront = new THREE.Group();
    pFront.position.set(0, 0, S / 2);
    const frontMesh = this.createFaceMesh(createFaceGeo(), this.colors.face1);
    frontMesh.position.set(0, 0, S / 2);
    pFront.add(frontMesh);
    root.add(pFront);
    pivots.push({ group: pFront, axis: 'x', targetAngle: -Math.PI / 2 });

    const pBack = new THREE.Group();
    pBack.position.set(0, 0, -S / 2);
    const backMesh = this.createFaceMesh(createFaceGeo(), this.colors.face1);
    backMesh.position.set(0, 0, -S / 2);
    pBack.add(backMesh);
    root.add(pBack);
    pivots.push({ group: pBack, axis: 'x', targetAngle: Math.PI / 2 });

    const pRight1 = new THREE.Group();
    pRight1.position.set(S / 2, 0, 0);
    const rightMesh1 = this.createFaceMesh(createFaceGeo(), this.colors.face2);
    rightMesh1.position.set(S / 2, 0, 0);
    pRight1.add(rightMesh1);
    root.add(pRight1);
    pivots.push({ group: pRight1, axis: 'z', targetAngle: -Math.PI / 2 });

    const pRight2 = new THREE.Group();
    pRight2.position.set(S, 0, 0);
    const rightMesh2 = this.createFaceMesh(createFaceGeo(), this.colors.wrong);
    rightMesh2.position.set(S / 2, 0, 0);
    pRight2.add(rightMesh2);
    pRight1.add(pRight2);
    pivots.push({ group: pRight2, axis: 'z', targetAngle: -Math.PI / 2 });

    const pTop = new THREE.Group();
    pTop.position.set(0, 0, -S);
    const topMesh = this.createFaceMesh(createFaceGeo(), this.colors.wrong);
    topMesh.position.set(0, 0, -S / 2);
    pTop.add(topMesh);
    pBack.add(pTop);
    pivots.push({ group: pTop, axis: 'x', targetAngle: Math.PI / 2 });

    return { root, pivots, holeMarkers, vertexMarkers, type: 'hierarchical', isWrong: true, wrongMsg: "오른쪽 날개와 윗면이 겹치고, 왼쪽 면은 뚫려 있습니다!" };
  }

  // ==========================================
  // 7. 오답 전개도: 뚜껑 열림
  // ==========================================
  buildWrongOpenTop() {
    const S = 1.6;
    const root = new THREE.Group();
    const pivots = [];
    const holeMarkers = [];
    const vertexMarkers = [];

    const createFaceGeo = () => {
      const g = new THREE.PlaneGeometry(S, S);
      g.rotateX(-Math.PI / 2);
      return g;
    };

    const baseMesh = this.createFaceMesh(createFaceGeo(), this.colors.base);
    root.add(baseMesh);

    const pFront = new THREE.Group();
    pFront.position.set(0, 0, S / 2);
    const frontMesh = this.createFaceMesh(createFaceGeo(), this.colors.face1);
    frontMesh.position.set(0, 0, S / 2);
    pFront.add(frontMesh);
    root.add(pFront);
    pivots.push({ group: pFront, axis: 'x', targetAngle: -Math.PI / 2 });

    const pBack = new THREE.Group();
    pBack.position.set(0, 0, -S / 2);
    const backMesh = this.createFaceMesh(createFaceGeo(), this.colors.face1);
    backMesh.position.set(0, 0, -S / 2);
    pBack.add(backMesh);
    root.add(pBack);
    pivots.push({ group: pBack, axis: 'x', targetAngle: Math.PI / 2 });

    const pLeft = new THREE.Group();
    pLeft.position.set(-S / 2, 0, 0);
    const leftMesh = this.createFaceMesh(createFaceGeo(), this.colors.face2);
    leftMesh.position.set(-S / 2, 0, 0);
    pLeft.add(leftMesh);
    root.add(pLeft);
    pivots.push({ group: pLeft, axis: 'z', targetAngle: Math.PI / 2 });

    const pRight = new THREE.Group();
    pRight.position.set(S / 2, 0, 0);
    const rightMesh = this.createFaceMesh(createFaceGeo(), this.colors.face2);
    rightMesh.position.set(S / 2, 0, 0);
    pRight.add(rightMesh);
    root.add(pRight);
    pivots.push({ group: pRight, axis: 'z', targetAngle: -Math.PI / 2 });

    const pError = new THREE.Group();
    pError.position.set(0, 0, S);
    const errMesh = this.createFaceMesh(createFaceGeo(), this.colors.wrong);
    errMesh.position.set(0, 0, S / 2);
    pError.add(errMesh);
    pFront.add(pError);
    pivots.push({ group: pError, axis: 'x', targetAngle: -Math.PI / 2 });

    return { root, pivots, holeMarkers, vertexMarkers, type: 'hierarchical', isWrong: true, wrongMsg: "상단 뚜껑이 뚫려있고, 앞쪽으로 면이 이중으로 꺾입니다!" };
  }
}
