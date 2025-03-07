from flask import Flask, request, jsonify

app = Flask(__name__)

# Gantilah dengan signature yang diharapkan
expected_signature = "your_expected_signature"

@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json()

    # Ambil signature dari header (sesuaikan dengan format API yang digunakan)
    signature = request.headers.get("X-Signature")

    if signature != expected_signature:
        print("▲ Webhook signature mismatch")
        return jsonify({"error": "Invalid signature"}), 403

    print("✅ Webhook received:", data)
    return jsonify({"message": "Success"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
