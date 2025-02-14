from flask import (
    Flask,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "your_secret_key"  # セッションを使用するために必要
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///players.db"
db = SQLAlchemy(app)


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)


@app.route("/")
def index():
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login():
    player_name = request.form["name"]
    if not player_name:
        flash("プレイヤー名を入力してください")
        return redirect(url_for("index"))
    return redirect(url_for("wait", player=player_name))


@app.route("/wait")
def wait():
    player = request.args.get("player")
    players = [p.name for p in Player.query.all()]
    game_started = False  # ゲームが開始されたかどうかのフラグ
    admin_name = "admin"  # 管理者の名前（例）
    return render_template(
        "wait.html",
        player=player,
        players=players,
        game_started=game_started,
        admin_name=admin_name,
    )


@app.route("/start_game", methods=["POST"])
def start_game():
    return redirect(url_for("game"))


@app.route("/game")
def game():
    return render_template("gameBase/index.html")


@app.route("/static/js/<path:filename>")
def serve_js(filename):
    return send_from_directory("static/js", filename)


@app.route("/static/images/<path:filename>")
def serve_images(filename):
    return send_from_directory("static/images", filename)


@app.route("/api/players", methods=["GET"])
def get_players():
    players = Player.query.all()
    return jsonify([{"id": player.id, "name": player.name} for player in players])


@app.route("/api/players", methods=["POST"])
def add_player():
    new_player = request.get_json()
    player = Player(name=new_player["name"])
    db.session.add(player)
    db.session.commit()
    return jsonify({"id": player.id, "name": player.name}), 201


if __name__ == "__main__":
    db.create_all()
    app.run(host="0.0.0.0", port=5000)
