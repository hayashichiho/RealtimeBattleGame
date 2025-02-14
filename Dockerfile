# ベースイメージを指定
FROM python:3.9-slim

# 作業ディレクトリを設定
WORKDIR /app

# 必要なファイルをコピー
COPY requirements.txt requirements.txt
COPY . .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# ポートを公開
EXPOSE 5000

# アプリケーションを起動
CMD ["python", "app.py"]
