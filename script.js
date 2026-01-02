let allPlayers = [];
let filteredPlayers = []; 
const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };
const posMap = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

async function init() {
    const list = document.getElementById('player-list');
    try {
        // Local data.json ကို အရင်စမ်းမယ်။ မရမှ GitHub URL ကို သုံးမယ်
        const res = await fetch('data.json'); 
        if (!res.ok) throw new Error("Local file not found");
        
        const fpl = await res.json();
        allPlayers = fpl.elements;
        filteredPlayers = [...allPlayers]; // Copy လုပ်ထားခြင်း
        
        // စစချင်း Total Points အများဆုံးလူတွေကို ပြမယ်
        sortData('total_points'); 
        
        console.log("Success: Data Loaded");
    } catch (e) {
        console.warn("Local data load failed, trying Online...");
        // Local မှာ မရှိရင် GitHub ကနေ လှမ်းဆွဲမယ်
        try {
            const onlineRes = await fetch("https://raw.githubusercontent.com/boexaw-ship-it/TownHome89-/main/data.json");
            const fpl = await onlineRes.json();
            allPlayers = fpl.elements;
            filteredPlayers = [...allPlayers];
            sortData('total_points');
        } catch (onlineErr) {
            if(list) list.innerHTML = "<p align='center' style='padding:20px; color:red;'>❌ Data ဆွဲမရပါ။ လိုင်းပြန်ဖွင့်ပေးပါ။</p>";
        }
    }
}

function filterByPos(type, btn) {
    if(btn) {
        document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    if (type === 0) {
        filteredPlayers = [...allPlayers];
    } else {
        filteredPlayers = allPlayers.filter(p => p.element_type === type);
    }
    sortData('total_points'); 
}

function sortData(key) {
    // ကြီးစဉ်ငယ်လိုက် စီခြင်း
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
        
        // CSS နဲ့ ကိုက်အောင် div structure ကို နည်းနည်း ပြင်ထားပါတယ်
        div.innerHTML = `
            <div class="player-info">
                <b class="player-name">${p.web_name}</b><br>
                <small style="color:#888">${teams[p.team] || "FPL"} | ${posMap[p.element_type]} | £${price}m</small>
            </div>
            <div class="stats-grid" style="display:flex; gap:10px; font-size:0.75rem; text-align:center;">
                <div style="flex:1">GW<br><b>${p.event_points}</b></div>
                <div style="flex:1">TOT<br><b>${p.total_points}</b></div>
                <div style="flex:1">FORM<br><b>${p.form}</b></div>
                <div style="flex:1">OWN<br><b>${p.selected_by_percent}%</b></div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Search Function (ပိုမြန်အောင်)
const searchInput = document.getElementById('search-input');
if(searchInput) {
    searchInput.oninput = (e) => {
        const v = e.target.value.toLowerCase();
        const searchResult = filteredPlayers.filter(p => p.web_name.toLowerCase().includes(v));
        render(searchResult.slice(0, 50));
    };
}

// စတင်ပတ်ခြင်း
init();
