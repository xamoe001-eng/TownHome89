let allPlayers = [];
let currentDisplay = []; // Filter လုပ်ထားတဲ့ list ကို သိမ်းရန်
const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };
const posMap = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

async function init() {
    try {
        const res = await fetch(`data.json?t=${new Date().getTime()}`);
        const fpl = await res.json();
        allPlayers = fpl.elements;
        currentDisplay = allPlayers;
        sortBy('total_points'); // Initial Load
    } catch (e) {
        document.getElementById('player-list').innerHTML = "<p align='center'>⏳ Updating Data...</p>";
    }
}

function filterPos(type) {
    currentDisplay = type === 0 ? allPlayers : allPlayers.filter(p => p.element_type === type);
    sortBy('total_points');
}

function sortBy(key) {
    const sorted = [...currentDisplay].sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]));
    render(sorted.slice(0, 50));
}

function render(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        const price = (p.now_cost / 10).toFixed(1);
        div.innerHTML = `
            <div style="flex: 1.5;">
                <b style="font-size: 0.95rem;">${p.web_name}</b><br>
                <small style="color:#888">${teams[p.team]} | ${posMap[p.element_type]} | £${price}m</small>
            </div>
            <div class="stats-grid">
                <div>GW<b>${p.event_points}</b></div>
                <div>TOT<b>${p.total_points}</b></div>
                <div>FORM<b>${p.form}</b></div>
                <div>OWN<b>${p.selected_by_percent}%</b></div>
            </div>
        `;
        list.appendChild(div);
    });
}

document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    const filtered = allPlayers.filter(p => p.web_name.toLowerCase().includes(v));
    render(filtered.slice(0, 50));
};

init();
setInterval(init, 900000); // 15 mins
