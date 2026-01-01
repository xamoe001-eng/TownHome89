let allPlayers = [];
const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };

async function init() {
    const list = document.getElementById('player-list');
    const dataUrl = `data.json?t=${new Date().getTime()}`; 

    try {
        const res = await fetch(dataUrl);
        if (!res.ok) throw new Error('Data file not found');
        const fpl = await res.json();
        
        if (fpl && fpl.elements) {
            allPlayers = fpl.elements;
            // Website စဖွင့်တာနဲ့ Total Points နဲ့ အရင်စီထားမယ်
            sortBy('total_points');
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = `<div style="color:orange; text-align:center; padding:20px;">⏳ Updating FPL Data...</div>`;
    }
}

// ခလုတ်နှိပ်ရင် စီပေးမယ့် Function
function sortBy(key) {
    const sorted = [...allPlayers].sort((a, b) => {
        return parseFloat(b[key]) - parseFloat(a[key]);
    });
    render(sorted.slice(0, 50)); // ထိပ်ဆုံး ၅၀ ကိုပြမယ်
}

function render(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        
        const price = (p.now_cost / 10).toFixed(1);

        div.innerHTML = `
            <div class="player-info" style="flex: 1.5;">
                <b style="font-size: 1rem;">${p.web_name}</b> <br>
                <small style="color:#888">${teams[p.team] || 'FPL'} | £${price}m</small>
            </div>
            <div class="stats-grid" style="flex: 3; display: flex; justify-content: space-between; text-align: center; font-size: 0.85rem;">
                <div>GW<br><b>${p.event_points}</b></div>
                <div>Total<br><b>${p.total_points}</b></div>
                <div>Form<br><b>${p.form}</b></div>
                <div>Own%<br><b>${p.selected_by_percent}%</b></div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Search Function
document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    const filtered = allPlayers.filter(p => p.web_name.toLowerCase().includes(v));
    render(filtered.slice(0, 50));
};

// Start
init();
// ၁၅ မိနစ်တစ်ခါ နောက်ကွယ်ကနေ Update လုပ်မယ်
setInterval(init, 900000);
