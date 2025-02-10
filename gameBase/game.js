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
var emyX = rnd(bgWidth-72);

let tapCooldown = 0;
const TAP_COOLDOWN_TIME = 8; // クールダウン時間（フレーム数）

// 起動時の処理
function setup() {
    canvasSize(bgWidth, bgHeight);
    loadImg(0, "image/grass.jpg");
    loadImg(1, "image/mgirl1.png"); // 1から3はプレイヤーの歩く画像
    loadImg(2, "image/mgirl2.png");
    loadImg(3, "image/mgirl3.png");
    loadImg(4, "image/enemy1.png"); // 4は敵キャラの画像を集めた
}

// メインループ(フレームレートは30fps)
function mainloop() {
    tmr++;
    tapCooldown = Math.max(0, tapCooldown - 1);

    changeField();
    setEnemy();
    personWalk();
}

const changeField = () => {
    drawImg(0, 0, bgY);
    drawImg(0, 0, bgY - bgHeight); //（ループ用の背景）
    bgY += scrollSpeed;
    // 画像が完全に下に移動したらリセット
    if (bgY >= bgHeight) {
        bgY = 0;
        emyX = rnd(bgWidth-72); // 敵のx座標もこのタイミングで変更
    }
}

const setEnemy = () => {
    // 敵の設定
    var emy_dir = 10;
    var sx = EN_ANIME[int(tmr/4)%4]*72;
    var sy = (emy_dir-1)*72;
    drawImgTS(4, sx, sy, 72, 72, emyX, bgY, 100, 100); 
}

const personWalk = () => {
    plAni++;

    if (tapC > 0 && tapCooldown <= 0) { // クールダウン中でなければタップを受け付ける
        plDir *= -1; // 向きを変更
        tapCooldown = TAP_COOLDOWN_TIME; // クールダウンをセット
    }

    if(plDir == 1) {
        drawImg(1+MG_ANIME[plAni%8], personX, 900);
        if(personX < bgWidth - 70) personX += 8;
    }
    if(plDir == -1) {
        drawImgLR(1+MG_ANIME[plAni%8], personX, 900, -1);
        if(personX > 0) personX -= 8;
    }
}
