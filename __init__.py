from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///players.db"  # SQLiteのデータベースファイルを指定
)
db = SQLAlchemy(app)  # SQLAlchemyを初期化

from . import models, views

__all__ = ["app", "db", "models", "views"]  # 外部から参照可能なモジュール名を指定
