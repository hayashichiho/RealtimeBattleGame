let currentRank = 1;
let totalPlayers = 1;

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

  function endGame() {
    console.log("endGame called");
    idx = 2; // ゲーム終了画面に遷移
    tmr = 0;
    stopBgm();
    console.log("ゲームが終了しました！");
    showRanking(); // ランキングを表示
  }

  function showRanking() {
    fetch('/api/ranking')
      .then(response => response.json())
      .then(data => {
        console.log("Ranking:", data);
        // ランキングを表示する処理を追加
        const rankingContainer = document.getElementById('ranking-container');
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
      });
  }

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
                  const endTime = new Date(gameTimes.end_time);
                  const startDelay = startTime - serverCurrentTime;
                  const endDelay = endTime - serverCurrentTime;
                  console.log("startDelay:", startDelay);
                  console.log("endDelay:", endDelay);
                  console.log("startTime:", startTime);
                  console.log("endTime:", endTime);
                  console.log("serverCurrentTime:", serverCurrentTime);
                  if (startDelay > 0) {
                    setTimeout(startGame, startDelay);
                  } else {
                    startGame();
                  }
                  if (endDelay > 0) {
                    setTimeout(endGame, endDelay);
                  } else {
                    endGame();
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
        stopBgm();
        showRanking(); // ランキングを表示
      }
      break;

    case 2: // ゲーム終了画面(結果を出力させる)
      endGame(playerId);
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
  // 距離と順位を更新
  updateDistanceAndRank(playerId, distance);

  // UI表示を更新
  showDistance();
  showTime();
  showRankingDisplay();
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

// 最適化された距離と順位の更新関数
async function updateDistanceAndRank(playerId, distance) {
  if(tmr % 30 !== 0) {
    return
  }
  
  try {
      // 距離を更新
      await fetch('/api/update_distance', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ player_id: playerId, distance: distance }),
      });

      // 順位を取得
      const rankResponse = await fetch('/api/current_rank', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ player_id: playerId, distance: distance }),
      });

      if (!rankResponse.ok) {
          throw new Error('Rank fetch failed');
      }

      const rankData = await rankResponse.json();
      currentRank = rankData.rank;
      totalPlayers = rankData.total_players;
      
      console.log('Current rank:', currentRank, 'Total players:', totalPlayers);

  } catch (error) {
      console.error('Error updating distance and rank:', error);
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