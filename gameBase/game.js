let bgY = 0;
let bgWidth = 940;
let bgHeight = 1200;
let scrollSpeed = 8;

let tmr = 0; //時間を管理する変数
let plDir = 1; //プレイヤーの向きを管理する変数(-1:左向き, 1:右向き)
let plAni = 0; //プレイヤーのアニメーションを管理する変数
const MG_ANIME = [0, 0, 1, 1, 2, 2, 1, 1]; //プレイヤーのアニメーションのパターン
const EN_ANIME = [0, 1, 0, 2]; //敵のアニメーションのパターン
let personX = 450; //タップ入力を受け取った時にプレイヤーの座標を保存する変数
let slimeX = rnd(bgWidth - 72); // スライムのx座標
let ghostX = rnd(bgWidth - 72); // ゴーストのx座標
let skeltonX = rnd(bgWidth - 72); // スケルトンのx座標
let collisionRange = 50;
let isCrying = false;
let cryTimer = 0; // 泣く時間をカウントする
let invincibleTimer = 0; // 無敵時間をカウントする
let distance = 0; // 距離をカウントする
const slime_dir = 10; // スライムを表示する番号
const ghost_dir = 10; // ゴーストを表示する番号
const skelton_dir = 13; // スケルトンを表示する番号

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
        if (cryTimer >= 120) { 
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
        slimeX = rnd(bgWidth - 72); // 敵のx座標もこのタイミングで変更
        skeltonX = rnd(bgWidth - 72);
    }
}

const notChangeField = () => {
    drawImg(0, 0, bgY);
    drawImg(0, 0, bgY - bgHeight); //（ループ用の背景）
}

const setEnemy = () => {
    setSlime();
    setGhost();
    setSkelton();
}

const setSlime = () => {
    var sx = EN_ANIME[int(tmr / 4) % 4] * 72;
    var sy = (slime_dir - 1) * 72;
    drawImgTS(4, sx, sy, 72, 72, slimeX, bgY, 100, 100);
}

const setGhost = () => {
    var sx = (EN_ANIME[int(tmr / 4) % 4] + 3) * 72;
    var sy = (ghost_dir - 1) * 72;
    if (bgY < 400) drawImgTS(4, sx, sy, 72, 72, ghostX, bgY, 100, 100);
    else {
        if (ghostX < personX) ghostX += 5;
        else ghostX -= 5;
        drawImgTS(4, sx, sy, 72, 72, ghostX, bgY, 100, 100);
    }
}

const setSkelton = () => {
    var sx = (EN_ANIME[int(tmr / 4) % 4] + 6) * 72;
    var sy = (ghost_dir - 1) * 72;
    if (bgY < 400) drawImgTS(4, sx, sy, 72, 72, skeltonX, bgY, 100, 100);
    else {
        if (skeltonX < personX) skeltonX += 8;
        else skeltonX -= 8;
        drawImgTS(4, sx, sy, 72, 72, skeltonX, bgY, 100, 100);
    }
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
    if ((Math.abs(personX - slimeX) < collisionRange || Math.abs(personX - ghostX) < collisionRange || Math.abs(personX - skeltonX) < collisionRange) && enemyY > 890 && enemyY < 910) {
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