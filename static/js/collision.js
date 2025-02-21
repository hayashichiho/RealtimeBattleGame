// 歩行アニメーション
const personWalk = () => {
    plAni++;
    if (tapC > 0 && tapCooldown <= 0) {
        plDir *= -1;
        tapCooldown = TAP_COOLDOWN_TIME;
    }

    if (plDir === 1) {
        if (starTimer > 0) {
            if (starTimer < 60) {
                if (tmr % 10 < 8) {
                    drawImg(7 + MG_ANIME[plAni % 8], personX, playerY);
                }
            } else {
                drawImg(7 + MG_ANIME[plAni % 8], personX, playerY);
            }
        } else {
            drawImg(1 + MG_ANIME[plAni % 8], personX, playerY);
        }
        if (personX < bgWidth - 70) personX += 10;
    } else if (plDir === -1) {
        if (starTimer > 0) {
            if (starTimer < 60) {
                if (tmr % 20 < 10) {
                    drawImgLR(7 + MG_ANIME[plAni % 8], personX, playerY, -1);
                }
            } else {
                drawImgLR(7 + MG_ANIME[plAni % 8], personX, playerY, -1);
            }
        } else {
            drawImgLR(1 + MG_ANIME[plAni % 8], personX, playerY, -1);
        }
        if (personX > 0) personX -= 10;
    }
}

// 衝突判定
const checkCollision = () => {
    for (let e of enemies) {
        if (e.y >= 890 && e.y < 910 && Math.abs(personX - e.x) < collisionRange) {
            if (e.type === "star") {
                stopBgm();
                playBgm(1);
                starTimer = STAR_TIME;
                enemies = enemies.filter(enemy => enemy !== e);
                break;
            } else {
                if (invincibleTimer > 0 || starTimer > 0) return;
                isCrying = true;
                cryTimer = 0;
                invincibleTimer = INVINCIBLE_TIME;
                break;
            }
        }
    }
}

// 落下判定
const checkFalling = () => {
    if (invincibleTimer > 0) return;
    if (personX < 30 || personX > 850) {
        fallDir = personX < 30 ? 1 : -1;
        isFalling = true;
        fallTimer = 0;
        invincibleTimer = INVINCIBLE_TIME;
    }
}
