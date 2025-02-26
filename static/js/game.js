let currentRank = 1;
let totalPlayers = 1;
let playerDistances = [];  // 全プレイヤーの距離情報
let globalRankingData = null;
let countdown = 0; // カウントダウンの秒数を保持する変数
let previousCountdown = 0;

// Canvas要素と描画コンテキストの取得
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


function drawCountdown() {
  if (countdown > 0) {
    // カウントダウンの秒数を白色で大きく表示
    ctx.fillStyle = 'white';
    ctx.font = 'bold 300px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (previousCountdown !== countdown) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillText(countdown, 480, 600);
  }
}


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
  let lastServerTime = null;
  let timeOffset = 0;

  // サーバー時間との同期を行う関数
  function syncWithServer() {
    return fetch('/api/current_time')
      .then(response => response.json())
      .then(currentTimeData => {
        const serverTime = new Date(currentTimeData.current_time).getTime();
        const clientTime = Date.now();
        timeOffset = serverTime - clientTime;
        lastServerTime = serverTime;
        return serverTime;
      });
  }

  // 現在のサーバー時間を取得する関数
  function getServerTime() {
    return Date.now() + timeOffset;
  }

  // ゲーム状態を定期的にチェック
  function checkGameStatus() {
    fetch('/api/game_status')
      .then(response => response.json())
      .then(data => {
        if (data.game_started && !gameStarted) {
          gameStarted = true;

          // 最初にサーバーと時刻を同期
          syncWithServer()
            .then(() => {
              return fetch('/api/game_times');
            })
            .then(response => response.json())
            .then(gameTimes => {
              const startTime = new Date(gameTimes.start_time).getTime();
              const currentServerTime = getServerTime();
              const startDelay = startTime - currentServerTime;

              if (startDelay > 0) {
                // 高精度タイマーを使用
                const preciseTimeout = (callback, delay) => {
                  const start = performance.now();
                  const check = () => {
                    const elapsed = performance.now() - start;
                    if (elapsed >= delay) {
                      callback();
                    } else {
                      countdown = Math.ceil((delay - elapsed) / 1000);
                      if (countdown !== previousCountdown) {
                        previousCountdown = countdown;
                      }
                      drawCountdown();
                      requestAnimationFrame(check);
                    }
                  };
                  requestAnimationFrame(check);
                };
                preciseTimeout(startGame, startDelay);
              } else {
                startGame();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            });
        }
      })
      .catch(error => console.error('Error:', error));
  }

  // 定期的なサーバー時間同期
  setInterval(syncWithServer, 30000); // 30秒ごとに同期

  // ゲーム状態チェックの間隔を調整
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
  if (kentimer > 0) {
    kentimer--;
  }

  if (blockTimer > 0) {
    blockTimer--;
  }

  if (isCrying) {
    cryTimer++;
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
  showTopThree();
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