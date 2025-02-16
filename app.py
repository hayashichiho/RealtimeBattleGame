import os
import sys

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ss2413 import app, db

with app.app_context():
    db.create_all()  # SQLiteのデータベースファイルを作成

if __name__ == "__main__":
    app.run(debug=True)
