let allPlayers = [];
let filteredPlayers = []; 
// ၁။ manual teams list ကို ဖျက်ပြီး variable တစ်ခုပဲ ကြေညာထားပါ
let teamNames = {}; 
const posMap = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

async function init() {
    try {
        const res = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error();
        const fpl = await res.json();

        // ၂။ ဒီစာကြောင်းက data.json ထဲက အသင်းတွေကို Auto ဆွဲထုတ်ပေးမှာပါ
        if (fpl.teams) {
            teamNames = Object.fromEntries(fpl.teams.map(t => [t.id, t.short_name]));
        }

        allPlayers = fpl.elements;
        filteredPlayers = allPlayers; 
        sortData('total_points'); 
    } catch (e) {
        document.getElementById('player-list').innerHTML = "<p align='center' style='padding:20px;'>⏳ Updating Data...</p>";
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
    let sortKey = key;
    filteredPlayers.sort((a, b) => parseFloat(b[sortKey]) - parseFloat(a[sortKey]));
    render(filteredPlayers.slice(0, 50));
}

function render(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    if (players.length === 0) {
        list.innerHTML = "<p align='center' style='padding:20px;'>Player ရှာမတွေ့ပါ</p>";
        return;
    }
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        const price = (p.now_cost / 10).toFixed(1);

        // ၃။ teams[p.team] နေရာမှာ teamNames[p.team] လို့ ပြောင်းသုံးထားပါတယ်
        div.innerHTML = `
            <div class="player-info">
                <b class="player-name">${p.web_name}</b><br>
                <small style="color:#888">${teamNames[p.team] || "FPL"} | ${posMap[p.element_type]} | £${price}m</small>
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
setInterval(init, 1
            0800000);
