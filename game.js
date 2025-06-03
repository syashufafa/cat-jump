const bgm = document.getElementById('bgm'); //배경음악불러오기
const catImg = new Image();
catImg.src = 'sia.png'; // 파일명을 실제 저장한 이름으로 맞추세요
const bgImg = new Image();

bgImg.src = 'background_image1.jpg'; // 실제 파일명에 맞게 수정
const bgImg2 = new Image();
bgImg2.src = 'background_image2.jpg'; // 두 번째 배경 이미지 추가
const bgImg3 = new Image();
bgImg3.src = 'background_image3.jpg'; // 세 번째 배경 이미지 추가

// 브라우저 정책상 사용자 상호작용 후에만 재생 가능하므로, 첫 입력 시 재생
let bgmStarted = false;
function startBgm() {
  if (!bgmStarted) {
    bgm.volume = 0.5; // 볼륨 조절(0~1)
    bgm.play();
    bgmStarted = true;
  }
}
// 캔버스와 컨텍스트 가져오기
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

// 고양이(플레이어) 기본 정보
let cat = {
  x: CANVAS_WIDTH / 2 - 20,
  y: CANVAS_HEIGHT - 100,
  width: 40,
  height: 40,
  color: '#ff9800',
  vy: 0,           // y축 속도(중력/점프)
  jumpPower: -12,  // 점프 힘(음수: 위로)
  gravity: 0.5,    // 중력(양수: 아래로)
  vx: 0,           // x축 속도(좌우 이동)
  speed: 5         // 좌우 이동 속도
};

let isOnGround = false; // 고양이가 바닥에 있는지 여부

// 발판 정보
let platforms = [];
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 15;
const PLATFORM_GAP = 100; // 발판 간격

// 점수 및 게임 오버
let score = 0;
let highScore = 0; // 최고점수 추가
let isGameOver = false;

// 좌우 이동 상태
let leftPressed = false;
let rightPressed = false;

// 발판 초기화 함수
function initPlatforms() {
  platforms = [];
  // 첫 번째 발판은 바닥 근처에 고정
  platforms.push({
    x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT
  });
  // 나머지 발판은 위쪽에 고르게 분포
  for (let i = 1; i < 6; i++) {
    let x = Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH);
    let y = CANVAS_HEIGHT - 60 - i * PLATFORM_GAP;
    platforms.push({ x, y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT });
  }
}

// 발판 그리기
function drawPlatforms() {
  ctx.fillStyle = '#4caf50';
  platforms.forEach(pf => {
    ctx.fillRect(pf.x, pf.y, pf.width, pf.height);
  });
}

// 발판 이동 및 재생성
function updatePlatforms(dy) {
  platforms.forEach(pf => {
    pf.y += dy; // 발판을 아래로 이동
  });

  // 화면 아래로 사라진 발판 재생성
  if (platforms[0].y > CANVAS_HEIGHT) {
    platforms.shift();
    let x = Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH);
    let y = platforms[platforms.length - 1].y - PLATFORM_GAP;
    platforms.push({ x, y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT });
  }
}

// 고양이와 발판 충돌 체크
function checkPlatformCollision() {
  if (cat.vy > 0) { // 내려올 때만 체크
    platforms.forEach(pf => {
      if (
        cat.x + cat.width > pf.x &&
        cat.x < pf.x + pf.width &&
        cat.y + cat.height > pf.y &&
        cat.y + cat.height < pf.y + pf.height &&
        cat.vy > 0
      ) {
        cat.y = pf.y - cat.height;
        cat.vy = cat.jumpPower;
        isOnGround = false;
      }
    });
  }
}

// 점프 함수
function jump() {
  if (isOnGround && !isGameOver) {
    cat.vy = cat.jumpPower;
    isOnGround = false;
    startBgm();
  }
}

// 키보드 입력 처리
document.addEventListener('keydown', function(e) {
  startBgm();
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = true;
  if (e.code === 'Space') {
    if (isGameOver) {
      restartGame();
    } else {
      jump();
    }
  }
});
document.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') leftPressed = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') rightPressed = false;
});

// 모바일 터치 입력 (좌/우 화면 터치)
canvas.addEventListener('touchstart', function(e) {
  startBgm();
  if (isGameOver) {
    restartGame();
    return;
  }
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX < CANVAS_WIDTH / 2) {
    leftPressed = true;
  } else {
    rightPressed = true;
  }
  // 점프도 동시에 지원
  jump();
});
canvas.addEventListener('touchend', function(e) {
  leftPressed = false;
  rightPressed = false;
});
// 라운드 사각형 그리기 함수
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') stroke = true;
  if (typeof radius === 'undefined') radius = 5;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
// 고양이 이미지가 로드되었으면 이미지로, 아니면 사각형으로 대체
if (catImg.complete) {
  ctx.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);
} else {
  ctx.fillStyle = cat.color;
  ctx.fillRect(cat.x, cat.y, cat.width, cat.height);
}
// 심플 고양이 그리기 함수
/*function drawCat(ctx, x, y, w, h) {
  ctx.save();
  // 귀
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + h * 0.2);
  ctx.lineTo(x + w * 0.35, y);
  ctx.lineTo(x + w * 0.5, y + h * 0.2);
  ctx.closePath();
  ctx.fillStyle = "#ff9800";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.8, y + h * 0.2);
  ctx.lineTo(x + w * 0.65, y);
  ctx.lineTo(x + w * 0.5, y + h * 0.2);
  ctx.closePath();
  ctx.fillStyle = "#ff9800";
  ctx.fill();

  // 얼굴(원)
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 5, w / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#ffb74d";
  ctx.fill();
  ctx.strokeStyle = "#ff9800";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 눈
  ctx.beginPath();
  ctx.arc(x + w * 0.35, y + h * 0.55, w * 0.08, 0, Math.PI * 2);
  ctx.arc(x + w * 0.65, y + h * 0.55, w * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#333";
  ctx.fill();

  // 코
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.65, w * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = "#e57373";
  ctx.fill();

  ctx.restore();
}
  */
// 화면 그리기 함수
function draw() {
        if (score >= 1500) {
        if (bgImg3.complete) {
            ctx.drawImage(bgImg3, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // 이미지가 아직 안 불러와졌을 때는 그라데이션 배경
            let bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            bgGradient.addColorStop(0, "#ffe082");
            bgGradient.addColorStop(1, "#e0f7fa");
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    } else if (score >= 500) {
        if (bgImg2.complete) {
            ctx.drawImage(bgImg2, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // 이미지가 아직 안 불러와졌을 때는 그라데이션 배경
            let bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            bgGradient.addColorStop(0, "#ffb3e6");
            bgGradient.addColorStop(1, "#e0f7fa");
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    } else {
        if (bgImg.complete) {
            ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // 이미지가 아직 안 불러와졌을 때는 그라데이션 배경
            let bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            bgGradient.addColorStop(0, "#b3e0ff");
            bgGradient.addColorStop(1, "#e0f7fa");
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

  // 발판 그리기 (라운드, 그림자)
  platforms.forEach(pf => {
    ctx.save();
    ctx.shadowColor = "#4caf50";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#81c784";
    roundRect(ctx, pf.x, pf.y, pf.width, pf.height, 8, true, false);
    ctx.restore();
  });

  // 고양이 그리기 (얼굴+귀)
  /*drawCat(ctx, cat.x, cat.y, cat.width, cat.height);*/
  if (catImg.complete) {
    ctx.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);
  } else {
    ctx.fillStyle = cat.color;
    ctx.fillRect(cat.x, cat.y, cat.width, cat.height);
  }

  // 바닥(선) 그리기
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT - 40);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 40);
  ctx.stroke();

  // 점수 표시 (좌측 상단)
  ctx.fillStyle = '#222';
  ctx.font = 'bold 24px Arial Rounded MT Bold, Arial, sans-serif';
  ctx.fillText('높이: ' + score + 'm', 20, 40);

  // 최고점수 표시 (우측 상단)
  ctx.fillStyle = '#d32f2f';
  ctx.font = 'bold 20px Arial Rounded MT Bold, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('최고점수: ' + highScore + 'm', CANVAS_WIDTH - 20, 40);
  ctx.textAlign = 'left'; // 원래대로 복구

  // 게임 오버 메시지
  if (isGameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial Rounded MT Bold, Arial, sans-serif';
    ctx.fillText('게임 오버!', CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2 - 20);
    ctx.font = '24px Arial Rounded MT Bold, Arial, sans-serif';
    ctx.fillText('스페이스바/터치로 재시작', CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2 + 20);
  }
}

// 물리/위치 업데이트 함수
function update() {
  if (isGameOver) return;

  // 좌우 이동 처리
  if (leftPressed) cat.vx = -cat.speed;
  else if (rightPressed) cat.vx = cat.speed;
  else cat.vx = 0;

  cat.x += cat.vx;

  // 화면 밖으로 나가지 않게 처리
  if (cat.x < 0) cat.x = 0;
  if (cat.x + cat.width > CANVAS_WIDTH) cat.x = CANVAS_WIDTH - cat.width;

  // 중력 적용
  cat.vy += cat.gravity;
  cat.y += cat.vy;

  // 발판 충돌 체크
  checkPlatformCollision();

  // 고양이가 일정 높이 이상 올라가면 화면 스크롤 효과
  if (cat.y < CANVAS_HEIGHT / 2) {
    let dy = (CANVAS_HEIGHT / 2 - cat.y);
    cat.y = CANVAS_HEIGHT / 2;
    updatePlatforms(dy);

    // 점수(최고 높이) 갱신
    score += Math.floor(dy);
    if (score > highScore) highScore = score; // 최고점수 갱신
  } else {
    updatePlatforms(0);
  }

  // 바닥에 닿았는지 체크 (게임 오버)
  if (cat.y + cat.height >= CANVAS_HEIGHT - 40) {
    cat.y = CANVAS_HEIGHT - 40 - cat.height;
    cat.vy = 0;
    isOnGround = true;
    isGameOver = true;
  }
}

// 게임 루프
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// 게임 재시작 함수
function restartGame() {
  cat.x = CANVAS_WIDTH / 2 - 20;
  cat.y = CANVAS_HEIGHT - 100;
  cat.vy = 0;
  isOnGround = false;
  score = 0;
  isGameOver = false;
  leftPressed = false;
  rightPressed = false;
  initPlatforms();
}

// 캔버스 크기 맞추기 (index.html의 canvas 태그와 일치해야 함)
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 게임 시작 시 발판 초기화
initPlatforms();
gameLoop();