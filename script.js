let allPlayers = [];
let filteredPlayers = []; 
let teamNames = {}; 
const posMap = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

async function init() {
    try {
        const res = await fetch(`data.json?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error();
        const fpl = await res.json();

        // ၁။ အသင်းနာမည်များကို Auto Map လုပ်ခြင်း (Sunderland အပါအဝင် အကုန်မှန်စေရန်)
        if (fpl.teams) {
            teamNames = {}; // Reset old data
            fpl.teams.forEach(t => {
                teamNames[t.id] = t.short_name; 
            });
        }

        allPlayers = fpl.elements || [];
        filteredPlayers = [...allPlayers]; 
        
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
    filteredPlayers = (type === 0) ? allPlayers : allPlayers.filter(p => p.element_type === type);
    sortData('total_points'); 
}

function sortData(key) {
    // b[key] မရှိလျှင် 0 အဖြစ် သတ်မှတ်၍ Sort လုပ်ခြင်း
    filteredPlayers.sort((a, b) => (parseFloat(b[key]) || 0) - (parseFloat(a[key]) || 0));
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
        
        // ၂။ GW undefined နှင့် အခြား Error များအား ကာကွယ်ခြင်း
        const price = p.now_cost ? (p.now_cost / 10).toFixed(1) : "0.0";
        const tName = teamNames[p.team] || `ID:${p.team}`;
        
        // data.json ထဲတွင် event_points မရှိပါက gw_points ကိုရှာမည်၊ မရှိပါက 0 ပြမည်
        const gwPoints = p.event_points !== undefined ? p.event_points : (p.gw_points !== undefined ? p.gw_points : 0);
        const totalPoints = p.total_points || 0;
        const form = p.form || "0.0";
        const ownership = p.selected_by_percent || "0";

        div.innerHTML = `
            <div class="player-info">
                <b class="player-name">${p.web_name || 'Unknown'}</b><br>
                <small style="color:#888">${tName} | ${posMap[p.element_type] || 'N/A'} | £${price}m</small>
            </div>
            <div class="stats-grid">
                <div>GW<b>${gwPoints}</b></div>
                <div>TOT<b>${totalPoints}</b></div>
                <div>FORM<b>${form}</b></div>
                <div>OWN<b>${ownership}%</b></div>
            </div>
        `;
        list.appendChild(div);
    });
}

document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    const searchResult = filteredPlayers.filter(p => (p.web_name || "").toLowerCase().includes(v));
    render(searchResult.slice(0, 50));
};

init();
setInterval(init,10800000);
