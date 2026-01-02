let allPlayers = [];
let filteredPlayers = []; 
let teamNames = {}; 
const posMap = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

async function init() {
    try {
        const res = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error();
        const fpl = await res.json();

        // အသင်းနာမည်များကို အရင်ဆုံး သေချာအောင် သိမ်းမယ်
        if (fpl.teams) {
            fpl.teams.forEach(t => {
                teamNames[t.id] = t.short_name; 
            });
        }

        allPlayers = fpl.elements;
        filteredPlayers = allPlayers; 
        
        // အမှတ်အလိုက် စီပြီးမှ ပေါ်အောင် လုပ်မယ်
        sortData('total_points'); 
    } catch (e) {
        const list = document.getElementById('player-list');
        if(list) list.innerHTML = "<p align='center' style='padding:20px;'>⏳ Updating Data...</p>";
    }
}

function filterByPos(type, btn) {
    if(btn) {
        document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    if (type === 0) {
        filteredPlayers = allPlayers;
    } else {
        filteredPlayers = allPlayers.filter(p => p.element_type === type);
    }
    sortData('total_points'); 
}

function sortData(key) {
    filteredPlayers.sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]));
    render(filteredPlayers.slice(0, 50));
}

function render(players) {
    const list = document.getElementById('player-list');
    if(!list) return;

    list.innerHTML = "";
    if (players.length === 0) {
        list.innerHTML = "<p align='center' style='padding:20px;'>Player ရှာမတွေ့ပါ</p>";
        return;
    }

    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        const price = (p.now_cost / 10).toFixed(1);

        // အသင်းနာမည်ယူမယ်၊ မရှိရင် ID နံပါတ်ပြမယ်
        const tName = teamNames[p.team] || `ID:${p.team}`;

        div.innerHTML = `
            <div class="player-info">
                <b class="player-name">${p.web_name}</b><br>
                <small style="color:#888">${tName} | ${posMap[p.element_type]} | £${price}m</small>
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
    const searchResult = filteredPlayers.filter(p => p.web_name.toLowerCase().includes(v));
    render(searchResult.slice(0, 50));
};

init();
// ၃ နာရီတစ်ခါ Update
setInterval(init, 10800000);
