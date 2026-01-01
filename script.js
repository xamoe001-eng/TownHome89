let allPlayers = [];
let mySquad = [];
let budget = 100.0;

const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };

async function init() {
    const list = document.getElementById('market-list');
    const target = "https://fantasy.premierleague.com/api/bootstrap-static/";
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

    try {
        const res = await fetch(proxy);
        const data = await res.json();
        const fpl = JSON.parse(data.contents);
        allPlayers = fpl.elements;
        render(allPlayers.sort((a,b) => b.total_points - a.total_points).slice(0, 30));
    } catch (e) { list.innerHTML = "Internet Error! Please Refresh."; }
}

function render(players) {
    const list = document.getElementById('market-list');
    list.innerHTML = "";
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.innerHTML = `
            <div><b>${p.web_name}</b> <br> <small style="color:#888">${teams[p.team] || 'FPL'}</small></div>
            <div style="text-align:right">
                <span style="color:#00ff87">£${(p.now_cost/10).toFixed(1)}m</span> <br>
                <button class="add-btn" onclick="add(${p.id})">Pick</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function add(id) {
    const p = allPlayers.find(i => i.id === id);
    const cost = p.now_cost / 10;
    if (mySquad.length >= 15 || budget < cost || mySquad.find(i => i.id === id)) return;
    mySquad.push(p);
    budget -= cost;
    update();
}

function update() {
    document.getElementById('budget').innerText = `£${budget.toFixed(1)}m`;
    document.getElementById('count').innerText = `${mySquad.length}/15`;
    [1,2,3,4].forEach(i => document.getElementById(`row-${i}`).innerHTML = "");
    mySquad.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = 'pitch-player';
        div.onclick = () => { budget += (p.now_cost/10); mySquad.splice(idx, 1); update(); };
        div.innerHTML = `
            <div class="player-icon" style="background:${["","#f1c40f","#3498db","#e67e22","#e74c3c"][p.element_type]}">${p.web_name[0]}</div>
            <small style="font-size:10px">${p.web_name}</small>
        `;
        document.getElementById(`row-${p.element_type}`).appendChild(div);
    });
}

document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    render(allPlayers.filter(p => p.web_name.toLowerCase().includes(v)).slice(0, 30));
};

init();
