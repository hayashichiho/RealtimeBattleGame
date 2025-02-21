const showDistance = () => {
    fText("距離: " + (distance * 0.04).toFixed(1) + "m", 330, 50, 50, "black");
    sRect(170, 20, 380, 60, "black");
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

function endGame(playerId) {
    fetch('/api/end_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player_id: playerId }),
    });
}

function showRanking() {
    fetch('/api/ranking')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            window.location.href = '/ranking';
        });
}
