from flask import (
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)

from . import app, db
from .models import Player


@app.route("/")  # ルートURLにアクセスがあった場合の処理
def index():  # ログイン画面を表示
    return render_template("login.html")


@app.route(
    "/login", methods=["POST"]
)  # ログインフォームからPOSTリクエストがあった場合の処理
def login():
    player_name = request.form["name"]
    return redirect(
        url_for("wait", player=player_name)
    )  # プレイヤー名をクエリパラメータとして渡す


@app.route("/wait")  # 待機画面を表示
def wait():
    player = request.args.get("player")
    players = [p.name for p in Player.query.all()]
    game_started = False  # ゲームが開始されたかどうかのフラグ
    admin_name = "admin"  # 管理者の名前
    return render_template(
        "wait.html",
        player=player,
        players=players,
        game_started=game_started,
        admin_name=admin_name,
    )


@app.route("/start_game", methods=["POST"])  # ゲーム開始ボタンが押された場合の処理
def start_game():
    return redirect(url_for("game"))


@app.route("/game")  # ゲーム画面を表示
def game():
    return render_template("gameBase/index.html")


@app.route("/static/js/<path:filename>")  # 静的ファイルのJSを提供
def serve_js(filename):
    return send_from_directory("static/js", filename)


@app.route("/static/images/<path:filename>")  # 静的ファイルの画像を提供
def serve_images(filename):
    return send_from_directory("static/images", filename)


@app.route("/api/players", methods=["GET"])  # プレイヤー一覧を取得
def get_players():
    players = Player.query.all()
    return jsonify([{"id": player.id, "name": player.name} for player in players])


@app.route("/api/players", methods=["POST"])  # プレイヤーを追加
def add_player():
    new_player = request.get_json()
    player = Player(name=new_player["name"])
    db.session.add(player)
    db.session.commit()
    return jsonify({"id": player.id, "name": player.name}), 201
