from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/webhook/bitnob")
def bitnob_webhook():
    data = request.json
    print("Received Bitnob webhook data:", data)

    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    app.run(debug=True)

    