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


@app.route("/")  # ルートURLにアクセスがあった場合の処理
def index():  # ログイン画面を表示
    return render_template("login.html")


@app.route(
    "/login", methods=["POST"]
)  # ログインフォームからPOSTリクエストがあった場合の処理
def login():
    player_name = request.form["name"]
    player_id = generate_unique_player_id()
    player = Player(player_id=player_id, name=player_name)
    db.session.add(player)
    db.session.commit()
    return redirect(
        url_for("wait", player_id=player_id, player_name=player_name)
    )  # プレイヤーIDと名前をクエリパラメータとして渡す


@app.route("/wait")  # 待機画面を表示
def wait():
    player_id = request.args.get("player_id")
    player_name = request.args.get("player_name")
    players = [p.name for p in Player.query.all()]
    game_started = False  # ゲームが開始されたかどうかのフラグ
    admin_name = "admin"  # 管理者の名前
    return render_template(
        "wait.html",
        player_id=player_id,
        player_name=player_name,
        players=players,
        game_started=game_started,
        admin_name=admin_name,
    )


@app.route("/start_game", methods=["POST"])  # ゲーム開始ボタンが押された場合の処理
def start_game():
    player_id = request.form["player_id"]
    return redirect(url_for("game", player_id=player_id))


@app.route("/game")  # ゲーム画面を表示
def game():
    player_id = request.args.get("player_id")
    return render_template("gameBase/index.html", player_id=player_id)


@app.route("/ranking")  # ランキング画面を表示
def ranking():
    return render_template("ranking.html")


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
            "is_active": player.is_active,
        }
    ), 201


@app.route("/api/players", methods=["GET"])  # プレイヤー一覧を取得
def get_players():
    players = Player.query.all()
    return jsonify(
        [
            {
                "player_id": player.player_id,
                "name": player.name,
                "distance": player.distance,
                "is_active": player.is_active,
            }
            for player in players
        ]
    )


@app.route("/api/update_distance", methods=["POST"])
def update_distance():
    data = request.get_json()
    player_id = data.get("player_id")
    distance = data.get("distance")

    player = Player.query.filter_by(player_id=player_id).first()
    if player:
        player.distance = distance
        db.session.commit()
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "Player not found"}), 404


@app.route("/api/end_game", methods=["POST"])  # ゲーム終了
def end_game():
    data = request.get_json()
    player_id = data.get("player_id")

    player = Player.query.filter_by(player_id=player_id).first()
    if player:
        player.is_active = False
        db.session.commit()
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "message": "Player not found"}), 404


@app.route("/api/ranking", methods=["GET"])  # ランキングを取得
def get_ranking():
    players = Player.query.order_by(Player.distance.desc()).all()
    return jsonify(
        [
            {
                "player_id": player.player_id,
                "name": player.name,
                "distance": player.distance,
            }
            for player in players
        ]
    )
