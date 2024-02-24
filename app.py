from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # Import the CORS module
import json
import re
import random_responses

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load JSON data
def load_json(file):
    with open(file) as bot_responses:
        print(f"Loaded '{file}' successfully!")
        return json.load(bot_responses)

# Store JSON data
response_data = load_json("bot.json")

@app.route("/")
def index():
    return render_template("bot.html")

@app.route("/get_response", methods=["POST"])
def get_bot_response():
    user_input = request.json.get("user_input")
    bot_response = get_response(user_input)
    return jsonify({"bot_response": bot_response})

def get_response(input_string):
    split_message = re.split(r'\s+|[,;?!.-]\s*', input_string.lower())
    score_list = []

    # Check all the responses
    for response in response_data:
        response_score = 0
        required_score = 0
        required_words = response["required_words"]

        # Check if there are any required words
        if required_words:
            for word in split_message:
                if word in required_words:
                    required_score += 1

        # Amount of required words should match the required score
        if required_score == len(required_words):
            # Check each word the user has typed
            for word in split_message:
                # If the word is in the response, add to the score
                if word in response["user_input"]:
                    response_score += 1

        # Add score to list
        score_list.append(response_score)

    # Find the best response and return it if they're not all 0
    best_response = max(score_list)
    response_index = score_list.index(best_response)

    # If there is no good response, return a random one.
    if best_response != 0:
        return response_data[response_index]["bot_response"]

    return random_responses.random_string()

if __name__ == "__main__":
    app.run(debug=True)
