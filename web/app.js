/**
 * app.js
 * 메인 3D 씬 매니저, 인터랙션 컨트롤러, 오답 실험실, 퀴즈, 수학 랩 및 DIY 도안 렌더러
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. 상태 관리 (State)
  // ==========================================
  const state = {
    currentShape: 'cube',
    currentVariant: 'net1',
    targetTension: 0.0,
    currentTension: 0.0,
    isWireframe: false,
    showStrings: true,
    showVertices: true,
    isAutoPlaying: false,
    autoPlayDirection: 1,
    shapeInstance: null,
    stringLineMesh: null
  };

  const shapeBuilder = new ShapeBuilder();

  // ==========================================
  // 2. Three.js 씬 & 렌더러 초기화
  // ==========================================
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('webgl-canvas');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 5.0, 5.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  controls.minDistance = 2.0;
  controls.maxDistance = 12.0;

  // 조명 설정
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
  mainLight.position.set(5, 10, 7);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
  fillLight.position.set(-5, 8, -5);
  scene.add(fillLight);

  // 바닥 그리드
  const gridHelper = new THREE.GridHelper(10, 20, 0xc7d2fe, 0xe2e8f0);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  // 리사이즈
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // ==========================================
  // 3. 실(String) 시각화 라인 메쉬 생성
  // ==========================================
  const stringMaterial = new THREE.LineBasicMaterial({
    color: 0xea580c,
    linewidth: 3,
    transparent: true,
    opacity: 0.85
  });

  function initStringMesh() {
    if (state.stringLineMesh) {
      scene.remove(state.stringLineMesh);
    }
    const maxHoles = 24;
    const stringGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxHoles * 3);
    stringGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    state.stringLineMesh = new THREE.Line(stringGeo, stringMaterial);
    state.stringLineMesh.visible = state.showStrings;
    scene.add(state.stringLineMesh);
  }
  initStringMesh();

  // ==========================================
  // 4. 도형 로드 및 교체 함수
  // ==========================================
  const cubeNetBox = document.getElementById('cube-net-variant-box');
  const errorAlertBadge = document.getElementById('error-alert-badge');

  function loadShape(shapeKey, variant = 'net1') {
    if (state.shapeInstance && state.shapeInstance.root) {
      scene.remove(state.shapeInstance.root);
    }

    state.currentShape = shapeKey;
    state.currentVariant = variant;
    state.targetTension = 0.0;
    state.currentTension = 0.0;
    state.isAutoPlaying = false;
    errorAlertBadge.classList.add('hidden');
    updateSliderUI(0);

    // 정육면체 전개도 변형 드롭다운 토글
    if (shapeKey === 'cube') {
      cubeNetBox.classList.remove('hidden');
    } else {
      cubeNetBox.classList.add('hidden');
    }

    // 도형 빌드
    switch (shapeKey) {
      case 'cuboid':
        state.shapeInstance = shapeBuilder.buildCuboid();
        break;
      case 'triPrism':
        state.shapeInstance = shapeBuilder.buildTriPrism();
        break;
      case 'hexPyramid':
        state.shapeInstance = shapeBuilder.buildHexPyramid();
        break;
      case 'cylinder':
        state.shapeInstance = shapeBuilder.buildCylinder();
        break;
      case 'wrong_overlap':
        state.shapeInstance = shapeBuilder.buildWrongOverlap();
        break;
      case 'wrong_openTop':
        state.shapeInstance = shapeBuilder.buildWrongOpenTop();
        break;
      case 'cube':
      default:
        state.shapeInstance = shapeBuilder.buildCube(variant);
        break;
    }

    scene.add(state.shapeInstance.root);
    applyWireframeMode();
    applyVerticesVisibility();
    updateShapeInfoPanel(shapeKey);
  }

  // ==========================================
  // 5. 프레임 렌더 루프 & 실시간 폴딩 업데이트
  // ==========================================
  const pullSlider = document.getElementById('pull-slider');
  const tensionPercentageText = document.getElementById('tension-percentage');
  const statusBadge = document.getElementById('status-badge');

  function updateSliderUI(val) {
    pullSlider.value = val;
    const isW = state.shapeInstance && state.shapeInstance.isWrong;

    tensionPercentageText.innerText = `${Math.round(val)}% (${val > 90 ? (isW ? '오류 발생' : '3D 입체 완성') : val < 10 ? '2D 평면' : '접히는 중'})`;
    
    if (val < 15) {
      statusBadge.innerText = '평면 전개도 (2D 상태)';
      statusBadge.className = 'absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-indigo-700 shadow-md';
      errorAlertBadge.classList.add('hidden');
    } else if (val >= 80 && isW) {
      statusBadge.innerText = '오류: 입체 완성 불가';
      statusBadge.className = 'absolute bottom-3 left-3 bg-rose-600 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-rose-200 animate-pulse';
      errorAlertBadge.innerText = `⚠️ ${state.shapeInstance.wrongMsg || '면이 서로 겹쳐 입체가 되지 않습니다!'}`;
      errorAlertBadge.classList.remove('hidden');
    } else if (val >= 90) {
      statusBadge.innerText = '입체도형 완성 (3D 상태)';
      statusBadge.className = 'absolute bottom-3 left-3 bg-emerald-500 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-emerald-200 animate-bounce';
      errorAlertBadge.classList.add('hidden');
    } else {
      statusBadge.innerText = `스트링 텐션 견인 중 (${Math.round(val)}%)`;
      statusBadge.className = 'absolute bottom-3 left-3 bg-amber-500 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md';
      errorAlertBadge.classList.add('hidden');
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    // 자동 재생 모드 처리
    if (state.isAutoPlaying) {
      state.targetTension += state.autoPlayDirection * 0.008;
      if (state.targetTension >= 1.0) {
        state.targetTension = 1.0;
        state.autoPlayDirection = -1;
      } else if (state.targetTension <= 0.0) {
        state.targetTension = 0.0;
        state.autoPlayDirection = 1;
      }
      updateSliderUI(state.targetTension * 100);
    }

    // 텐션 값 선형 보간 (Lerp)
    state.currentTension += (state.targetTension - state.currentTension) * 0.15;
    const t = state.currentTension;

    // 3D 도형 변형 적용
    if (state.shapeInstance) {
      const { pivots, type, updateBending, holeMarkers } = state.shapeInstance;

      // 1) 계층적 힌지 피벗 회전
      if (pivots && pivots.length > 0) {
        pivots.forEach(({ group, axis, targetAngle }) => {
          group.rotation[axis] = targetAngle * t;
        });
      }

      // 2) 원기둥 곡면 벤딩 업데이트
      if (type === 'cylinder' && typeof updateBending === 'function') {
        updateBending(t);
      }

      // 3) 실(String) 정점 좌표 추적 업데이트
      if (state.showStrings && holeMarkers && holeMarkers.length > 1 && state.stringLineMesh) {
        state.shapeInstance.root.updateMatrixWorld(true);
        const posAttr = state.stringLineMesh.geometry.attributes.position;
        const tempVec = new THREE.Vector3();

        for (let i = 0; i < holeMarkers.length; i++) {
          holeMarkers[i].getWorldPosition(tempVec);
          posAttr.setXYZ(i, tempVec.x, tempVec.y + 0.02, tempVec.z);
        }
        posAttr.needsUpdate = true;
        state.stringLineMesh.geometry.setDrawRange(0, holeMarkers.length);
        state.stringLineMesh.visible = true;
      } else if (state.stringLineMesh) {
        state.stringLineMesh.visible = false;
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // ==========================================
  // 6. UI 컨트롤러 바인딩
  // ==========================================

  // 슬라이더 드래그
  pullSlider.addEventListener('input', (e) => {
    state.isAutoPlaying = false;
    const val = parseFloat(e.target.value);
    state.targetTension = val / 100.0;
    updateSliderUI(val);
  });

  // PULL 손잡이 버튼
  const btnPullTag = document.getElementById('btn-pull-tag');
  btnPullTag.addEventListener('click', () => {
    state.isAutoPlaying = false;
    if (state.targetTension > 0.5) {
      state.targetTension = 0.0;
      updateSliderUI(0);
    } else {
      state.targetTension = 1.0;
      updateSliderUI(100);
      if (!state.shapeInstance.isWrong && typeof confetti === 'function') {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      }
    }
  });

  // 스냅 버튼 & 자동 재생
  document.getElementById('btn-snap-flat').addEventListener('click', () => {
    state.isAutoPlaying = false;
    state.targetTension = 0.0;
    updateSliderUI(0);
  });

  document.getElementById('btn-snap-solid').addEventListener('click', () => {
    state.isAutoPlaying = false;
    state.targetTension = 1.0;
    updateSliderUI(100);
  });

  document.getElementById('btn-auto-animate').addEventListener('click', () => {
    state.isAutoPlaying = !state.isAutoPlaying;
    const btn = document.getElementById('btn-auto-animate');
    if (state.isAutoPlaying) {
      btn.innerText = '⏸ 정지';
      btn.className = 'px-3 py-1.5 bg-indigo-600 border border-indigo-600 rounded-xl text-xs font-bold text-white transition shadow-sm';
    } else {
      btn.innerText = '▶ 자동 재생';
      btn.className = 'px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-sm';
    }
  });

  // 도형 탭 전환
  const shapeTabs = document.querySelectorAll('.shape-tab');
  shapeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      shapeTabs.forEach(t => {
        t.classList.remove('active');
        t.className = 'shape-tab flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition text-slate-600 hover:bg-white/80';
      });
      tab.classList.add('active');
      tab.className = 'shape-tab active flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm bg-indigo-600 text-white';
      
      const shapeKey = tab.getAttribute('data-shape');
      loadShape(shapeKey);
    });
  });

  // 정육면체 전개도 변형 선택
  const cubeNetSelect = document.getElementById('cube-net-select');
  cubeNetSelect.addEventListener('change', (e) => {
    loadShape('cube', e.target.value);
  });

  // 뷰어 모드 토글 (와이어프레임, 실, 꼭짓점, 카메라 리셋)
  function applyWireframeMode() {
    if (!state.shapeInstance) return;
    state.shapeInstance.root.traverse(child => {
      if (child.isMesh && child.material && !(child.geometry instanceof THREE.SphereGeometry)) {
        child.material.wireframe = state.isWireframe;
        child.material.transparent = state.isWireframe;
        child.material.opacity = state.isWireframe ? 0.35 : 1.0;
      }
    });
  }

  function applyVerticesVisibility() {
    if (!state.shapeInstance || !state.shapeInstance.vertexMarkers) return;
    state.shapeInstance.vertexMarkers.forEach(vm => {
      vm.visible = state.showVertices;
    });
  }

  document.getElementById('toggle-wireframe').addEventListener('click', () => {
    state.isWireframe = !state.isWireframe;
    applyWireframeMode();
  });

  document.getElementById('toggle-strings').addEventListener('click', () => {
    state.showStrings = !state.showStrings;
    if (state.stringLineMesh) state.stringLineMesh.visible = state.showStrings;
  });

  document.getElementById('toggle-vertices').addEventListener('click', () => {
    state.showVertices = !state.showVertices;
    applyVerticesVisibility();
    const btn = document.getElementById('toggle-vertices');
    btn.className = state.showVertices
      ? 'p-2 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-700 shadow-sm'
      : 'p-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 shadow-sm';
  });

  document.getElementById('reset-camera').addEventListener('click', () => {
    camera.position.set(0, 5.0, 5.5);
    controls.target.set(0, 0, 0);
    controls.update();
  });

  // 초등 교육과정 필터 선택
  const curriculumFilter = document.getElementById('curriculum-filter');
  curriculumFilter.addEventListener('change', (e) => {
    const val = e.target.value;
    shapeTabs.forEach(tab => {
      const sKey = tab.getAttribute('data-shape');
      const def = ShapeDefinitions[sKey];
      if (val === 'all' || def.curriculum === val) {
        tab.style.display = 'flex';
      } else {
        tab.style.display = 'none';
      }
    });
  });

  // 우측 패널 정보 갱신
  function updateShapeInfoPanel(shapeKey) {
    const data = ShapeDefinitions[shapeKey];
    if (!data) return;

    document.getElementById('shape-grade-badge').innerText = data.gradeBadge;
    document.getElementById('shape-title').innerText = data.title;
    document.getElementById('shape-icon-large').innerText = data.icon;
    document.getElementById('count-faces').innerText = data.faces;
    document.getElementById('type-faces').innerText = data.facesDesc;
    document.getElementById('count-edges').innerText = data.edges;
    document.getElementById('count-vertices').innerText = data.vertices;
    document.getElementById('shape-mechanism-desc').innerText = data.mechanism;

    const eduList = document.getElementById('shape-edu-points');
    eduList.innerHTML = '';
    data.eduPoints.forEach(point => {
      const li = document.createElement('li');
      li.innerText = point;
      eduList.appendChild(li);
    });
  }

  // ==========================================
  // 7. 모달 1: 원기둥 수학 탐구 랩 ($2\pi r$)
  // ==========================================
  const modalMathLab = document.getElementById('modal-math-lab');
  const btnMathLab = document.getElementById('btn-math-lab');
  const sliderRadius = document.getElementById('slider-radius');
  const sliderHeight = document.getElementById('slider-height');
  const valRadius = document.getElementById('val-radius');
  const valHeight = document.getElementById('val-height');
  const calcFormula = document.getElementById('calc-formula');
  const calcWidthExact = document.getElementById('calc-width-exact');

  function updateMathLab() {
    const r = parseFloat(sliderRadius.value);
    const h = parseFloat(sliderHeight.value);
    valRadius.innerText = `${r.toFixed(1)} cm`;
    valHeight.innerText = `${h.toFixed(1)} cm`;

    const circumference = 2 * 3.14 * r;
    calcFormula.innerText = `2 × 3.14 × ${r.toFixed(1)} = ${circumference.toFixed(2)} cm`;
    calcWidthExact.innerText = `${circumference.toFixed(2)} cm`;
  }

  btnMathLab.addEventListener('click', () => {
    modalMathLab.classList.remove('hidden');
    updateMathLab();
  });

  sliderRadius.addEventListener('input', updateMathLab);
  sliderHeight.addEventListener('input', updateMathLab);

  // ==========================================
  // 8. 모달 2: 스피드 전개도 맞히기 퀴즈
  // ==========================================
  const modalQuiz = document.getElementById('modal-quiz');
  const btnQuizModal = document.getElementById('btn-quiz-modal');
  const quizDiagramPreview = document.getElementById('quiz-diagram-preview');
  const quizHint = document.getElementById('quiz-hint');
  const quizOptionsContainer = document.getElementById('quiz-options');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizScoreText = document.getElementById('quiz-score');
  const btnNextQuiz = document.getElementById('btn-next-quiz');

  const quizData = [
    {
      icon: "📐",
      targetShape: "triPrism",
      hint: "힌트: 합동인 정삼각형 2개와 직사각형 3개로 구성된 5면체입니다.",
      options: ["직육면체", "삼각기둥", "삼각뿔", "원기둥"],
      answer: 1,
      desc: "정답입니다! 밑면이 삼각형이므로 '삼각기둥'입니다. 줄을 당기면 양쪽 정삼각형 뚜껑이 닫힙니다!"
    },
    {
      icon: "⛺",
      targetShape: "hexPyramid",
      hint: "힌트: 정육각형 밑면 1개 주변으로 이등변삼각형 6개가 꽃잎처럼 펼쳐져 있습니다.",
      options: ["육각뿔", "육각기둥", "오각뿔", "원뿔"],
      answer: 0,
      desc: "정답입니다! 6개의 이등변삼각형이 한 꼭짓점으로 모여 육각뿔을 완성합니다."
    },
    {
      icon: "📦",
      targetShape: "cube",
      hint: "힌트: 6개의 정사각형 면이 모두 합동이며 마주보는 면끼리 평행합니다.",
      options: ["원기둥", "사각뿔", "정육면체", "직육면체"],
      answer: 2,
      desc: "정답입니다! 6개의 정사각형으로 이루어진 정육면체입니다."
    }
  ];

  let currentQuizIndex = 0;
  let score = 0;

  function loadQuiz(index) {
    const q = quizData[index];
    quizDiagramPreview.innerText = q.icon;
    quizHint.innerText = q.hint;
    quizFeedback.classList.add('hidden');
    quizOptionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerText = opt;
      btn.addEventListener('click', () => handleQuizAnswer(idx, q));
      quizOptionsContainer.appendChild(btn);
    });

    quizScoreText.innerText = `진행: ${index + 1} / ${quizData.length} (정답: ${score})`;
  }

  function handleQuizAnswer(selectedIndex, q) {
    const buttons = quizOptionsContainer.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    if (selectedIndex === q.answer) {
      score++;
      buttons[selectedIndex].classList.add('correct');
      quizFeedback.className = 'p-3 rounded-xl text-center text-xs font-bold bg-emerald-100 text-emerald-800 block';
      quizFeedback.innerText = `🎉 ${q.desc}`;
      if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }

      loadShape(q.targetShape);
      shapeTabs.forEach(t => {
        if (t.getAttribute('data-shape') === q.targetShape) {
          shapeTabs.forEach(x => {
            x.classList.remove('active');
            x.className = 'shape-tab flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition text-slate-600 hover:bg-white/80';
          });
          t.classList.add('active');
          t.className = 'shape-tab active flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm bg-indigo-600 text-white';
        }
      });
      setTimeout(() => {
        state.targetTension = 1.0;
        updateSliderUI(100);
      }, 500);

    } else {
      buttons[selectedIndex].classList.add('wrong');
      buttons[q.answer].classList.add('correct');
      quizFeedback.className = 'p-3 rounded-xl text-center text-xs font-bold bg-rose-100 text-rose-800 block';
      quizFeedback.innerText = `앗 아쉬워요! 정답은 '${q.options[q.answer]}'입니다.`;
    }
    quizScoreText.innerText = `진행: ${currentQuizIndex + 1} / ${quizData.length} (정답: ${score})`;
  }

  btnQuizModal.addEventListener('click', () => {
    modalQuiz.classList.remove('hidden');
    currentQuizIndex = 0;
    score = 0;
    loadQuiz(0);
  });

  btnNextQuiz.addEventListener('click', () => {
    currentQuizIndex = (currentQuizIndex + 1) % quizData.length;
    loadQuiz(currentQuizIndex);
  });

  // ==========================================
  // 9. 모달 3: 오답 전개도 실험실 (활동 3)
  // ==========================================
  const modalWrongNet = document.getElementById('modal-wrong-net');
  const btnLabWrongNet = document.getElementById('btn-lab-wrong-net');
  const wrongCaseBtns = document.querySelectorAll('.btn-wrong-case');
  const wrongCaseDesc = document.getElementById('wrong-case-desc');
  const btnLoadWrongInViewer = document.getElementById('btn-load-wrong-in-viewer');

  let selectedWrongCase = 'overlap';

  const wrongDescriptions = {
    overlap: "이 전개도는 접었을 때 두 면이 같은 위치로 겹쳐지고, 반대편 한 면은 뻥 뚫리게 됩니다. '3D 뷰어로 당겨보기'를 눌러 줄을 당겨보세요!",
    openTop: "이 전개도는 윗면 뚜껑이 엉뚱한 위치에 붙어 있어, 줄을 당겨도 상자가 닫히지 않고 앞쪽으로 면이 이중 돌출됩니다."
  };

  btnLabWrongNet.addEventListener('click', () => {
    modalWrongNet.classList.remove('hidden');
  });

  wrongCaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wrongCaseBtns.forEach(b => {
        b.className = 'btn-wrong-case p-3 rounded-xl border border-slate-200 bg-slate-50 text-left hover:bg-slate-100';
      });
      btn.className = 'btn-wrong-case active p-3 rounded-xl border-2 border-rose-400 bg-rose-50 text-left';
      selectedWrongCase = btn.getAttribute('data-wrong');
      wrongCaseDesc.innerText = wrongDescriptions[selectedWrongCase];
    });
  });

  btnLoadWrongInViewer.addEventListener('click', () => {
    modalWrongNet.classList.add('hidden');
    shapeTabs.forEach(t => t.classList.remove('active'));
    
    if (selectedWrongCase === 'overlap') {
      loadShape('wrong_overlap');
    } else {
      loadShape('wrong_openTop');
    }

    // 0.5초 후 자동으로 줄을 당겨서 오류를 보여줌
    setTimeout(() => {
      state.targetTension = 1.0;
      updateSliderUI(100);
    }, 400);
  });

  // ==========================================
  // 10. 모달 4: DIY 도안 인쇄 센터 (SVG 블루프린트)
  // ==========================================
  const modalDiy = document.getElementById('modal-diy');
  const btnDiyModal = document.getElementById('btn-diy-modal');
  const btnOpenDiyFromCard = document.getElementById('btn-open-diy-from-card');
  const svgContainer = document.getElementById('svg-blueprint-container');
  const printShapeBtns = document.querySelectorAll('.btn-print-shape');
  const btnTriggerPrint = document.getElementById('btn-trigger-print');

  function renderSvgBlueprint(shapeKey) {
    let svgContent = '';
    const strokeCut = '#1e293b';
    const strokeFold = '#64748b';
    const strokeHole = '#ef4444';

    switch (shapeKey) {
      case 'cuboid':
        svgContent = `
          <svg viewBox="0 0 500 420" width="100%" height="320" xmlns="http://www.w3.org/2000/svg" class="max-w-md">
            <rect x="180" y="40" width="140" height="90" fill="#f8fafc" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="180" y="130" width="140" height="70" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="180" y="200" width="140" height="90" fill="#f8fafc" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="180" y="290" width="140" height="70" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="110" y="200" width="70" height="90" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="320" y="200" width="70" height="90" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <path d="M180,40 L320,40 L320,200 L390,200 L390,290 L320,290 L320,360 L180,360 L180,290 L110,290 L110,200 L180,200 Z" fill="none" stroke="${strokeCut}" stroke-width="2.5"/>
            <circle cx="120" cy="210" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="380" cy="210" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="190" cy="50" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="310" cy="50" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <text x="250" y="250" font-size="13" font-weight="bold" fill="#475569" text-anchor="middle">밑면 (W x D)</text>
            <text x="250" y="385" font-size="11" font-weight="bold" fill="#ea580c" text-anchor="middle">▼ [PULL 손잡이 끈 통과선] ▼</text>
          </svg>
        `;
        break;

      case 'triPrism':
        svgContent = `
          <svg viewBox="0 0 500 380" width="100%" height="320" xmlns="http://www.w3.org/2000/svg" class="max-w-md">
            <rect x="80" y="110" width="110" height="150" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="190" y="110" width="120" height="150" fill="#f8fafc" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="310" y="110" width="110" height="150" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <polygon points="190,110 310,110 250,15" fill="#e0e7ff" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <polygon points="190,260 310,260 250,355" fill="#e0e7ff" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <path d="M80,110 L190,110 L250,15 L310,110 L420,110 L420,260 L310,260 L250,355 L190,260 L80,260 Z" fill="none" stroke="${strokeCut}" stroke-width="2.5"/>
            <circle cx="250" cy="30" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="250" cy="340" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="95" cy="185" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="405" cy="185" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <text x="250" y="190" font-size="13" font-weight="bold" fill="#4338ca" text-anchor="middle">중앙 옆면</text>
          </svg>
        `;
        break;

      case 'hexPyramid':
        svgContent = `
          <svg viewBox="0 0 500 420" width="100%" height="320" xmlns="http://www.w3.org/2000/svg" class="max-w-md">
            <polygon points="250,150 295,175 295,225 250,250 205,225 205,175" fill="#e0e7ff" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <path d="M250,150 L250,40 L295,175 L385,150 L295,225 L385,250 L250,250 L250,360 L205,225 L115,250 L205,175 L115,150 Z" fill="#f8fafc" stroke="${strokeCut}" stroke-width="2.5"/>
            <circle cx="250" cy="55" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="370" cy="155" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="370" cy="245" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="250" cy="345" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="130" cy="245" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="130" cy="155" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <text x="250" y="205" font-size="12" font-weight="bold" fill="#4338ca" text-anchor="middle">정육각형 밑면</text>
          </svg>
        `;
        break;

      case 'cube':
      default:
        svgContent = `
          <svg viewBox="0 0 500 400" width="100%" height="320" xmlns="http://www.w3.org/2000/svg" class="max-w-md">
            <rect x="200" y="30" width="90" height="90" fill="#f8fafc" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="200" y="120" width="90" height="90" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="200" y="210" width="90" height="90" fill="#e0e7ff" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="200" y="300" width="90" height="90" fill="#f8fafc" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="110" y="210" width="90" height="90" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <rect x="290" y="210" width="90" height="90" fill="#f1f5f9" stroke="${strokeFold}" stroke-dasharray="4" stroke-width="2"/>
            <path d="M200,30 L290,30 L290,210 L380,210 L380,300 L290,300 L290,390 L200,390 L200,300 L110,300 L110,210 L200,210 Z" fill="none" stroke="${strokeCut}" stroke-width="2.5"/>
            <circle cx="210" cy="40" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="280" cy="40" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="120" cy="220" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="370" cy="220" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="210" cy="380" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <circle cx="280" cy="380" r="5" fill="#fee2e2" stroke="${strokeHole}" stroke-width="2"/>
            <text x="245" y="260" font-size="13" font-weight="bold" fill="#4338ca" text-anchor="middle">바닥면 (Center)</text>
          </svg>
        `;
        break;
    }
    svgContainer.innerHTML = svgContent;
  }

  function openDiyModal(defaultShape = 'cube') {
    modalDiy.classList.remove('hidden');
    printShapeBtns.forEach(btn => {
      const pKey = btn.getAttribute('data-print');
      if (pKey === defaultShape) {
        btn.className = 'btn-print-shape active px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white';
      } else {
        btn.className = 'btn-print-shape px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200';
      }
    });
    renderSvgBlueprint(defaultShape);
  }

  btnDiyModal.addEventListener('click', () => openDiyModal(state.currentShape));
  btnOpenDiyFromCard.addEventListener('click', () => openDiyModal(state.currentShape));

  printShapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const shapeKey = btn.getAttribute('data-print');
      openDiyModal(shapeKey);
    });
  });

  btnTriggerPrint.addEventListener('click', () => {
    window.print();
  });

  // 모든 모달 닫기
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      modalMathLab.classList.add('hidden');
      modalQuiz.classList.add('hidden');
      modalWrongNet.classList.add('hidden');
      modalDiy.classList.add('hidden');
    });
  });

  [modalMathLab, modalQuiz, modalWrongNet, modalDiy].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // ==========================================
  // 11. 초기 구동 실행
  // ==========================================
  loadShape('cube');
  animate();
});
