(function () {
  if (window.__screenPetLoaded) return;
  window.__screenPetLoaded = true;

  // ============ 펫 DOM 생성 ============
  const pet = document.createElement('div');
  pet.id = 'screen-pet';
  pet.innerHTML = `
    <div class="pet-inner">
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <!-- 꼬리 -->
        <path class="pet-tail" d="M18 52 Q6 48 10 32"
              stroke="#c8663d" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- 몸통 -->
        <ellipse class="pet-body-shape" cx="42" cy="52" rx="22" ry="16" fill="#e89072"/>
        <!-- 다리들 -->
        <rect class="pet-leg pet-leg-back-1" x="28" y="60" width="6" height="11" fill="#c8663d" rx="2"/>
        <rect class="pet-leg pet-leg-back-2" x="36" y="60" width="6" height="11" fill="#b55432" rx="2"/>
        <rect class="pet-leg pet-leg-front-1" x="48" y="60" width="6" height="11" fill="#c8663d" rx="2"/>
        <rect class="pet-leg pet-leg-front-2" x="56" y="60" width="6" height="11" fill="#b55432" rx="2"/>
        <!-- 머리 -->
        <circle class="pet-head" cx="58" cy="38" r="14" fill="#e89072"/>
        <!-- 귀 -->
        <path d="M48 30 L50 20 L55 27 Z" fill="#c8663d"/>
        <path d="M62 27 L66 19 L68 29 Z" fill="#c8663d"/>
        <path d="M50 26 L51 22 L53 26 Z" fill="#ffc4a8"/>
        <path d="M64 25 L65 22 L66 27 Z" fill="#ffc4a8"/>
        <!-- 눈 -->
        <ellipse class="pet-eye pet-eye-left" cx="54" cy="37" rx="1.8" ry="2.5" fill="#1a0e08"/>
        <ellipse class="pet-eye pet-eye-right" cx="62" cy="37" rx="1.8" ry="2.5" fill="#1a0e08"/>
        <circle cx="54.5" cy="36.3" r="0.6" fill="#fff"/>
        <circle cx="62.5" cy="36.3" r="0.6" fill="#fff"/>
        <!-- 코 -->
        <path d="M57 41 L59 41 L58 42.5 Z" fill="#7a2d2d"/>
        <!-- 입 -->
        <path d="M58 42.5 Q56 44 55 43 M58 42.5 Q60 44 61 43"
              stroke="#7a2d2d" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <!-- 볼터치 -->
        <circle cx="50" cy="42" r="2" fill="#ff9a9a" opacity="0.5"/>
        <circle cx="66" cy="42" r="2" fill="#ff9a9a" opacity="0.5"/>
      </svg>
      <div class="pet-thought"></div>
    </div>
  `;
  document.body.appendChild(pet);

  // ============ 상태 변수 ============
  const PET_W = 80;
  const PET_H = 80;
  const GRAVITY = 0.6;

  let x = window.innerWidth - PET_W - 40;
  let y = window.innerHeight - PET_H - 10;
  let vx = 0;
  let vy = 0;
  let facing = -1; // -1: 왼쪽, 1: 오른쪽
  let state = 'idle';
  let stateTimer = 60;
  let targetX = x;
  let mouseX = -1000;
  let mouseY = -1000;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let lastMouseMoveTime = 0;

  const groundY = () => window.innerHeight - PET_H - 10;

  // ============ 말풍선 ============
  const thought = pet.querySelector('.pet-thought');
  const thoughts = ['냥~', '♡', '와~', '!', '쮸', '헷'];
  function showThought(text) {
    thought.textContent = text || thoughts[Math.floor(Math.random() * thoughts.length)];
    thought.classList.add('show');
    setTimeout(() => thought.classList.remove('show'), 1500);
  }

  // ============ 마우스 이벤트 ============
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMouseMoveTime = Date.now();
    if (isDragging) {
      x = e.clientX - dragOffsetX;
      y = e.clientY - dragOffsetY;
      vx = 0;
      vy = 0;
    }
  }, { passive: true });

  pet.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragOffsetX = e.clientX - x;
    dragOffsetY = e.clientY - y;
    pet.classList.add('dragging');
    state = 'held';
    showThought('?!');
    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      pet.classList.remove('dragging');
      state = 'falling';
      vy = 0;
    }
  });

  // 더블클릭: 반가워하며 점프
  pet.addEventListener('dblclick', (e) => {
    state = 'jumping';
    vy = -14;
    vx = 0;
    showThought('♡');
    e.preventDefault();
  });

  // 우클릭: 펫 숨기기/보이기
  pet.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    pet.classList.toggle('hidden');
  });

  // ============ 상태 전이 ============
  function pickRandomTarget() {
    const margin = 40;
    targetX = margin + Math.random() * (window.innerWidth - PET_W - margin * 2);
  }

  function chooseNextAction() {
    const r = Math.random();
    if (r < 0.35) {
      state = 'walking';
      pickRandomTarget();
      stateTimer = 300;
    } else if (r < 0.6) {
      state = 'running';
      pickRandomTarget();
      stateTimer = 180;
    } else if (r < 0.8) {
      state = 'jumping';
      vy = -11 - Math.random() * 3;
      vx = (Math.random() - 0.5) * 6;
      stateTimer = 80;
      if (Math.random() < 0.3) showThought();
    } else if (r < 0.92) {
      state = 'sitting';
      stateTimer = 200 + Math.random() * 200;
    } else {
      state = 'idle';
      stateTimer = 100 + Math.random() * 100;
    }
  }

  // ============ 메인 루프 ============
  function update() {
    stateTimer--;

    if (!isDragging) {
      // 커서 추적: 커서가 하단에서 움직일 때 가까우면 쫓아감
      const cursorActive = Date.now() - lastMouseMoveTime < 800;
      const cursorLow = mouseY > window.innerHeight - 220;
      const cursorDist = mouseX - (x + PET_W / 2);
      const cursorAbsDist = Math.abs(cursorDist);

      if (
        cursorActive && cursorLow &&
        cursorAbsDist < 400 && cursorAbsDist > 30 &&
        state !== 'jumping' && state !== 'falling'
      ) {
        state = 'chasing';
        targetX = mouseX - PET_W / 2;
        stateTimer = 60;
      }

      // 상태별 처리
      if (state === 'idle' || state === 'sitting') {
        vx = 0;
        if (stateTimer <= 0) chooseNextAction();
      } else if (state === 'walking') {
        const dx = targetX - x;
        if (Math.abs(dx) < 3 || stateTimer <= 0) {
          state = 'idle';
          stateTimer = 60 + Math.random() * 120;
        } else {
          vx = Math.sign(dx) * 1.8;
          facing = Math.sign(dx);
        }
      } else if (state === 'running') {
        const dx = targetX - x;
        if (Math.abs(dx) < 3 || stateTimer <= 0) {
          state = 'idle';
          stateTimer = 30 + Math.random() * 60;
        } else {
          vx = Math.sign(dx) * 4.5;
          facing = Math.sign(dx);
        }
      } else if (state === 'chasing') {
        const dx = targetX - x;
        if (Math.abs(dx) < 10) {
          state = 'idle';
          stateTimer = 40;
          if (Math.random() < 0.5) showThought();
        } else {
          vx = Math.sign(dx) * 5.5;
          facing = Math.sign(dx);
        }
      } else if (state === 'jumping' || state === 'falling') {
        vy += GRAVITY;
        if (y >= groundY() && vy > 0) {
          y = groundY();
          vy = 0;
          vx = 0;
          state = 'idle';
          stateTimer = 40;
        }
      }

      // 물리 적용
      x += vx;
      y += vy;

      // 바닥에 고정 (점프/낙하 아닐 때)
      if (state !== 'jumping' && state !== 'falling' && state !== 'held') {
        if (y < groundY()) {
          vy += GRAVITY;
          y += vy;
          if (y >= groundY()) {
            y = groundY();
            vy = 0;
          }
        } else {
          y = groundY();
          vy = 0;
        }
      }

      // 좌우 경계
      if (x < 0) {
        x = 0;
        vx = Math.abs(vx);
        facing = 1;
        if (state === 'walking' || state === 'running') pickRandomTarget();
      }
      if (x > window.innerWidth - PET_W) {
        x = window.innerWidth - PET_W;
        vx = -Math.abs(vx);
        facing = -1;
        if (state === 'walking' || state === 'running') pickRandomTarget();
      }
    }

    // DOM 업데이트
    pet.style.transform = `translate(${x}px, ${y}px)`;
    const inner = pet.querySelector('.pet-inner');
    inner.style.transform = `scaleX(${facing})`;
    pet.dataset.state = state;

    requestAnimationFrame(update);
  }

  update();

  // 창 크기 변경 대응
  window.addEventListener('resize', () => {
    if (y > groundY()) y = groundY();
    if (x > window.innerWidth - PET_W) x = window.innerWidth - PET_W;
  });

  // 처음 등장 인사
  setTimeout(() => showThought('안녕!'), 500);
})();
