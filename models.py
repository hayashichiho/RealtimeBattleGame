import random

from . import db


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.String(10), unique=True, nullable=False)  # プレイヤーID
    name = db.Column(db.String(100), nullable=False)
    distance = db.Column(db.Float, default=0.0)  # プレイヤーの進行距離
    is_active = db.Column(db.Boolean, default=True)  # プレイヤーがゲーム中かどうか


def generate_unique_player_id():
    while True:
        player_id = "".join(random.choices("0123456789", k=10))
        if not Player.query.filter_by(player_id=player_id).first():
            return player_id
