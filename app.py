from flask import (
    Flask,
    flash,
    g,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)

app = Flask(__name__)  # インスタンス化
app.secret_key = "your_secret_key"  # フラッシュメッセージのためのシークレットキー

players = []  # プレイヤーの名前を格納
game_started = False  # ゲームが開始されたかどうかを格納
admin_name = "hayashi"  # 管理者の名前を設定


@app.before_request  # リクエストが来た時に実行される関数
def before_request():
    g.players = players
    g.game_started = game_started


@app.route("/")  # ルートディレクトリにアクセスした時に実行される関数
def index():
    return render_template("login.html")


@app.route("/login", methods=["POST"])  # ログインボタンを押した時に実行される関数
def login():
    player_name = request.form["name"]
    if player_name and player_name not in g.players:
        g.players.append(player_name)
        return redirect(url_for("wait", player=player_name))
    else:
        flash("その名前は既に使用されています。別の名前を入力してください。")
        return redirect(url_for("index"))


@app.route("/wait")  # 待機画面にアクセスした時に実行される関数
def wait():
    player_name = request.args.get("player")
    return render_template(
        "wait.html",
        player=player_name,
        players=g.players,
        game_started=g.game_started,
        admin_name=admin_name,
    )


@app.route(
    "/start_game", methods=["POST"]
)  # ゲームスタートボタンを押した時に実行される関数
def start_game():
    global game_started
    game_started = True
    g.game_started = game_started
    return redirect(url_for("game"))


@app.route("/game")  # ゲーム画面にアクセスした時に実行される関数
def game():
    return send_from_directory(
        "gameBase", "index.html"
    )  # gameBaseディレクトリのindex.htmlを返す


@app.route("/gameBase/<path:filename>")  # gameBaseディレクトリのファイルを返す
def serve_game_files(filename):
    return send_from_directory("gameBase", filename)


if __name__ == "__main__":
    app.run(debug=True)  # デバッグモードでアプリケーションを起動
