# リアルタイム障害物回避バトルゲーム

## プロジェクト概要
このWebアプリは、複数人が同時に参加できるリアルタイム対戦型の障害物回避ゲームです。プレイヤーはタッチ操作でキャラクターの進行方向を切り替え、2分間でどれだけ遠くまで進めるかを競います。

---

## 主な特徴

- **リアルタイム対戦**：複数プレイヤーが同時に参加可能
- **タッチ操作**：画面タップで左右の進行方向を切り替え
- **順位表示**：ゲーム中にリアルタイムで順位が更新
- **障害物**：スライム、ゴースト、スケルトンなど多彩な敵キャラクター
- **アイテム**：
  - スター：4秒間無敵＆スピードアップ
  - 剣：上位50%のプレイヤーを4秒間減速
- **川落下**：画面端に落ちると5秒待機、中央から復帰
- **カウントダウン**：ゲーム開始前に10秒のカウントダウン

---

## 技術構成

### サーバーサイド
- **Python 3.10**
- **Flask**（Webフレームワーク）
- **SQLite**（SQLAlchemy ORMで管理）
- **Flask-Migrate**（DBマイグレーション）

### クライアントサイド
- **HTML5 Canvas**（ゲーム描画）
- **JavaScript (ES6)**（ゲームロジック）
- **Bootstrap 5.3.0**（UIデザイン）
- **WWS.js**（カスタムゲームエンジン）

### デプロイ
- **Render.com**（クラウドホスティング）
- **Dockerfile**（コンテナ化）
- **Procfile**（プロセス管理）

---

## ゲームルール

1. **制限時間**：2分
2. **操作方法**：画面タップで進行方向を左右に切り替え
3. **障害物**：
   - 敵に当たると3秒待機
   - 川に落ちると5秒待機、中央から復帰
4. **アイテム効果**：
   - スター：4秒間無敵＆スピードアップ
   - 剣：上位プレイヤーに減速効果
5. **勝利条件**：2分間で最も遠くまで進んだ人が勝ち

---

## ディレクトリ構成

```
RealtimeBattleGame/
├── app.py              # サーバー本体
├── config.py           # 設定
├── models.py           # DBモデル
├── views.py            # ルーティング
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── WWS.js
│   │   ├── game.js
│   │   ├── collision.js
│   │   ├── enemy.js
│   │   ├── ranking.js
│   │   └── ...
│   ├── images/
│   │   └── 各種ゲーム画像
│   └── sounds/
│       └── 効果音ファイル
├── templates/
│   ├── login.html
│   ├── ranking.html
│   ├── wait.html
│   └── gameBase/
│       └── index.html
├── Dockerfile
├── requirements.txt
├── runtime.txt
├── procfile
├── instance/
│   └── site.db
├── migrations/
│   └── DBマイグレーション関連
└── README.md
```

---

## 起動方法

### ローカルで動かす場合

1. **リポジトリを取得**
   ```bash
   git clone https://github.com/hayashichiho/RealtimeBattleGame.git
   cd RealtimeBattleGame
   ```

2. **依存パッケージのインストール**
   ```bash
   pip install -r requirements.txt
   ```

3. **データベース初期化**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. **サーバー起動**
   ```bash
   python app.py
   ```

5. **ゲーム開始**
   - ブラウザで `http://localhost:5000` にアクセス
   - プレイヤー名「admin」でログイン
   - 他のプレイヤーも参加可能
   - 管理者（admin）がゲーム開始ボタンを押す

### Render.comでデプロイ

1. GitHubリポジトリをRender.comに連携
2. Web Serviceとして設定
3. 必要な環境変数をセット
4. 自動デプロイ

---

## API一覧

- `POST /api/update_distance`：プレイヤーの進行距離を更新
- `GET /api/ranking`：現在のランキング取得
- `GET /api/players`：参加プレイヤー一覧取得
- `POST /api/apply_slow_effect`：減速効果を適用
- `GET /api/batch_data`：バッチでゲームデータ取得
- `POST /start_game`：ゲーム開始
- `POST /api/db_reset`：データベースリセット（管理者のみ）

---

## 今後の開発・改善予定

### サーバー側
- ゲーム終了時の大量出力を数回に分割
- パフォーマンス向上

### クライアント側
- ログイン画面のUI改善
- レスポンシブデザイン強化
- 効果音追加

---

## 推奨ブラウザ

- Chrome（推奨）
- Safari
- Firefox
- Edge

---

## 注意事項

- スマートフォンでプレイする場合はプライベートブラウザモードをオフにしてください
- ローカルストレージの利用を許可してください
- マルチタッチ操作は非対応です

---

## ライセンス

このプロジェクトは教育目的で作成されています。

---

## コントリビューション

バグ報告や機能提案は Issues でお知らせください。
