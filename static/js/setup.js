function setup() {
    const urlParams = new URLSearchParams(window.location.search); // URLパラメータを取得
    playerId = urlParams.get('player_id'); // プレイヤーIDを取得

    canvasSize(bgWidth, bgHeight);
    loadImg(0, "static/images/grass.jpg");
    loadImg(1, "static/images/mgirl1.png"); // プレイヤー歩行画像
    loadImg(2, "static/images/mgirl2.png");
    loadImg(3, "static/images/mgirl3.png");
    loadImg(4, "static/images/enemy1.png"); // 敵用スプライトシート
    loadImg(5, "static/images/mgirl4.png"); // プレイヤー泣き画像
    loadImg(6, "static/images/mgirl5.png");
    loadImg(7, "static/images/mgirl1_white.png"); // プレイヤー無敵時の歩行画像
    loadImg(8, "static/images/mgirl2_white.png");
    loadImg(9, "static/images/mgirl3_white.png");
    loadImg(10, "static/images/star.png"); // 無敵時の画像

    loadSound(0, "static/sounds/walk.mp3"); // 通常時の音楽
    loadSound(1, "static/sounds/star.mp3"); // 無敵状態の音楽

    // 最初のタイミングで画面下部に必要な敵行を生成
    updateEnemies();
}

// ゲームの初期化
function resetGame() {
    console.log("resetGame called");
    enemies = [];            // 前回の敵をすべて削除
    enemyRowCounter = 0;     // 敵行カウンタをリセット
    distance = 0;            // 進行距離をリセット
    bgOffset = 0;            // 背景オフセットをリセット
    tapCooldown = 0;
    invincibleTimer = 0;
    starTimer = 0;
    personX = 450;           // プレイヤーの位置も初期位置に戻す
    plAni = 0;
    stage = 0;
    isCrying = false;
    isFalling = false;
}

document.addEventListener('DOMContentLoaded', setup);
