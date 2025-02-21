import os
import sys

from flask_migrate import Migrate

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ss2413 import app, db
from ss2413.config import config

# 環境変数に基づいて設定を読み込む
env = os.getenv("FLASK_ENV", "development")
app.config.from_object(config[env])

migrate = Migrate(app, db)  # Flask-Migrateの設定

if env == "development":
    with app.app_context():
        db.drop_all()  # SQLiteのデータベースファイルを削除
        db.create_all()  # SQLiteのデータベースファイルを作成

if __name__ == "__main__":
    app.run(debug=config[env].DEBUG, threaded=True)
