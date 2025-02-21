import random

from . import db


class Player(db.Model):
    player_id = db.Column(
        db.String(10), primary_key=True, unique=True, nullable=False
    )  # プレイヤーID
    name = db.Column(db.String(100), nullable=False)
    distance = db.Column(db.Float, default=0.0)  # プレイヤーの進行距離
    game_started = db.Column(db.Boolean, default=False)  # ゲームが開始されたかどうか


def generate_unique_player_id():
    while True:
        player_id = "".join(random.choices("0123456789", k=10))
        if not Player.query.filter_by(player_id=player_id).first():
            return player_id
