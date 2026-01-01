let allPlayers = [];
let mySquad = [];
let budget = 100.0;
let captainId = null;
let viceCaptainId = null;

const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };

async function init() {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent("https://fantasy.premierleague.com/api/bootstrap-static/")}`;
    try {
        const res = await fetch(proxy);
        const data = await res.json();
        const fpl = JSON.parse(data.contents);
        allPlayers = fpl.elements;
        renderMarket(allPlayers.sort((a,b) => b.total_points - a.total_points).slice(0, 30));
    } catch (e) { alert("Data Error!"); }
}

function renderMarket(players) {
    const list = document.getElementById('market-list');
    list.innerHTML = "";
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.onclick = () => showScout(p);
        div.innerHTML = `
            <div><b>${p.web_name}</b><br><small>${teams[p.team]}</small></div>
            <div style="text-align:right">
                <span style="color:#00ff87">£${(p.now_cost/10).toFixed(1)}m</span><br>
                <button onclick="event.stopPropagation(); add(${p.id})">Pick</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function add(id) {
    const p = allPlayers.find(i => i.id === id);
    if (mySquad.length >= 15 || budget < (p.now_cost/10) || mySquad.find(i => i.id === id)) return;
    mySquad.push(p);
    budget -= (p.now_cost/10);
    updateUI();
}

function updateUI() {
    document.getElementById('budget').innerText = `£${budget.toFixed(1)}m`;
    document.getElementById('count').innerText = `${mySquad.length}/15`;
    [1,2,3,4].forEach(i => document.getElementById(`row-${i}`).innerHTML = "");

    mySquad.forEach((p) => {
        const div = document.createElement('div');
        div.className = 'pitch-player';
        div.onclick = () => setCaptaincy(p.id);
        
        let badge = "";
        if(p.id === captainId) badge = `<span class="cap-badge">C</span>`;
        else if(p.id === viceCaptainId) badge = `<span class="cap-badge">V</span>`;

        div.innerHTML = `
            ${badge}
            <div class="player-icon" style="background:${getCol(p.element_type)}">${p.event_points}</div>
            <small style="font-size:10px; display:block; background:rgba(0,0,0,0.5);">${p.web_name}</small>
        `;
        document.getElementById(`row-${p.element_type}`).appendChild(div);
    });
}

function setCaptaincy(id) {
    if (captainId === id) { captainId = null; viceCaptainId = id; }
    else if (viceCaptainId === id) { viceCaptainId = null; }
    else { captainId = id; }
    updateUI();
}

async function showScout(p) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://fantasy.premierleague.com/api/element-summary/${p.id}/`)}`;
    
    let fixHtml = "Loading...";
    try {
        const res = await fetch(proxy);
        const d = await res.json();
        const content = JSON.parse(d.contents);
        fixHtml = content.fixtures.slice(0, 5).map(f => `
            <div class="fixture-row">
                <span>GW ${f.event_name} vs ${teams[f.is_home ? f.team_a : f.team_h]}</span>
                <b style="color:${f.difficulty <= 2 ? '#00ff87' : '#ff005a'}">FDR ${f.difficulty}</b>
            </div>
        `).join('');
    } catch(e) { fixHtml = "Error loading fixtures."; }

    modal.innerHTML = `<div class="modal-content">
        <h3>${p.web_name} (Total: ${p.total_points} pts)</h3>
        <p>Current GW: ${p.event_points} pts | Price: £${(p.now_cost/10).toFixed(1)}m</p>
        <hr><h4>Next 5 Fixtures</h4>${fixHtml}
        <button onclick="this.parentElement.parentElement.remove()" style="width:100%; padding:10px; margin-top:10px;">Close</button>
    </div>`;
    document.body.appendChild(modal);
}

function getCol(t) { return ["","#f1c40f","#3498db","#e67e22","#e74c3c"][t]; }
document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    renderMarket(allPlayers.filter(p => p.web_name.toLowerCase().includes(v)).slice(0, 30));
};
init();
