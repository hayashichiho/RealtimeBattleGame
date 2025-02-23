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

// 新しい関数: ゲーム終了処理とランキング表示を統合
async function endGameAndShowRanking() {
  try {
    // 最終スコアを送信
    await fetch('/api/update_distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_id: playerId,
        distance: distance * 0.04,
        is_final: true
      }),
    });

    // ゲーム終了を通知
    await fetch('/api/end_game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player_id: playerId }), // プレイヤーIDを送信
    });

    // ランキングを取得して表示
    window.location.href = '/ranking';

  } catch (error) {
    console.error('Error in endGameAndShowRanking:', error);
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
      playGetStarSound(); // スターを取った瞬間に音を再生
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

// 距離と順位を更新する関数
async function updateDistanceAndRank(playerId, distance) {
  if (tmr % 15 !== 0) return; // 15フレームに1回のみ更新

  try {
    // 距離を更新
    await fetch('/api/update_distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player_id: playerId, distance: distance * 0.04 }),
    });

    // 全プレイヤーの距離情報を取得
    const playersResponse = await fetch('/api/players');
    if (!playersResponse.ok) {
      throw new Error('Players fetch failed');
    }

    const players = await playersResponse.json();
    // 距離でソート（降順）
    playerDistances = players.sort((a, b) => b.distance - a.distance);

    // 現在の順位と総プレイヤー数を更新
    currentRank = playerDistances.findIndex(p => p.player_id === playerId) + 1;
    totalPlayers = playerDistances.length;

  } catch (error) {
    console.error('Error updating distance and rank:', error);
  }
}

function showDistanceMap() {
  const MAP_HEIGHT = 300;  // マップの高さを300pxに拡大
  const MAP_WIDTH = 40;    // マップの幅を40pxに拡大
  const MARKER_SIZE = 10;  // マーカーサイズを10pxに拡大
  const X_POSITION = 20;   // X座標の開始位置は維持

  // 背景の黒い矩形を描画
  fRect(X_POSITION - 5, 80, MAP_WIDTH + 10, MAP_HEIGHT + 10, "black");

  // プレイヤーが存在する場合のみ描画
  if (playerDistances.length > 0) {
    // 最大距離と最小距離を取得
    const maxDistance = Math.max(...playerDistances.map(p => p.distance));
    const minDistance = Math.min(...playerDistances.map(p => p.distance));
    const distanceRange = maxDistance - minDistance;

    // 各プレイヤーの位置を描画
    playerDistances.forEach((player, index) => {
      // Y座標を計算（距離に応じて位置を決定）
      const normalizedDistance = (player.distance - minDistance) / distanceRange;
      const y = 85 + (MAP_HEIGHT - 10) * (1 - normalizedDistance);

      if (player.player_id === playerId) {
        // 自分の位置を赤い三角で表示
        const triangleHeight = 20;  // 三角形の高さを20pxに拡大
        const triangleWidth = 16;   // 三角形の幅を16pxに拡大
        fTri(
          X_POSITION + MAP_WIDTH / 2, y - triangleHeight / 2,  // 頂点
          X_POSITION + MAP_WIDTH / 2 - triangleWidth / 2, y + triangleHeight / 2,  // 左下
          X_POSITION + MAP_WIDTH / 2 + triangleWidth / 2, y + triangleHeight / 2,  // 右下
          "red"
        );
      } else {
        // 他プレイヤーを白い円で表示
        bg.beginPath();
        bg.fillStyle = "white";
        bg.arc(X_POSITION + MAP_WIDTH / 2, y, MARKER_SIZE / 2, 0, Math.PI * 2);
        bg.fill();
      }
    });
  }
}

// 順位を表示する関数
function showRankingDisplay() {
  // 背景の黒い矩形を描画
  fRect(20, 20, 120, 60, "black");

  // 順位テキストを描画
  const rankText = `${currentRank}/${totalPlayers}`;
  fText(rankText, 80, 50, 50, "white");
}

function showRanking() {
  // まずDOM要素の存在確認
  const rankingContainer = document.getElementById('ranking-container');
  if (!rankingContainer) {
    console.error('Ranking container not found!');
    return;
  }

  fetch('/api/ranking')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Ranking:", data);
      if (!data || data.length === 0) {
        rankingContainer.innerHTML = '<h2>ランキング</h2><p>データがありません</p>';
        return;
      }

      rankingContainer.innerHTML = '<h2>ランキング</h2>';
      const rankingList = document.createElement('ul');
      data.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name}: ${player.distance}m`;
        rankingList.appendChild(listItem);
      });
      rankingContainer.appendChild(rankingList);
    })
    .catch(error => {
      console.error('Error fetching ranking:', error);
      rankingContainer.innerHTML = '<h2>ランキング</h2><p>ランキングの取得に失敗しました</p>';
    });
}
