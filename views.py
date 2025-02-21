import threading
from datetime import datetime, timedelta

from flask import (
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)

from . import app, db
from .models import Player, generate_unique_player_id

game_start_time = None

game_start_time = None
game_end_time = None
lock = threading.Lock()


@app.route("/api/game_times", methods=["GET"])
def get_game_times():
    if game_start_time and game_end_time:
        return jsonify(
            {
                "start_time": game_start_time.isoformat(),
                "end_time": game_end_time.isoformat(),
            }
        )
    else:
        return jsonify({"status": "error", "message": "Game times not set"}), 404


@app.route("/api/current_time", methods=["GET"])
def get_current_time():
    return jsonify({"current_time": datetime.utcnow().isoformat()})


@app.route("/api/game_status", methods=["GET"])
def game_status():
    game_started = Player.query.filter_by(game_started=True).first() is not None
    return jsonify({"game_started": game_started})


@app.route("/api/ranking", methods=["GET"])
def get_ranking():
    players = Player.query.order_by(Player.distance.desc()).all()
    return jsonify(
        [
            {
                "player_id": player.player_id,
                "name": player.name,
                "distance": player.distance * 4,  # 距離を4倍にして表示
            }
            for player in players
        ]
    )


@app.route("/api/update_distance", methods=["POST"])  # 距離を更新する処理
def update_distance():
    data = request.get_json()  # リクエストのJSONデータを取得
    player_id = data.get("player_id")  # プレイヤーIDを取得
    distance = data.get("distance")  # 距離を取得

    try:
        db.session.begin(subtransactions=True)  # トランザクションを開始
        player = Player.query.filter_by(player_id=player_id).first()  # プレイヤーを取得
        if player:
            player.distance = distance  # 距離を更新
            db.session.commit()  # コミット
            return jsonify({"status": "success"}), 200  # 成功時のレスポンス
        else:
            db.session.rollback()  # ロールバック
            return jsonify(
                {"status": "error", "message": "Player not found"}
            ), 404  # 失敗時のレスポンス
    except Exception as e:
        db.session.rollback()  # ロールバック
        return jsonify(
            {"status": "error", "message": str(e)}
        ), 500  # 失敗時のレスポンス


@app.route("/api/end_game", methods=["POST"])  # ゲームを終了する処理
def end_game():
    data = request.get_json()  # リクエストのJSONデータを取得
    player_id = data.get("player_id")  # プレイヤーIDを取得

    try:
        db.session.begin(subtransactions=True)  # トランザクションを開始
        player = Player.query.filter_by(player_id=player_id).first()  # プレイヤーを取得
        if player:
            player.game_started = False  # ゲームを終了
            db.session.commit()  # コミット
            return jsonify({"status": "success"}), 200  # 成功時のレスポンス
        else:
            db.session.rollback()  # ロールバック
            return jsonify(
                {"status": "error", "message": "Player not found"}
            ), 404  # 失敗時のレスポンス
    except Exception as e:
        db.session.rollback()  # ロールバック
        return jsonify(
            {"status": "error", "message": str(e)}
        ), 500  # 失敗時のレスポンス


@app.route("/game")  # ゲーム開始時の処理
def game():
    player_id = request.args.get("player_id")  # プレイヤーIDを取得
    return render_template(
        "gameBase/index.html", player_id=player_id
    )  # ゲーム画面を表示


@app.route("/ranking")  # ランキング画面の処理
def ranking():
    return render_template("ranking.html")  # ランキング画面を表示


@app.route("/")  # ルートURLにアクセスがあった場合の処理
def index():
    return render_template("login.html")  # ログイン画面を表示


@app.route(
    "/login", methods=["POST"]
)  # ログインフォームからPOSTリクエストがあった場合の処理
def login():
    player_name = request.form["name"]  # プレイヤー名を取得
    player_id = generate_unique_player_id()  # プレイヤーIDを生成
    player = Player(
        player_id=player_id, name=player_name
    )  # プレイヤークラスのインスタンスを生成
    db.session.add(player)  # プレイヤーをデータベースに追加
    db.session.commit()  # データベースにコミット
    return redirect(
        url_for("wait", player_id=player_id, player_name=player_name)
    )  # 待機画面にリダイレクト


@app.route("/wait")  # 待機画面を表示
def wait():
    player_id = request.args.get("player_id")  # プレイヤーIDを取得
    player_name = request.args.get("player_name")  # プレイヤー名を取得
    players = [p.name for p in Player.query.all()]  # プレイヤー一覧を取得
    admin_name = "admin"  # 管理者の名前

    return render_template(
        "wait.html",  # 待機画面を表示
        player_id=player_id,
        player_name=player_name,
        players=players,
        admin_name=admin_name,
    )


game_start_time = None
game_end_time = None


@app.route("/start_game", methods=["POST"])
def start_game():
    global game_start_time, game_end_time
    game_start_time = datetime.utcnow() + timedelta(seconds=5)  # 5秒後にゲーム開始
    game_end_time = game_start_time + timedelta(seconds=68)  # 1分後にゲーム終了
    Player.query.update({Player.game_started: True})
    db.session.commit()
    return jsonify(
        {
            "status": "success",
            "start_time": game_start_time.isoformat(),
            "end_time": game_end_time.isoformat(),
        }
    )


@app.route("/static/js/<path:filename>")  # 静的ファイルのJSを提供
def serve_js(filename):
    return send_from_directory("static/js", filename)


@app.route("/static/images/<path:filename>")  # 静的ファイルの画像を提供
def serve_images(filename):
    return send_from_directory("static/images", filename)


@app.route("/api/register", methods=["POST"])  # プレイヤーを登録
def register_player():
    data = request.get_json()
    player_id = generate_unique_player_id()
    player = Player(player_id=player_id, name=data["name"])
    db.session.add(player)
    db.session.commit()
    return jsonify(
        {
            "player_id": player.player_id,
            "name": player.name,
            "distance": player.distance,
            "game_started": player.game_started,
        }
    ), 201


@app.route("/api/players", methods=["GET"])
def get_players():
    players = Player.query.all()
    return jsonify(
        [
            {
                "player_id": player.player_id,
                "name": player.name,
                "distance": player.distance,
                "game_started": player.game_started,
            }
            for player in players
        ]
    )
