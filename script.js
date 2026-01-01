let allPlayers = [];
const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };

async function init() {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent("https://fantasy.premierleague.com/api/bootstrap-static/")}`;
    try {
        const res = await fetch(proxy);
        const data = await res.json();
        const fpl = JSON.parse(data.contents);
        allPlayers = fpl.elements;
        render(allPlayers.sort((a,b) => b.total_points - a.total_points).slice(0, 50));
    } catch (e) { document.getElementById('player-list').innerHTML = "Error loading data."; }
}

function render(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.onclick = () => showFixtures(p);
        div.innerHTML = `
            <div><b>${p.web_name}</b><br><small style="color:#888">${teams[p.team]}</small></div>
            <div class="week-pts center">${p.event_points}</div>
            <div class="total-pts right">${p.total_points}</div>
        `;
        list.appendChild(div);
    });
}

async function showFixtures(p) {
    const modal = document.getElementById('scoutModal');
    const body = document.getElementById('modal-body');
    modal.style.display = 'block';
    body.innerHTML = "Loading...";

    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://fantasy.premierleague.com/api/element-summary/${p.id}/`)}`;
    try {
        const res = await fetch(proxy);
        const data = await res.json();
        const content = JSON.parse(data.contents);
        
        const next = content.fixtures[0];
        const nextMatchHtml = `<div class="next-match"><b>NEXT:</b> ${teams[next.is_home ? next.team_a : next.team_h]} ${next.is_home ? '(H)' : '(A)'}</div>`;
        
        const listHtml = content.fixtures.slice(0, 5).map(f => `
            <div class="fix-row">
                <span>GW ${f.event_name} vs ${teams[f.is_home ? f.team_a : f.team_h]}</span>
                <b style="color:${f.difficulty <= 2 ? '#00ff87' : (f.difficulty >= 4 ? '#ff005a' : '#fff')}">FDR ${f.difficulty}</b>
            </div>
        `).join('');

        body.innerHTML = `<h3>${p.web_name}</h3> ${nextMatchHtml} <h4>Upcoming 5 Matches</h4> ${listHtml}`;
    } catch (e) { body.innerHTML = "Error loading fixtures."; }
}

function closeModal() { document.getElementById('scoutModal').style.display = 'none'; }
document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    render(allPlayers.filter(p => p.web_name.toLowerCase().includes(v)).slice(0, 50));
};
init();
