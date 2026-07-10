"""
Democratizing Sports Talent Assessment
Backend Application

Hackathon Project
Author: Ravin Arockia
Year: 2026
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "project": "Democratizing Sports Talent Assessment",
        "status": "Backend is running successfully",
        "version": "1.0.0"
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "OK",
        "message": "API is working"
    })

if __name__ == "__main__":
    app.run(debug=True)
