let bgY = 0;
let bgHeight = 1200;
let scrollSpeed = 5;

let tmr = 0; //時間を管理する変数 

// 起動時の処理
function setup() {
    canvasSize(940, 1200);
    loadImg(0, "image/grass.jpg")
}

function mainloop() {
    tmr++;
    changeField();
}

const changeField = () => {
    drawImg(0, 0, bgY);
    drawImg(0, 0, bgY - bgHeight); //（ループ用の背景）
    bgY += scrollSpeed;
    // 画像が完全に下に移動したらリセット
    if (bgY >= bgHeight) {
        bgY = 0;
    }
}
