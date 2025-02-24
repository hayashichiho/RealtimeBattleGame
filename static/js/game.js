let currentRank = 1;
let totalPlayers = 1;
let playerDistances = [];  // 全プレイヤーの距離情報
let globalRankingData = null;

function startGame() {
  console.log("startGame called");
  resetGame(); // ゲーム状態をリセット
  idx = 1;     // ゲームメインに遷移
  tmr = 0;
  console.log("ゲームが開始されました！");
}

function endGame() {
  console.log("endGame called");
  idx = 2; // ゲーム終了画面に遷移
  tmr = 0;
  console.log("ゲームが終了しました！");
  endGameAndShowRanking(); // ランキングを表示
}

document.addEventListener('DOMContentLoaded', function () {
  let gameStarted = false;

  // ゲーム状態を定期的にチェック
  function checkGameStatus() {
    console.log("checkGameStatus called");
    fetch('/api/game_status')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("game_status response:", data);
        if (data.game_started && !gameStarted) {
          gameStarted = true;
          fetch('/api/game_times')
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(gameTimes => {
              fetch('/api/current_time')
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  return response.json();
                })
                .then(currentTimeData => {
                  const serverCurrentTime = new Date(currentTimeData.current_time);
                  const startTime = new Date(gameTimes.start_time);
                  const startDelay = startTime - serverCurrentTime;
                  console.log("startDelay:", startDelay);
                  console.log("startTime:", startTime);
                  console.log("serverCurrentTime:", serverCurrentTime);
                  if (startDelay > 0) {
                    setTimeout(startGame, startDelay);
                  } else {
                    startGame();
                  }
                })
                .catch(error => {
                  console.error('Error fetching current time:', error);
                });
            })
            .catch(error => {
              console.error('Error fetching game times:', error);
            });
        }
      })
      .catch(error => {
        console.error('Error fetching game status:', error);
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
      if (tmr >= MAX_FRAME) { // ゲーム終了
        idx = 2;
        tmr = 0;
        endGameAndShowRanking(); // 新しい関数を呼び出し
      }
      break;

    case 2: // ゲーム終了画面(結果を出力させる)
      // ランキングページにリダイレクトするため、このケースは不要
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
  }

  if (isCrying) {
    cryTimer++;
    playCollisionSound();
    notChangeField();
    setEnemy();
    drawImg(5 + int(cryTimer / 10) % 2, personX, playerY);
    if (cryTimer >= INVINCIBLE_TIME) {
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
    if (fallTimer >= INVINCIBLE_TIME) {
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

  updateDistanceAndRank(playerId, distance);// 距離と順位を更新
  // UI表示を更新
  showDistance();
  showTime();
  showRankingDisplay();
  showDistanceMap();
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
