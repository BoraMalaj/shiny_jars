from flask import Flask, render_template, jsonify
import os
import json
import random

app = Flask(__name__)

# Load Latin phrases from JSON file
phrases_file = "latin-phrases.json"
if os.path.exists(phrases_file):
    with open(phrases_file, "r", encoding="utf-8") as f:
        phrases_data = json.load(f)
else:
    phrases_data = {"phrases": []}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/random-phrase')
def random_phrase():
    if phrases_data["phrases"]:
        phrase = random.choice(phrases_data["phrases"])
        return jsonify(phrase)
    return jsonify({"latin": "", "translation": ""})

if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
    