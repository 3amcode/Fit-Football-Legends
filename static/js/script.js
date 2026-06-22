// ==========================================================================
// FIT FOOTBALL LEGENDS — CLIENT FRONTEND LOGIC
// script.js
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    loadStandings();
    loadUpcomingMatches();
    loadPreviousMatches();
    loadFavorites();
});

// ==========================================================================
// LEAGUE STANDINGS
// ==========================================================================
async function loadStandings() {
    try {
        const response = await fetch("/api/standings");
        const data = await response.json();
        const tableBody = document.getElementById("standingsTable");

        if (!data.table || data.table.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="9">
                    <div class="loading-state">
                        <i class="fa-solid fa-circle-info" style="font-size:2rem;color:var(--text-3)"></i>
                        <p>No standings data available.</p>
                    </div>
                </td></tr>
            `;
            return;
        }

        tableBody.innerHTML = "";

        data.table.forEach((team, index) => {
            // Form badges
            let formHtml = "";
            if (team.strForm) {
                team.strForm.split("").forEach(ch => {
                    formHtml += `<span class="form-pill ${ch}">${ch}</span>`;
                });
            } else {
                formHtml = `<span style="color:var(--text-3)">—</span>`;
            }

            const badgeUrl = team.strBadge || "";
            const badgeImg = badgeUrl
                ? `<img src="${badgeUrl}" alt="${team.strTeam}" loading="lazy">`
                : `<i class="fa-solid fa-shield-halved" style="font-size:1.2rem;color:var(--text-3)"></i>`;

            // Zone class for colour-coded left border
            let zoneClass = "";
            const rank = parseInt(team.intRank);
            if (rank <= 4)       zoneClass = "ucl-zone";
            else if (rank <= 6)  zoneClass = "uel-zone";
            else if (rank >= 18) zoneClass = "rel-zone";

            tableBody.innerHTML += `
                <tr class="${zoneClass}">
                    <td><span class="rank-num">${team.intRank}</span></td>
                    <td>
                        <a href="javascript:void(0)" onclick="viewTeamDetailsByName('${escAttr(team.strTeam)}')" class="team-cell">
                            ${badgeImg}
                            <span>${team.strTeam}</span>
                        </a>
                    </td>
                    <td>${team.intPlayed}</td>
                    <td>${team.intWin}</td>
                    <td>${team.intDraw}</td>
                    <td>${team.intLoss}</td>
                    <td>${team.intGoalDifference > 0 ? '+' + team.intGoalDifference : team.intGoalDifference}</td>
                    <td><span class="pts-badge">${team.intPoints}</span></td>
                    <td><div class="form-pills">${formHtml}</div></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error loading standings:", error);
        document.getElementById("standingsTable").innerHTML = `
            <tr><td colspan="9">
                <div class="error-state">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem"></i>
                    <p>Failed to load standings: ${error.message}</p>
                </div>
            </td></tr>
        `;
    }
}

// ==========================================================================
// MATCH CENTRE — UPCOMING & PREVIOUS
// ==========================================================================
async function loadUpcomingMatches() {
    try {
        const response = await fetch("/api/upcoming-matches");
        const data = await response.json();
        const container = document.getElementById("upcomingMatches");

        container.innerHTML = "";

        if (!data.events || data.events.length === 0) {
            container.innerHTML = `
                <div class="no-data-alert" style="grid-column:1/-1">
                    <i class="fa-regular fa-calendar-xmark"></i>
                    <p>No upcoming fixtures scheduled.</p>
                </div>`;
            return;
        }

        data.events.slice(0, 6).forEach(match => {
            const dateStr = match.strTimestamp
                ? new Date(match.strTimestamp).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : match.dateEvent;

            container.innerHTML += `
                <div class="fixture-card">
                    <div class="fixture-competition">
                        <i class="fa-solid fa-shield"></i> Premier League
                    </div>
                    <div class="fixture-teams">
                        <span class="fixture-team home">${match.strHomeTeam}</span>
                        <span class="fixture-vs-badge">VS</span>
                        <span class="fixture-team away">${match.strAwayTeam}</span>
                    </div>
                    <div class="fixture-meta">
                        <i class="fa-regular fa-clock"></i> ${dateStr}
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error("Error loading upcoming matches:", error);
        document.getElementById("upcomingMatches").innerHTML = `
            <div class="error-state" style="grid-column:1/-1">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Failed to load upcoming fixtures.</p>
            </div>`;
    }
}

async function loadPreviousMatches() {
    try {
        const response = await fetch("/api/previous-matches");
        const data = await response.json();
        const container = document.getElementById("previousMatches");

        container.innerHTML = "";

        if (!data.events || data.events.length === 0) {
            container.innerHTML = `
                <div class="no-data-alert" style="grid-column:1/-1">
                    <i class="fa-regular fa-calendar-check"></i>
                    <p>No recent matches found.</p>
                </div>`;
            return;
        }

        data.events.slice(0, 6).forEach(match => {
            const homeScore = match.intHomeScore !== null ? match.intHomeScore : "–";
            const awayScore = match.intAwayScore !== null ? match.intAwayScore : "–";

            // Determine result for home team styling
            let homeClass = "", awayClass = "";
            if (match.intHomeScore !== null && match.intAwayScore !== null) {
                if (match.intHomeScore > match.intAwayScore) {
                    homeClass = "style='color:var(--green)'";
                } else if (match.intHomeScore < match.intAwayScore) {
                    awayClass = "style='color:var(--green)'";
                }
            }

            container.innerHTML += `
                <div class="fixture-card">
                    <div class="fixture-competition">
                        <i class="fa-solid fa-flag-checkered"></i> Full Time
                    </div>
                    <div class="fixture-teams">
                        <span class="fixture-team home" ${homeClass}>${match.strHomeTeam}</span>
                        <span class="fixture-score-badge">${homeScore} – ${awayScore}</span>
                        <span class="fixture-team away" ${awayClass}>${match.strAwayTeam}</span>
                    </div>
                    <div class="fixture-meta">
                        <i class="fa-regular fa-calendar-check"></i> ${match.dateEvent}
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error("Error loading past matches:", error);
        document.getElementById("previousMatches").innerHTML = `
            <div class="error-state" style="grid-column:1/-1">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Failed to load past results.</p>
            </div>`;
    }
}

// ==========================================================================
// SEARCH — TEAM
// ==========================================================================
async function searchTeam() {
    const input = document.getElementById("teamInput");
    const query = input.value.trim();
    const resultBox = document.getElementById("teamResult");

    if (!query) {
        showInlineAlert(resultBox, "Please enter a team name to search.");
        return;
    }

    resultBox.innerHTML = `<div class="loading-state" style="padding:20px">
        <div class="loading-spinner-ring"></div><p>Searching…</p>
    </div>`;

    try {
        const response = await fetch(`/api/team/${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.teams || data.teams.length === 0) {
            resultBox.innerHTML = `<div class="no-data-alert">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>No clubs found matching "<strong>${escHTML(query)}</strong>".</p>
            </div>`;
            return;
        }

        const team = data.teams[0];
        const badgeUrl = team.strBadge || "";
        const badgeImg = badgeUrl
            ? `<img src="${badgeUrl}" alt="${escHTML(team.strTeam)}">`
            : `<i class="fa-solid fa-shield-halved" style="font-size:3rem;color:var(--text-3)"></i>`;

        resultBox.innerHTML = `
            <div class="result-card">
                <div class="result-badge">${badgeImg}</div>
                <div class="result-info">
                    <h4>${escHTML(team.strTeam)}</h4>
                    <div class="result-meta">
                        <span><i class="fa-solid fa-ranking-star"></i> ${team.strLeague || "N/A"}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${team.strStadium || "N/A"}</span>
                        <span><i class="fa-solid fa-globe"></i> ${team.strCountry || "N/A"}</span>
                    </div>
                    <div class="result-actions">
                        <button class="btn-sm btn-primary-sm"
                            onclick="addFavoriteFromSearch('${escAttr(team.strTeam)}', '${escAttr(badgeUrl)}', '${escAttr(team.strLeague || '')}')">
                            <i class="fa-solid fa-heart"></i> Favorite
                        </button>
                        <a href="/team?id=${team.idTeam}" class="btn-sm btn-ghost-sm">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Squad View
                        </a>
                    </div>
                </div>
            </div>`;

    } catch (error) {
        console.error("Error searching team:", error);
        resultBox.innerHTML = `<div class="no-data-alert text-danger">
            <p>Search failed: ${error.message}</p>
        </div>`;
    }
}

// ==========================================================================
// SEARCH — PLAYER
// ==========================================================================
async function searchPlayer() {
    const input = document.getElementById("playerInput");
    const query = input.value.trim();
    const resultBox = document.getElementById("playerResult");

    if (!query) {
        showInlineAlert(resultBox, "Please enter a player name to search.");
        return;
    }

    resultBox.innerHTML = `<div class="loading-state" style="padding:20px">
        <div class="loading-spinner-ring"></div><p>Searching…</p>
    </div>`;

    try {
        const response = await fetch(`/api/player/${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.player || data.player.length === 0) {
            resultBox.innerHTML = `<div class="no-data-alert">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>No players found matching "<strong>${escHTML(query)}</strong>".</p>
            </div>`;
            return;
        }

        const player = data.player[0];
        const thumbUrl = player.strThumb || "";
        const thumbImg = thumbUrl
            ? `<img src="${thumbUrl}" alt="${escHTML(player.strPlayer)}">`
            : `<i class="fa-solid fa-user-ninja" style="font-size:2.5rem;color:var(--text-3)"></i>`;

        resultBox.innerHTML = `
            <div class="result-card">
                <div class="result-badge player-thumb">${thumbImg}</div>
                <div class="result-info">
                    <h4>${escHTML(player.strPlayer)}</h4>
                    <div class="result-meta">
                        <span><i class="fa-solid fa-shield-halved"></i> ${player.strTeam || "N/A"}</span>
                        <span><i class="fa-solid fa-shirt"></i> ${player.strPosition || "N/A"}</span>
                        <span><i class="fa-solid fa-flag"></i> ${player.strNationality || "N/A"}</span>
                    </div>
                    <div class="result-actions">
                        <a href="/player?name=${encodeURIComponent(player.strPlayer)}" class="btn-sm btn-primary-sm">
                            <i class="fa-solid fa-address-card"></i> View Profile
                        </a>
                    </div>
                </div>
            </div>`;

    } catch (error) {
        console.error("Error searching player:", error);
        resultBox.innerHTML = `<div class="no-data-alert text-danger">
            <p>Search failed: ${error.message}</p>
        </div>`;
    }
}

// Helper: navigate to team by name
async function viewTeamDetailsByName(teamName) {
    try {
        const response = await fetch(`/api/team/${encodeURIComponent(teamName)}`);
        const data = await response.json();
        if (data.teams && data.teams.length > 0) {
            window.location.href = `/team?id=${data.teams[0].idTeam}`;
        } else {
            alert(`Unable to find team: ${teamName}`);
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================================================
// FAVORITES
// ==========================================================================
async function loadFavorites() {
    try {
        const response = await fetch("/api/favorites");
        const favs = await response.json();
        const container = document.getElementById("favoriteTeams");

        if (favs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fa-regular fa-bookmark"></i></div>
                    <h4>No favorites yet</h4>
                    <p>Search for a club above and click <strong>"Favorite"</strong> to pin it here.</p>
                </div>`;
            return;
        }

        container.innerHTML = "";
        favs.forEach(team => {
            const logo = team.team_logo || "";
            const logoImg = logo
                ? `<img src="${logo}" alt="${escHTML(team.team_name)}">`
                : `<i class="fa-solid fa-shield-halved" style="font-size:3rem;color:var(--text-3)"></i>`;

            container.innerHTML += `
                <div class="fav-card">
                    <div class="fav-logo">${logoImg}</div>
                    <h4>${escHTML(team.team_name)}</h4>
                    <p class="fav-league">${team.league_name || "Football League"}</p>
                    <div class="fav-actions">
                        <button class="btn-sm btn-ghost-sm" onclick="viewTeamDetailsByName('${escAttr(team.team_name)}')">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Details
                        </button>
                        <button class="btn-sm btn-danger-sm" onclick="deleteFavorite(${team.id}, '${escAttr(team.team_name)}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error("Error loading favorites:", error);
    }
}

async function addFavoriteFromSearch(teamName, teamLogo, leagueName) {
    try {
        const response = await fetch("/api/favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ team_name: teamName, team_logo: teamLogo, league_name: leagueName })
        });
        const data = await response.json();

        if (data.status === "success") {
            showToast(`${teamName} added to Favorites! ⭐`);
            loadFavorites();
        } else if (data.status === "exists") {
            showToast(`${teamName} is already in Favorites.`, 'info');
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error(error);
        alert(`Failed to add favorite: ${error.message}`);
    }
}

async function deleteFavorite(id, teamName) {
    if (!confirm(`Remove ${teamName} from Favorites?`)) return;

    try {
        const response = await fetch("/api/favorite/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.status === "success") {
            loadFavorites();
            showToast(`${teamName} removed from Favorites.`, 'info');
        } else {
            alert(`Failed to delete: ${data.message}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// ==========================================================================
// AI PREDICTOR
// ==========================================================================
async function predictMatch() {
    const team1 = document.getElementById("team1").value.trim();
    const team2 = document.getElementById("team2").value.trim();

    if (!team1 || !team2) {
        alert("Please enter both Home and Away team names.");
        return;
    }

    const resultBox = document.getElementById("predictionResult");
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<div class="loading-state">
        <div class="loading-spinner-ring"></div>
        <p>Running AI match simulation…</p>
    </div>`;

    try {
        const response = await fetch(`/api/predict?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`);

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to generate prediction");
        }

        const data = await response.json();
        const p1    = data.prediction.team1_win_probability;
        const pDraw = data.prediction.draw_probability;
        const p2    = data.prediction.team2_win_probability;

        resultBox.innerHTML = `
            <div class="pred-matchup-header">
                <h3><i class="fa-solid fa-brain"></i> AI Simulation Report</h3>
                <p>${escHTML(team1)} vs ${escHTML(team2)}</p>
            </div>

            <div class="pred-prob-section">
                <div class="pred-prob-labels">
                    <span class="lbl-t1"><i class="fa-solid fa-house"></i> ${escHTML(team1)} Win &nbsp; ${p1}%</span>
                    <span class="lbl-draw">Draw &nbsp; ${pDraw}%</span>
                    <span class="lbl-t2">${escHTML(team2)} Win &nbsp; ${p2}% &nbsp; <i class="fa-solid fa-plane"></i></span>
                </div>
                <div class="prob-bar">
                    <div class="prob-seg t1"   style="width:${p1}%">${p1 > 8 ? p1+'%' : ''}</div>
                    <div class="prob-seg draw"  style="width:${pDraw}%">${pDraw > 8 ? pDraw+'%' : ''}</div>
                    <div class="prob-seg t2"    style="width:${p2}%">${p2 > 8 ? p2+'%' : ''}</div>
                </div>
            </div>

            <div class="pred-cards-row">
                <div class="pred-info-card">
                    <div class="pred-info-card-label">Predicted Scoreline</div>
                    <div class="pred-info-card-value">
                        <i class="fa-solid fa-futbol"></i>
                        ${data.score.predicted_score}
                    </div>
                </div>
                <div class="pred-info-card">
                    <div class="pred-info-card-label">Predicted Star Player</div>
                    <div class="pred-info-card-value">
                        <i class="fa-solid fa-star star"></i>
                        ${escHTML(data.star_player)}
                    </div>
                </div>
            </div>`;

    } catch (error) {
        console.error("Prediction failed:", error);
        resultBox.innerHTML = `<div class="error-state">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem"></i>
            <p>Simulation failed: ${error.message}</p>
        </div>`;
    }
}

// ==========================================================================
// UTILITY HELPERS
// ==========================================================================

/** HTML-escape for display */
function escHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Attr-escape for inline event handlers */
function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'");
}

function showInlineAlert(container, message) {
    container.innerHTML = `<div class="no-data-alert"><p>${escHTML(message)}</p></div>`;
}

/** Toast notification */
function showToast(message, type = 'success') {
    const existing = document.getElementById('ffl-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'ffl-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 32px; right: 32px; z-index: 9999;
        background: ${type === 'success' ? 'var(--green)' : 'var(--bg-3)'};
        color: ${type === 'success' ? '#000' : 'var(--text-1)'};
        padding: 14px 24px; border-radius: 8px;
        font-weight: 700; font-size: 0.9rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        animation: slideInToast 0.3s ease;
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes slideInToast {
        from { opacity:0; transform: translateY(16px); }
        to   { opacity:1; transform: translateY(0); }
    }`;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}
