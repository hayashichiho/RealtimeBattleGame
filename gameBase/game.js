let bgY = 0;
let bgWidth = 940;
let bgHeight = 1200;
let scrollSpeed = 5;

let tmr = 0; //時間を管理する変数
let plDir = 1; //プレイヤーの向きを管理する変数(-1:左向き, 1:右向き)
let plAni = 0; //プレイヤーのアニメーションを管理する変数
let MG_ANIME = [0, 0, 1, 1, 2, 2, 1, 1]; //プレイヤーのアニメーションのパターン
let EN_ANIME = [0, 1, 0, 2]; //敵のアニメーションのパターン
let personX = 450; //タップ入力を受け取った時にプレイヤーの座標を保存する変数
let emyX = rnd(bgWidth - 72); // 敵のx座標
let collisionRange = 50;
let isCrying = false;
let cryTimer = 0; // 泣く時間をカウントする
let invincibleTimer = 0; // 無敵時間をカウントする
let distance = 0; // 距離をカウントする

let tapCooldown = 0;
const TAP_COOLDOWN_TIME = 8; // クールダウン時間（フレーム数）
const INVINCIBLE_TIME = 20; // 無敵時間（フレーム数）
const MAX_FRAME = 30 * 60 * 2; // 二分間でこのプログラムを終了する()

// 起動時の処理
function setup() {
    canvasSize(bgWidth, bgHeight);
    loadImg(0, "image/grass.jpg");
    loadImg(1, "image/mgirl1.png"); // 1から3はプレイヤーの歩く画像
    loadImg(2, "image/mgirl2.png");
    loadImg(3, "image/mgirl3.png");
    loadImg(4, "image/enemy1.png"); // 4は敵キャラの画像を集めた画像
    loadImg(5, "image/mgirl4.png"); // 5, 6はプレイヤーが泣く画像
    loadImg(6, "image/mgirl5.png");
}

// メインループ(フレームレートは30fps)
function mainloop() {
    tmr++;
    tapCooldown = Math.max(0, tapCooldown - 1);

    if (isCrying) {
        cryTimer++;
        notChangeField(); // 背景をスクロールさせないで時間だけ更新させる
        setEnemy();
        showDistance();
        showTime();
        drawImg(5 + int(cryTimer / 10) % 2, personX, 900); // 泣くアニメーション
        if (cryTimer >= 90) { 
            isCrying = false; // 泣く時間が終わったら復帰
            cryTimer = 0; // カウントリセット
        }
    } else {
        if (invincibleTimer > 0) invincibleTimer--; // 無敵時間カウントダウン
        changeField();
        setEnemy();
        personWalk();
        checkCollision();
        showDistance();
        showTime();
    }
}

const changeField = () => {
    drawImg(0, 0, bgY);
    drawImg(0, 0, bgY - bgHeight); //（ループ用の背景）
    bgY += scrollSpeed;
    distance += scrollSpeed;
    // 画像が完全に下に移動したらリセット
    if (bgY >= bgHeight) {
        bgY = 0;
        emyX = rnd(bgWidth - 72); // 敵のx座標もこのタイミングで変更
    }
}

const notChangeField = () => {
    drawImg(0, 0, bgY);
    drawImg(0, 0, bgY - bgHeight); //（ループ用の背景）
}

const setEnemy = () => {
    var emy_dir = 10;
    var sx = EN_ANIME[int(tmr / 4) % 4] * 72;
    var sy = (emy_dir - 1) * 72;
    drawImgTS(4, sx, sy, 72, 72, emyX, bgY, 100, 100);
}

const personWalk = () => {
    plAni++;

    if (tapC > 0 && tapCooldown <= 0) { // クールダウン中でなければタップを受け付ける
        plDir *= -1; // 向きを変更
        tapCooldown = TAP_COOLDOWN_TIME; // クールダウンをセット
    }

    if (plDir == 1) {
        drawImg(1 + MG_ANIME[plAni % 8], personX, 900);
        if (personX < bgWidth - 70) personX += 10;
    }
    if (plDir == -1) {
        drawImgLR(1 + MG_ANIME[plAni % 8], personX, 900, -1);
        if (personX > 0) personX -= 10;
    }
}

const checkCollision = () => {
    let enemyY = bgY; // 敵のY座標（背景スクロールに従う）

    // 無敵時間中は当たり判定を無効化
    if (invincibleTimer > 0) return;

    // 当たり判定（X座標の差が一定以内 & Y座標が近い場合）
    if (Math.abs(personX - emyX) < collisionRange && enemyY > 890 && enemyY < 910) {
        console.log("Hit!"); // ここでゲームオーバー処理などを入れる
        isCrying = true;
        cryTimer = 0; // 泣くアニメーションを開始
        invincibleTimer = INVINCIBLE_TIME; // 無敵時間をセット
    }
}

const showDistance = () => {
    fText("距離: " + (distance * 0.01).toFixed(1) + "m", 330, 50, 50, "black");
    sRect(170, 20, 320, 60, "black");
}

// 残り時間を表示する関数
const showTime = () => {
    let restTime = (MAX_FRAME - tmr) / 30;
    fText("残り時間: " + restTime.toFixed(0) + "秒", 720, 50, 50, "black");
    sRect(520, 20, 400, 60, "black");
}