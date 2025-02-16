import os
import sys

# プロジェクトのルートディレクトリをパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ss2413 import app, db

if __name__ == "__main__":
    db.create_all()  # SQLiteのデータベースファイルを作成
    app.run(
        host="0.0.0.0", port=5000, debug=True
    )  # ポート5000でFlaskアプリケーションを起動
