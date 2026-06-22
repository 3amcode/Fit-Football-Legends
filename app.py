from flask import Flask, render_template, jsonify, request
import database
import football_api
import ai_pridictor  # Spelled with 'i' as in workspace filename ai_pridictor.py
from datetime import datetime

app = Flask(__name__)

# =========================
# INITIALIZE DATABASE
# =========================

database.create_tables()

# =========================
# WEB PAGES
# =========================

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/team")
def team_page():
    return render_template("team.html")

@app.route("/player")
def player_page():
    return render_template("player.html")

# =========================
# TEAM SEARCH
# =========================

@app.route("/api/team/<team_name>")
def team_search(team_name):
    data = football_api.search_team(team_name)
    return jsonify(data)

# =========================
# PLAYER SEARCH
# =========================

@app.route("/api/player/<player_name>")
def player_search(player_name):
    data = football_api.search_player(player_name)
    return jsonify(data)

# =========================
# LEAGUE STANDINGS
# =========================

@app.route("/api/standings")
def standings():
    data = football_api.get_league_table()
    return jsonify(data)

# =========================
# UPCOMING MATCHES
# =========================

@app.route("/api/upcoming-matches")
def upcoming_matches():
    data = football_api.get_upcoming_matches()
    return jsonify(data)

# =========================
# PREVIOUS MATCHES
# =========================

@app.route("/api/previous-matches")
def previous_matches():
    data = football_api.get_previous_matches()
    return jsonify(data)

# =========================
# TEAM DETAILS & SQUAD (Used by team.html)
# =========================

@app.route("/api/team-details/<team_id>")
def team_details(team_id):
    data = football_api.get_team_details(team_id)
    return jsonify(data)

@app.route("/api/team-players/<team_id>")
def team_players(team_id):
    data = football_api.get_team_players(team_id)
    return jsonify(data)

# =========================
# FAVORITES API
# =========================

@app.route("/api/favorite", methods=["POST"])
def add_favorite():
    data = request.get_json()
    if not data or "team_name" not in data:
        return jsonify({"status": "error", "message": "Missing team_name"}), 400

    team_name = data["team_name"]
    team_logo = data.get("team_logo", "")
    league_name = data.get("league_name", "")

    # If badge and league aren't sent, lookup from API
    if not team_logo or not league_name:
        api_data = football_api.search_team(team_name)
        if api_data and "teams" in api_data and api_data["teams"]:
            team_info = api_data["teams"][0]
            if not team_logo:
                team_logo = team_info.get("strBadge", "")
            if not league_name:
                league_name = team_info.get("strLeague", "")

    success = database.add_favorite_team(
        team_name=team_name,
        team_logo=team_logo,
        league_name=league_name
    )

    if success:
        return jsonify({"status": "success", "team": team_name})
    else:
        return jsonify({"status": "exists", "message": "Team already in favorites", "team": team_name})

@app.route("/api/favorites")
def favorites():
    favs = database.get_all_favorites()
    return jsonify(favs)

@app.route("/api/favorite/delete", methods=["POST"])
def delete_favorite():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    team_id = data.get("id")
    team_name = data.get("team_name")

    if team_id:
        database.delete_favorite_team(team_id)
        return jsonify({"status": "success", "id": team_id})
    elif team_name:
        database.delete_favorite_by_name(team_name)
        return jsonify({"status": "success", "team_name": team_name})
    else:
        return jsonify({"status": "error", "message": "Missing id or team_name"}), 400

# =========================
# AI MATCH PREDICTION
# =========================

@app.route("/api/predict")
def predict():
    team1 = request.args.get("team1", "").strip()
    team2 = request.args.get("team2", "").strip()

    if not team1 or not team2:
        return jsonify({"error": "Missing team parameters"}), 400

    analysis = ai_pridictor.match_analysis(team1, team2)
    return jsonify(analysis)

# =========================
# HEALTH CHECK
# =========================

@app.route("/api/status")
def status():
    return jsonify({
        "status": "online",
        "project": "Fit Football Legends Dashboard"
    })

# =========================
# MAIN ENTRYPOINT
# =========================

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )