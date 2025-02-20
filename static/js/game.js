document.addEventListener('DOMContentLoaded', function () {
  let gameStarted = false;

  function startGame() {
    console.log("startGame called");
    resetGame(); // ゲーム状態をリセット
    idx = 1;     // ゲームメインに遷移
    tmr = 0;
    playBgm(0);
    console.log("ゲームが開始されました！");
  }

  function checkGameStatus() {
    console.log("checkGameStatus called");
    fetch('/api/game_status')
      .then(response => response.json())
      .then(data => {
        console.log("game_status response:", data);
        if (data.game_started && !gameStarted) {
          gameStarted = true;
          startGame();
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  setInterval(checkGameStatus, 1000);
});

function mainloop() {
  tmr++;
  drawImg(0, 0, 0); // 背景画像

  switch (idx) {
    case 1: // ゲームメイン
      gameMain();
      if (tmr >= MAX_FRAME) {
        idx = 2;
        tmr = 0;
        stopBgm();
      }
      break;

    case 2: // ゲーム終了画面(結果を出力させる)
      endGame(playerId);
      showRanking();
      break;
  }
}

const gameMain = () => {
  console.log("gameMain called");
  console.log(`personX: ${personX}, distance: ${distance}, tmr: ${tmr}`);
  tapCooldown = Math.max(0, tapCooldown - 1);
  if (invincibleTimer > 0) invincibleTimer--;

  if (starTimer > 0) {
    starTimer--;
    if (starTimer === 0) {
      stopBgm();
      playBgm(0);
    }
  }

  if (isCrying) {
    cryTimer++;
    notChangeField();
    setEnemy();
    drawImg(5 + int(cryTimer / 10) % 2, personX, playerY);
    if (cryTimer >= 120) {
      isCrying = false;
      cryTimer = 0;
    }
  } else if (isFalling) {
    fallTimer++;
    notChangeField();
    setEnemy();
    let initialWidth = 144;
    let initialHeight = 72;
    let fallWidth = Math.max(initialWidth - fallTimer * 2, 0);
    let fallHeight = Math.max(initialHeight - fallTimer, 0);
    if (fallDir == 1) {
      drawImgS(5 + int(fallTimer / 10) % 2, personX - (144 / 120) * fallTimer - 50, playerY, fallWidth, fallHeight);
    } else if (fallDir == -1) {
      drawImgS(5 + int(fallTimer / 10) % 2, personX + (144 / 120) * fallTimer - 20, playerY, fallWidth, fallHeight);
    }
    if (fallTimer >= 150) {
      isFalling = false;
      fallTimer = 0;
      personX = 450;
    }
  } else {
    updateEnemies();
    changeField();
    setEnemy();
    personWalk();
    checkCollision();
    checkFalling();
  }
  showDistance();
  showTime();
  updateDistance(playerId, distance);
}

// ==================================================
// 背景描画
// ==================================================
const changeField = () => {
  // distanceを更新し、そのmod値を背景オフセットとして利用
  distance += scrollSpeed;
  bgOffset = distance % bgHeight;
  // 背景は2枚描画して連続ループを実現
  drawImg(0, 0, bgOffset);
  drawImg(0, 0, bgOffset - bgHeight);
}

// 背景をスクロールさせずにそのまま描画（泣いている間用）
const notChangeField = () => {
  drawImg(0, 0, bgOffset);
  drawImg(0, 0, bgOffset - bgHeight);
}
