from flask import Flask, g, redirect, render_template, request, url_for

app = Flask(__name__)

players = []
game_started = False
admin_name = "admin"  # 管理者の名前を設定


@app.before_request
def before_request():
  g.players = players
  g.game_started = game_started


@app.route("/")
def index():
  return render_template("login.html")


@app.route("/login", methods=["POST"])
def login():
  player_name = request.form["name"]
  if player_name and player_name not in g.players:
    g.players.append(player_name)
    return redirect(url_for("wait", player=player_name))
  return redirect(url_for("index"))


@app.route("/wait")
def wait():
  player_name = request.args.get("player")
  return render_template(
    "wait.html", player=player_name, players=g.players, game_started=g.game_started, admin_name=admin_name
  )


@app.route("/start_game", methods=["POST"])
def start_game():
  global game_started
  game_started = True
  g.game_started = game_started
  return "Game started"


if __name__ == "__main__":
  app.run()
