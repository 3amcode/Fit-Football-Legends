# ai_predictor.py

import random

# ==========================
# TEAM STRENGTH DATABASE
# ==========================

TEAM_RATINGS = {
    "Manchester City": 95,
    "Arsenal": 90,
    "Liverpool": 92,
    "Chelsea": 84,
    "Manchester United": 82,
    "Barcelona": 91,
    "Real Madrid": 96,
    "Atletico Madrid": 86,
    "Bayern Munich": 94,
    "PSG": 89,
    "Juventus": 85,
    "Inter Milan": 88,
}

# ==========================
# GET TEAM RATING
# ==========================

def get_team_rating(team_name):
    return TEAM_RATINGS.get(team_name, 75)

# ==========================
# MATCH PREDICTION
# ==========================

def predict_match(team1, team2):
    rating1 = get_team_rating(team1)
    rating2 = get_team_rating(team2)

    total = rating1 + rating2

    team1_win = round((rating1 / total) * 100)
    team2_win = round((rating2 / total) * 100)

    draw = random.randint(10, 20)

    team1_win -= draw // 2
    team2_win -= draw // 2

    return {
        "team1": team1,
        "team2": team2,
        "team1_win_probability": team1_win,
        "draw_probability": draw,
        "team2_win_probability": team2_win,
    }

# ==========================
# SCORE PREDICTION
# ==========================

def predict_score(team1, team2):
    goals1 = random.randint(0, 4)
    goals2 = random.randint(0, 4)

    return {
        "team1": team1,
        "team2": team2,
        "predicted_score": f"{goals1}-{goals2}",
    }

# ==========================
# MAN OF THE MATCH
# ==========================

def predict_star_player():
    players = [
        "Erling Haaland",
        "Kylian Mbappe",
        "Jude Bellingham",
        "Vinicius Jr",
        "Mohamed Salah",
        "Lionel Messi",
    ]

    return random.choice(players)

# ==========================
# COMPLETE AI ANALYSIS
# ==========================

def match_analysis(team1, team2):
    prediction = predict_match(team1, team2)
    score = predict_score(team1, team2)
    star_player = predict_star_player()

    return {
        "prediction": prediction,
        "score": score,
        "star_player": star_player,
    }

# ==========================
# TEST
# ==========================

if __name__ == "__main__":
    result = match_analysis(
        "Arsenal",
        "Liverpool"
    )

    print(result)