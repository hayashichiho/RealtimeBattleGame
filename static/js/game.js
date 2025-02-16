// ==================================================
// グローバル変数・定数
// ==================================================
let bgWidth = 940;
let bgHeight = 1200;
let scrollSpeed = 12;

let idx = 0;          // 全体の流れを支配する
let tmr = 0;          // 時間管理
let distance = 0;     // フィールド上の進行距離（絶対座標系）
let bgOffset = 0;     // 背景描画用オフセット（distance % bgHeight）

let plDir = 1;        // プレイヤー向き (-1:左, 1:右)
let plAni = 0;        // プレイヤーアニメーション管理
const MG_ANIME = [0, 0, 1, 1, 2, 2, 1, 1]; // プレイヤーアニメーションパターン
const EN_ANIME = [0, 1, 0, 2];              // 敵アニメーションパターン

let personX = 450;    // プレイヤーX座標（左右移動）
const playerY = 900;  // プレイヤーの固定Y座標
let stage = 0;

let collisionRange = 50;
let enemyRowCounter = 0;  // これまでに spawn した「敵行」の個数

let isCrying = false;
let isFalling = false;
let fallDir;
let cryTimer = 0;         // 泣く時間カウント
let fallTimer = 0;        // 落ちる時間カウント
let invincibleTimer = 0;  // 衝突直後の無敵時間

let tapCooldown = 0;
const TAP_COOLDOWN_TIME = 8;  // タップクールダウン
const INVINCIBLE_TIME = 50;   // 無敵フレーム数
const MAX_FRAME = 30 * 60 * 2; // 2分後に終了

// 敵用スプライト番号（スライム：下から1番目、ゴースト：2番目、スケルトン：3番目）
const slime_dir = 10;
const ghost_dir = 10;
const skelton_dir = 13;

// 敵は配列で管理。各敵は { type:"slime"/"ghost"/"skelton", x:数値, y:絶対座標 } とする。
let enemies = [];

// ==================================================
// 起動時の処

// ==================================================
function setup() {
  canvasSize(bgWidth, bgHeight);
  loadImg(0, "static/images/grass.jpg");
  loadImg(1, "static/images/mgirl1.png"); // プレイヤー歩行画像
  loadImg(2, "static/images/mgirl2.png");
  loadImg(3, "static/images/mgirl3.png");
  loadImg(4, "static/images/enemy1.png");  // 敵用スプライトシート
  loadImg(5, "static/images/mgirl4.png");  // プレイヤー泣き画像
  loadImg(6, "static/images/mgirl5.png");

  // 最初のタイミングで画面下部に必要な敵行を生成
  updateEnemies();
}

// ==================================================
// メインループ（30fps想定）
// ==================================================
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
      fText("ゲーム終了", 470, 400, 100, "red");
      fText("結果発表", 470, 600, 50, "lime");
      fText("距離: " + (distance * 0.01).toFixed(1) + "m", 470, 800, 50, "blue");
      if (tmr === 30 * 8) {
        idx = 0;
        resetGame();
      }
      break;
  }
}

const gameMain = () => {
  tapCooldown = Math.max(0, tapCooldown - 1);
  // 無敵時間カウント（衝突後または落下後）
  if (invincibleTimer > 0) invincibleTimer--;

  if (isCrying) {
    cryTimer++;
    // 背景は固定（スクロールさせず）して、敵・UIは更新
    notChangeField();
    setEnemy();         // 敵描画（※位置は更新済み）
    // 泣くアニメーション（プレイヤー画像）
    drawImg(5 + int(cryTimer / 10) % 2, personX, playerY);
    if (cryTimer >= 120) {
      isCrying = false;
      cryTimer = 0;
    }
  } else if (isFalling) {
    fallTimer++;
    // 背景は固定（スクロールさせず）して、敵・UIは更新
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
