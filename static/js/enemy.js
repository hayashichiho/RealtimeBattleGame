// 敵を生成・管理するスクリプト
function updateEnemies() {
    enemies.forEach(e => {
        e.y += scrollSpeed;
    }); // 敵をスクロール

    enemies = enemies.filter(e => e.y < bgHeight); // 画面外の敵を削除

    let currentRow = Math.floor(distance / 200);
    if (currentRow > enemyRowCounter) {
        let stage = Math.floor(distance / 2400) + 1;
        let rowEnemies = spawnEnemyRow(0, stage);
        enemies = enemies.concat(rowEnemies);
        enemyRowCounter = currentRow;
    }

    enemies.forEach(e => {
        if (e.type === "ghost" || e.type === "skelton") {
            if (e.x < personX) e.x += (e.type === "ghost" ? 4 : 6);
            else e.x -= (e.type === "ghost" ? 4 : 6);
        }
    });
}

// 敵行を生成
function spawnEnemyRow(rowY, stage) {
    let rowEnemies = [];
    if (stage === 1) {
        if (rnd(100) < 70) {
            rowEnemies.push({ type: "slime", x: rnd2(30, bgWidth - 120), y: rowY });
        }
    } else if (stage === 2) {
        if (rnd(100) < 70) {
            let type1 = (rnd(100) < 70) ? "slime" : "ghost";
            rowEnemies.push({ type: type1, x: rnd2(30, bgWidth - 120), y: rowY });
        }
    } else if (stage === 3) {
        let pro3 = rnd(100);
        if (pro3 < 20) {
            rowEnemies.push({ type: (rnd(100) < 50 ? "slime" : "ghost"), x: rnd2(30, bgWidth - 120), y: rowY });
            rowEnemies.push({ type: (rnd(100) < 50 ? "slime" : "ghost"), x: rnd2(30, bgWidth - 120), y: rowY });
        } else if (pro3 < 40) {
            rowEnemies.push({ type: "slime", x: rnd2(30, bgWidth - 120), y: rowY });
        } else if (pro3 < 60) {
            rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
        }
    } else if (stage === 4) {
        let pro4 = rnd(100);
        if (pro4 < 20) {
            rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
            rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
        } else if (pro4 < 60) {
            rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
        }
    } else if (stage === 5) {
        let pro5 = rnd(100);
        if (pro5 < 20) {
            rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
            rowEnemies.push({ type: "ghost", x: rnd(bgWidth - 72), y: rowY });
        } else if (pro5 < 50) {
            rowEnemies.push({ type: (rnd(100) < 50 ? "ghost" : "skelton"), x: rnd(bgWidth - 72), y: rowY });
        }
    } else if (stage === 6) {
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
        } else if (pro9 < 60) {
            rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
        }
    } else if (stage > 10) {
        let pro10 = rnd(100);
        if (pro10 < 30) {
            rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
            rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
        } else if (pro10 < 60) {
            rowEnemies.push({ type: "skelton", x: rnd(bgWidth - 72), y: rowY });
        }
    }
    if (tmr > 60 * 30) { // stageは関係なく一分後にアイテムが出現するようにする
        if (currentRank * 10 < totalPlayers) { // 下位10％
            if (rnd(100) < 20) {
                rowEnemies.push({ type: "star", x: rnd2(30, bgWidth - 120), y: rowY });
            }
        } else if (currentRank * 5 < totalPlayers) { // 下位20％
            if (rnd(100) < 10) {
                rowEnemies.push({ type: "star", x: rnd2(30, bgWidth - 120), y: rowY });
            }
        } else if (currentRank * 2 < totalPlayers) { // 下位50％
            if (rnd(100) < 3) {
                rowEnemies.push({ type: "star", x: rnd2(30, bgWidth - 120), y: rowY });
            }
        } else { // それ以外
            if (rnd(100) < 10) { // 10%の確率に修正
                rowEnemies.push({ type: "star", x: rnd2(30, bgWidth - 120), y: rowY });
            }
        }
    }
    if (rnd(100) < 30) {
        rowEnemies.push({ type: "ken", x: rnd2(30, bgWidth - 120), y: rowY });
    }
    return rowEnemies;
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
            } else if (e.type === "star") {
                drawImg(10, e.x, e.y);
            } else if (e.type === "ken") {
                drawImg(11, e.x, e.y);
            }
        }
    });
}
