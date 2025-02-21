document.addEventListener('DOMContentLoaded', function () {
  let gameStarted = false;
  let gameEnded = false;

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
    case 0: // タイトル画面
      fText("お化けから逃げろ", 470, 500, 100, "red");
      if (tmr % 40 < 20) fText("ボタンを押して開始します", 470, 700, 50, "yellow");
      if (tapC > 0) {
        idx = 1;
        tmr = 0;
      }
      break;

    case 1: // ゲームメイン
      gameMain();
      if (tmr >= MAX_FRAME) {
        idx = 2;
        tmr = 0;
      }
      break;

    case 2: // ゲーム終了画面(結果を出力させる)
      endGame(playerId);
      showRanking();
  }
}

const gameMain = () => {
  console.log("gameMain called");
  console.log(`personX: ${personX}, distance: ${distance}, tmr: ${tmr}`);
  tapCooldown = Math.max(0, tapCooldown - 1);
  if (invincibleTimer > 0) invincibleTimer--;

  if (isCrying) {
    cryTimer++;
    notChangeField();
    setEnemy();         // 敵描画（※位置は更新済み）
    // 泣くアニメーション（プレイヤー画像）
    drawImg(5 + int(cryTimer / 10) % 2, personX, playerY);
    if (cryTimer >= 120) { // 泣いている時間の待機時間は4秒
      isCrying = false;
      cryTimer = 0;
    }
  } else if (isFalling) {
    fallTimer++;
    notChangeField();
    setEnemy();         // 敵描画（※位置は更新済み）

    // 初期の幅と高さを設定
    let initialWidth = 144;
    let initialHeight = 72;

    // 毎フレーム fallTimer に応じて幅と高さを減らす
    let fallWidth = Math.max(initialWidth - fallTimer * 2, 0);
    let fallHeight = Math.max(initialHeight - fallTimer, 0);
    if (fallDir == 1) {
      drawImgS(5 + int(fallTimer / 10) % 2, personX - (144 / 120) * fallTimer - 30, playerY, fallWidth, fallHeight);
    } if (fallDir = -1) {
      drawImgS(5 + int(fallTimer / 10) % 2, personX + (144 / 120) * fallTimer - 60, playerY, fallWidth, fallHeight);
    }
    if (fallTimer >= 120) {
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

// ==================================================
// 敵管理：表示領域内の敵を管理し、新たな敵行を追加
// ==================================================
// updateEnemies(): 毎フレーム、各敵の y 座標を scrollSpeed だけ増加させ、
// 画面下に出た敵は削除、さらに distance が 120 ごとに新たな敵行（y = 0）を追加する。
function updateEnemies() {
  // すべての敵の y 座標を更新（下方向へ移動）
  enemies.forEach(e => {
    e.y += scrollSpeed;
  });

  // 画面下（y >= bgHeight）に出た敵は削除
  enemies = enemies.filter(e => e.y < bgHeight);

  // 3. distance（背景進行量）は changeField() などで毎フレーム distance += scrollSpeed と更新されていると仮定
  //    ここでは、distance が 200 ごとに新たな敵行を生成する条件とする。
  let currentRow = Math.floor(distance / 200);
  if (currentRow > enemyRowCounter) {
    let stage = Math.floor(distance / 2400) + 1; // ステージは distance に応じて決定
    // spawnEnemyRow() は、引数の y 座標（ここでは 0）で新たな敵群を生成する関数
    let rowEnemies = spawnEnemyRow(0, stage);
    // 新規生成された敵は、y = 0 からスタートする（画面上部に追加）
    enemies = enemies.concat(rowEnemies);
    enemyRowCounter = currentRow;  // spawn した行数を更新
  }

  // 4. 横方向の移動更新（ghost, skelton は毎フレームプレイヤーに近づく）
  enemies.forEach(e => {
    if (e.type === "ghost" || e.type === "skelton") {
      if (e.x < personX) e.x += (e.type === "ghost" ? 4 : 6);
      else e.x -= (e.type === "ghost" ? 4 : 6);
    }
  });
}

// spawnEnemyRow(rowY, stage)
// rowY: 敵行の絶対y座標（field座標）
// stage: 現在のステージに応じた出現パターンを決定する
// 戻り値: その行に出現させる敵の配列（1行に1体または複数体）
function spawnEnemyRow(rowY, stage) {
  let rowEnemies = [];
  if (stage === 1) {
    if (rnd(100) < 70) { // 70%でスライム
      rowEnemies.push({ type: "slime", x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 2) {
    if (rnd(100) < 70) { // 70%で敵を出現させて，その中で70%でスライム
      let type1 = (rnd(100) < 70) ? "slime" : "ghost";
      rowEnemies.push({ type: type1, x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 3) {
    let pro3 = rnd(100); // 20%で2体の敵を出現させる，20%でスライム，20%でゴースト
    if (pro3 < 20) {
      rowEnemies.push({ type: (rnd(100) < 50 ? "slime" : "ghost"), x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: (rnd(100) < 50 ? "slime" : "ghost"), x: rnd(bgWidth - 72), y: rowY });
    } else if (pro3 < 40) {
      rowEnemies.push({ type: "slime", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro3 < 60) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 4) { // このタイミングですべてをゴーストにする
    let pro4 = rnd(100);
    if (pro4 < 20) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro4 < 60) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 5) { // このタイミングで一人の敵に50%でスケルトンを増やす
    let pro5 = rnd(100);
    if (pro5 < 20) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro5 < 50) {
      rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 6) { // このタイミングでスケルトンを増やす
    let pro6 = rnd(100);
    if (pro6 < 20) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro6 < 40) {
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro6 < 60) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 7) {
    let pro7 = rnd(100);
    if (pro7 < 20) {
      rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro7 < 40) {
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro7 < 60) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage === 8) {
    let pro8 = rnd(100);
    if (pro8 < 20) {
      rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
    } else if (pro8 < 40) {
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro8 < 60) {
      rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
    }
  } else if (stage < 11) {
    let pro9 = rnd(100);
    if (pro9 < 30) {
      rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
    } else if (pro9 < 70) {
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
    }
  } else {
    let pro10 = rnd(100);
    if (pro10 < 30) {
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
    } else if (pro10 < 70) {
      rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
    }
  }
  return rowEnemies;
}

// ゲーム状態を初期化する関数
function resetGame() {
  enemies = [];            // 前回の敵をすべて削除
  enemyRowCounter = 0;     // 敵行カウンタをリセット
  distance = 0;            // 進行距離をリセット
  bgOffset = 0;            // 背景オフセットをリセット
  tapCooldown = 0;
  invincibleTimer = 0;
  personX = 450;           // プレイヤーの位置も初期位置に戻す
  plAni = 0;
  stage = 0;
  isCrying = false;
  isFalling = false;
}

// ==================================================
// 敵描画（表示領域内の敵を、フィールド座標→キャンバス座標に変換して描画）
// ==================================================
// setEnemy(): 各敵をキャンバスに描画（敵の y 座標はすでに 0～bgHeight の範囲にあるとする）
const setEnemy = () => {
  enemies.forEach(e => {
    // 画面内の敵のみ描画（0 ≤ e.y < bgHeight）
    if (e.y >= 0 && e.y < bgHeight) {
      if (e.type === "slime") {
        let sx = EN_ANIME[int(tmr / 4) % 4] * 72;
        let sy = (slime_dir - 1) * 72;
        drawImgTS(4, sx, sy, 72, 72, e.x, e.y, 100, 100);
      } else if (e.type === "ghost") {
        let sx = (EN_ANIME[int(tmr / 4) % 4] + 3) * 72;
        let sy = (ghost_dir - 1) * 72;
        drawImgTS(4, sx, sy, 72, 72, e.x, e.y, 100, 100);
      } else if (e.type === "skelton") {
        let sx = (EN_ANIME[int(tmr / 4) % 4] + 6) * 72;
        let sy = (skelton_dir - 1) * 72;
        drawImgTS(4, sx, sy, 72, 72, e.x, e.y, 100, 100);
      }
    }
  });
}

// ==================================================
// プレイヤー移動
// ==================================================
const personWalk = () => {
  plAni++;
  // ※ tapC はタップ入力状態と仮定
  if (tapC > 0 && tapCooldown <= 0) {
    plDir *= -1;
    tapCooldown = TAP_COOLDOWN_TIME;
  }
  if (plDir === 1) {
    drawImg(1 + MG_ANIME[plAni % 8], personX, playerY);
    if (personX < bgWidth - 70) personX += 10;
  }
  if (plDir === -1) {
    drawImgLR(1 + MG_ANIME[plAni % 8], personX, playerY, -1);
    if (personX > 0) personX -= 10;
  }
}

// ==================================================
// 衝突判定（表示領域内の敵とプレイヤーの衝突判定）
// ==================================================
const checkCollision = () => {
  if (invincibleTimer > 0) return;
  for (let e of enemies) {
    // プレイヤーのYは固定 (playerY ≒900)
    if (e.y >= 890 && e.y < 910 && Math.abs(personX - e.x) < collisionRange) {
      isCrying = true;
      cryTimer = 0;
      invincibleTimer = INVINCIBLE_TIME;
      break;
    }
  }
}

const checkFalling = () => {
  if (invincibleTimer > 0) return;
  if (personX < 30 || personX > 850) {
    fallDir = personX < 30 ? 1 : -1; // 左端に落ちたら1，右端に落ちたら-1
    isFalling = true;
    fallTimer = 0;
    invincibleTimer = INVINCIBLE_TIME;
  }
}

// ==================================================
// UI 表示（距離・残り時間）
// ==================================================
const showDistance = () => {
  // 表示上、distance の単位を適当に変換（例：distance * 0.01 m）
  fText("距離: " + (distance * 0.01).toFixed(1) + "m", 330, 50, 50, "black");
  sRect(170, 20, 320, 60, "black");
}

const showTime = () => {
  let restTime = (MAX_FRAME - tmr) / 30;
  fText("残り時間: " + restTime.toFixed(0) + "秒", 720, 50, 50, "black");
  sRect(520, 20, 400, 60, "black");
}


async function updateDistance(playerId, distance) {
  try {
    await fetch('/api/update_distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player_id: playerId, distance: distance / 100 }),
    });
  } catch (error) {
    console.error('Error updating distance:', error);
  }
}

// ゲーム終了時にサーバーに通知する関数
function endGame(playerId) {
  fetch('/api/end_game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ player_id: playerId }),
  });
}

// ゲーム終了後にランキングを取得して表示する関数
function showRanking() {
  fetch('/api/ranking')
    .then(response => response.json())
    .then(data => {
      // ランキングを表示する処理
      console.log(data);
      // ランキング画面にリダイレクト
      window.location.href = '/ranking';
    });
}
