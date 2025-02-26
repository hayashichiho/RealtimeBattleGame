// ==================================================
// グローバル変数・定数
// ==================================================
let playerId;

let bgWidth = 940;
let bgHeight = 1200;
let scrollSpeed = 12;

let idx = 0;          // 全体の流れを支配する
let tmr = 0;          // 時間管理
let distance = 0;     // フィールド上の進行距離（絶対座標系）
let bgOffset = 0;     // 背景描画用オフセット（distance % bgHeight）

let plDir = 1;        // プレイヤー向き (-1:左, 1:右)
let plAni = 0;        // プレイヤーアニメーション管理
const MG_ANIME = [0, 0, 1, 1, 2, 2, 1, 1]; // プレイヤーアニメーションパターン
const EN_ANIME = [0, 1, 0, 2];              // 敵アニメーションパターン

let personX = 450;    // プレイヤーX座標（左右移動）
const playerY = 900;  // プレイヤーの固定Y座標
let stage = 0;

let collisionRange = 50;
let enemyRowCounter = 0;  // これまでに spawn した「敵行」の個数

let isCrying = false;
let isFalling = false;
let fallDir;
let cryTimer = 0;         // 泣く時間カウント
let fallTimer = 0;        // 落ちる時間カウント
let invincibleTimer = 0;  // 衝突直後の無敵時間
let starTimer = 0;        // 無敵アイテム取得時の無敵時間
let blockTimer = 0;       // お邪魔攻撃を受けた時の時間カウント

let tapCooldown = 0;
const TAP_COOLDOWN_TIME = 8;  // タップクールダウン
const INVINCIBLE_TIME = 90;   // 無敵フレーム数(衝突時)
const STAR_TIME = 120;        // アイテム取得時の無敵時間(お邪魔時間もこの時間に設定)
const MAX_FRAME = 30 * 60 * 1; // 2分後に終了

// 敵用スプライト番号（スライム：下から1番目、ゴースト：2番目、スケルトン：3番目）
const slime_dir = 10;
const ghost_dir = 10;
const skelton_dir = 13;

// 敵は配列で管理。各敵は { type:"slime"/"ghost"/"skelton", x:数値, y:絶対座標 } とする。
let enemies = [];

let isEnd = false;
let isSlow = false;
