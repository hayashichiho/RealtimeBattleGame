// 距離を表示するための関数
const showDistance = () => {
    fText("距離: " + (distance * 0.04).toFixed(1) + "m", 330, 50, 50, "black");
    sRect(170, 20, 380, 60, "black");
}

// 残り時間を表示するための関数
const showTime = () => {
    let restTime = (MAX_FRAME - tmr) / 30;
    fText("残り時間: " + restTime.toFixed(0) + "秒", 720, 50, 50, "black");
    sRect(520, 20, 400, 60, "black");
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

// ゲーム終了時に呼び出す関数
function endGame(playerId) {
    fetch('/api/end_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player_id: playerId }),
    });
}

// ランキングを表示するための関数
function showRanking() {
    fetch('/api/ranking')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            window.location.href = '/ranking';
        });
}
