let allPlayers = [];
let filteredPlayers = []; // လက်ရှိ screen ပေါ်မှာပြမယ့် list ကို သိမ်းရန်
const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };
const posMap = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

async function init() {
    try {
        const res = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error();
        const fpl = await res.json();
        allPlayers = fpl.elements;
        filteredPlayers = allPlayers; // စစချင်းမှာ အကုန်ပြမယ်
        sortData('total_points'); 
    } catch (e) {
        document.getElementById('player-list').innerHTML = "<p align='center'>⏳ Updating Data...</p>";
    }
}

// ၁။ Position အလိုက် ခွဲထုတ်ခြင်း
function filterByPos(type) {
    if (type === 0) {
        filteredPlayers = allPlayers;
    } else {
        filteredPlayers = allPlayers.filter(p => p.element_type === type);
    }
    sortData('total_points'); // Filter လုပ်ပြီးတိုင်း Total Points နဲ့ အရင်စီပြမယ်
}

// ၂။ အမှတ်အလိုက် စီခြင်း
function sortData(key) {
    const sorted = [...filteredPlayers].sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]));
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
            <div class="player-info">
                <b style="font-size: 1rem;">${p.web_name}</b><br>
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

// Search Function
document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    const searchResult = allPlayers.filter(p => p.web_name.toLowerCase().includes(v));
    render(searchResult.slice(0, 50));
};

init();
setInterval(init, 900000); // 15 mins
