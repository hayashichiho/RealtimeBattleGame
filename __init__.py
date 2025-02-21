from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite+aiosqlite:///players.db"  # 非同期SQLiteのデータベースファイルを指定
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    False  # トラックモディフィケーションを無効化
)

# 非同期エンジンとセッションの設定
engine = create_async_engine(app.config["SQLALCHEMY_DATABASE_URI"], echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

db = SQLAlchemy(app)  # SQLAlchemyを初期化

from . import models, views

__all__ = ["app", "db", "models", "views"]
