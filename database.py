import sqlite3

DATABASE_NAME = "football.db"

# ==========================
# DATABASE CONNECTION
# ==========================

def get_connection():

    conn = sqlite3.connect(DATABASE_NAME)

    conn.row_factory = sqlite3.Row

    return conn

# ==========================
# CREATE TABLES
# ==========================

def create_tables():

    conn = get_connection()

    cursor = conn.cursor()

    # Favorite Teams Table

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favorite_teams (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        team_name TEXT UNIQUE NOT NULL,

        team_logo TEXT,

        league_name TEXT,

        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
    """)

    conn.commit()

    conn.close()

# ==========================
# ADD FAVORITE TEAM
# ==========================

def add_favorite_team(

    team_name,
    team_logo="",
    league_name=""

):

    conn = get_connection()

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO favorite_teams
            (
                team_name,
                team_logo,
                league_name
            )
            VALUES
            (
                ?, ?, ?
            )
            """,
            (
                team_name,
                team_logo,
                league_name
            )
        )

        conn.commit()

        return True

    except sqlite3.IntegrityError:

        return False

    finally:

        conn.close()

# ==========================
# GET FAVORITES
# ==========================

def get_all_favorites():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM favorite_teams
    ORDER BY added_at DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]

# ==========================
# DELETE FAVORITE TEAM
# ==========================

def delete_favorite_team(team_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM favorite_teams
        WHERE id = ?
        """,
        (team_id,)
    )

    conn.commit()

    conn.close()

# ==========================
# DELETE FAVORITE TEAM BY NAME
# ==========================

def delete_favorite_by_name(team_name):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM favorite_teams
        WHERE team_name = ?
        """,
        (team_name,)
    )

    conn.commit()

    conn.close()

# ==========================
# CHECK TEAM EXISTS
# ==========================

def team_exists(team_name):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM favorite_teams
        WHERE team_name = ?
        """,
        (team_name,)
    )

    result = cursor.fetchone()

    conn.close()

    return result is not None

# ==========================
# TOTAL FAVORITES
# ==========================

def total_favorites():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM favorite_teams
        """
    )

    count = cursor.fetchone()[0]

    conn.close()

    return count

# ==========================
# TEST
# ==========================

if __name__ == "__main__":

    create_tables()

    print(
        "Database initialized successfully."
    )