// 距離を表示するための関数
const showDistance = () => {
    fText("距離: " + (distance * 0.04).toFixed(1) + "m", 330, 50, 50, "black");
    sRect(140, 20, 380, 60, "black");
}

// 残り時間を表示するための関数
const showTime = () => {
    let restTime = (MAX_FRAME - tmr) / 30;
    fText("残り時間: " + restTime.toFixed(0) + "秒", 720, 50, 50, "black");
    sRect(520, 20, 400, 60, "black");

    // 特定の残り時間でメッセージを表示
    if ((restTime <= 100 && restTime > 97) ||
        (restTime <= 60 && restTime > 57) ||
        (restTime <= 30 && restTime > 27)) {
        showSpecialMessage(restTime.toFixed(0));
    }
}

// 特定の残り時間でメッセージを表示する関数
const showSpecialMessage = (restTime) => {
    const message = `残り${restTime}秒！現在${currentRank}位！`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // 透明度のある白い文字
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // メッセージを表示
    ctx.fillText(message, 480, 600);
}

// 距離を更新するための関数
async function updateDistance(playerId, distance) {
    try {
        await fetch('/api/update_distance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // 送信するデータの形式
            },
            body: JSON.stringify({ player_id: playerId, distance: distance }), // 送信するデータ
        });
    } catch (error) {
        console.error('Error updating distance:', error);
    }
}

