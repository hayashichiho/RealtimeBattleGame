let slowCausedBy = []; 
let lastEffectCheck = 0;

// サーバーから減速効果状態を取得する関数（ポーリング間隔を調整）
let isFetching = false;
async function updateSlowStatus() {
    if (isFetching) return;
    isFetching = true;

    try {
        const response = await fetch('/api/check_effects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_id: playerId })
        });
        const data = await response.json();
        
        // サーバーからの slow effect が有効の場合、blockTimer を STAR_TIME にセット
        if (data.is_slowed) {
            console.log('Slow effect data:', data);
            blockTimer = STAR_TIME;
            slowCausedBy = Array.isArray(data.caused_by) ? data.caused_by : []; // 減速を適用したプレイヤーのリストを取得 // 減速を適用したプレイヤーのリストを取得
        }
    } catch (error) {
        console.error('Error checking slow effect:', error);
    } finally {
        isFetching = false;
    }
}

// インターバルを大きくして負荷軽減
setInterval(updateSlowStatus, 200);

// 減速を知らせるメッセージ - レンダリング最適化
const showSlowMessage = () => {
    if (blockTimer <= 0) return; // 早期リターンで不要な描画を防ぐ
    
    // 透明度を計算（点滅効果）
    const opacity = (Math.sin(tmr * 0.2) * 0.3) + 0.5;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 減速メッセージ
    ctx.fillText('減速中...', 480, 350);

    // 誰からの減速かを表示（上限2名まで表示して処理軽減）
    if (slowCausedBy && slowCausedBy.length > 0) {
        const displayNames = slowCausedBy.slice(0, 2);
        const causedByText = displayNames.length === slowCausedBy.length 
            ? `お邪魔 By ${displayNames.join(', ')}`
            : `お邪魔 By ${displayNames.join(', ')} 他`;
            
        ctx.font = 'bold 30px Arial';
        ctx.fillText(causedByText, 480, 450);
    }
}

const personWalk = () => {
    plAni++;
    if (tapC > 0 && tapCooldown <= 0) {
        plDir *= -1;
        tapCooldown = TAP_COOLDOWN_TIME;
    }

    if (plDir === 1) {
        if (blockTimer > 0) {
            drawImg(1 + MG_ANIME[plAni % 8], personX, playerY);
            scrollSpeed = 6; // 減速状態の場合
        } else if (starTimer > 0) {
            if (starTimer < 60) {
                if (tmr % 10 < 8) {
                    drawImg(7 + MG_ANIME[plAni % 8], personX, playerY);
                }
            } else {
                drawImg(7 + MG_ANIME[plAni % 8], personX, playerY);
            }
            scrollSpeed = 20;
        } else {
            drawImg(1 + MG_ANIME[plAni % 8], personX, playerY);
            scrollSpeed = 12;
        }
        if (personX < bgWidth - 70) personX += 10;
    } else if (plDir === -1) {
        if (blockTimer > 0) {
            drawImgLR(1 + MG_ANIME[plAni % 8], personX, playerY, -1);
            scrollSpeed = 6; // 減速状態の場合
        } else if (starTimer > 0) {
            if (starTimer < 60) {
                if (tmr % 20 < 10) {
                    drawImgLR(7 + MG_ANIME[plAni % 8], personX, playerY, -1);
                }
            } else {
                drawImgLR(7 + MG_ANIME[plAni % 8], personX, playerY, -1);
            }
            scrollSpeed = 20;
        } else {
            drawImgLR(1 + MG_ANIME[plAni % 8], personX, playerY, -1);
            scrollSpeed = 12;
        }
        if (personX > 0) personX -= 10;
    }
};

let isPlayingGetStarSound = false;
let isPlayingCollisionSound = false;
let isPlayingFallingSound = false;

function playGetStarSound() {
    if (!isPlayingGetStarSound) {
        isPlayingGetStarSound = true;
        getStarSound.play();
        getStarSound.onended = () => {
            isPlayingGetStarSound = false;
        };
    }
}

function playCollisionSound() {
    if (!isPlayingCollisionSound) {
        isPlayingCollisionSound = true;
        collisionSound.play();
        collisionSound.onended = () => {
            isPlayingCollisionSound = false;
        };
    }
}

function playFallingSound() {
    if (!isPlayingFallingSound) {
        isPlayingFallingSound = true;
        fallingSound.play();
        fallingSound.onended = () => {
            isPlayingFallingSound = false;
        };
    }
}

const checkCollision = () => {
    for (let e of enemies) {
        if (e.y >= 890 && e.y < 910 && Math.abs(personX - e.x) < collisionRange) {
            if (e.type === "star") {
                playGetStarSound();
                starTimer = STAR_TIME;
                enemies = enemies.filter(enemy => enemy !== e);
                break;
            } else if (e.type === "ken") {
                playGetStarSound();
                applyKenEffect();
                enemies = enemies.filter(enemy => enemy !== e);
                break;
            } else {
                if (invincibleTimer > 0 || starTimer > 0) return;
                playCollisionSound();
                isCrying = true;
                cryTimer = 0;
                invincibleTimer = INVINCIBLE_TIME;
                break;
            }
        }
    }
};

// 他の関数も最適化
async function applyKenEffect() {
    try {
        const response = await fetch('/api/players');
        const players = await response.json();

        const sortedPlayers = players.sort((a, b) => b.distance - a.distance);
        const totalPlayers = sortedPlayers.length;
        // const topPlayerCount = totalPlayers;
        const topPlayerCount = Math.ceil(totalPlayers * 0.5);
        const topPlayers = sortedPlayers.slice(0, topPlayerCount);

        const affectedPlayers = topPlayers.map(player => player.player_id);

        // 減速効果をサーバーに適用
        await fetch('/api/apply_slow_effect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                affected_players: affectedPlayers,
                duration: STAR_TIME, // 効果時間
                caused_by: playerId
            })
        });

    } catch (error) {
        console.error('Error applying ken effect:', error);
    }
}

const checkFalling = () => {
    if (invincibleTimer > 0) return;
    if (personX < 30 || personX > 850) {
        fallDir = personX < 30 ? 1 : -1;
        isFalling = true;
        fallTimer = 0;
        playFallingSound();
        invincibleTimer = INVINCIBLE_TIME;
    }
};
