import requests

# ==========================
# CONFIG
# ==========================

API_KEY = "3"

BASE_URL = f"https://www.thesportsdb.com/api/v1/json/{API_KEY}"

# ==========================
# HELPER FUNCTION
# ==========================

def get_data(endpoint):

    try:

        response = requests.get(endpoint)

        response.raise_for_status()

        return response.json()

    except requests.exceptions.RequestException as e:

        return {
            "error": str(e)
        }

# ==========================
# TEAM SEARCH
# ==========================

def search_team(team_name):

    endpoint = (
        f"{BASE_URL}/searchteams.php"
        f"?t={team_name}"
    )

    return get_data(endpoint)

# ==========================
# PLAYER SEARCH
# ==========================

def search_player(player_name):

    endpoint = (
        f"{BASE_URL}/searchplayers.php"
        f"?p={player_name}"
    )

    return get_data(endpoint)

# ==========================
# LEAGUE TABLE
# ==========================

def get_league_table(
    league_id="4328",
    season="2023-2024"
):

    endpoint = (
        f"{BASE_URL}/lookuptable.php"
        f"?l={league_id}&s={season}"
    )

    return get_data(endpoint)

# ==========================
# UPCOMING MATCHES
# ==========================

def get_upcoming_matches(
    league_id="4328"
):

    endpoint = (
        f"{BASE_URL}/eventsnextleague.php"
        f"?id={league_id}"
    )

    return get_data(endpoint)

# ==========================
# PREVIOUS MATCHES
# ==========================

def get_previous_matches(
    league_id="4328"
):

    endpoint = (
        f"{BASE_URL}/eventspastleague.php"
        f"?id={league_id}"
    )

    return get_data(endpoint)

# ==========================
# TEAM DETAILS
# ==========================

def get_team_details(
    team_id
):

    endpoint = (
        f"{BASE_URL}/lookupteam.php"
        f"?id={team_id}"
    )

    return get_data(endpoint)

# ==========================
# TEAM PLAYERS
# ==========================

def get_team_players(
    team_id
):

    endpoint = (
        f"{BASE_URL}/lookup_all_players.php"
        f"?id={team_id}"
    )

    return get_data(endpoint)

# ==========================
# LEAGUE TEAMS
# ==========================

def get_all_teams(
    league_name
):

    endpoint = (
        f"{BASE_URL}/search_all_teams.php"
        f"?l={league_name}"
    )

    return get_data(endpoint)

# ==========================
# TEAM BADGE
# ==========================

def get_team_badge(
    team_name
):

    data = search_team(team_name)

    if (
        "teams" in data
        and data["teams"]
    ):

        return data["teams"][0].get(
            "strBadge"
        )

    return None

# ==========================
# PLAYER IMAGE
# ==========================

def get_player_image(
    player_name
):

    data = search_player(
        player_name
    )

    if (
        "player" in data
        and data["player"]
    ):

        return data["player"][0].get(
            "strThumb"
        )

    return None

# ==========================
# TESTING
# ==========================

if __name__ == "__main__":

    print(
        search_team("Arsenal")
    )

    print(
        search_player(
            "Lionel Messi"
        )
    )