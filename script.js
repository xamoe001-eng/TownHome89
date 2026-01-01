let allPlayers = [];
const teams = { 1:"ARS", 2:"AVL", 3:"BOU", 4:"BRE", 5:"BHA", 6:"CHE", 7:"CRY", 8:"EVE", 9:"FUL", 10:"IPS", 11:"LEI", 12:"LIV", 13:"MCI", 14:"MUN", 15:"NEW", 16:"NFO", 17:"SOU", 18:"TOT", 19:"WHU", 20:"WOL" };

async function init() {
    const list = document.getElementById('player-list');
    
    // GitHub Action က သိမ်းပေးထားတဲ့ data.json ကို ဖတ်မယ်
    // Cache မငြိအောင် Timestamp ထည့်ထားပါတယ်
    const dataUrl = `data.json?t=${new Date().getTime()}`; 

    try {
        console.log("Fetching latest data from GitHub...");
        const res = await fetch(dataUrl);
        if (!res.ok) throw new Error('Data file not found');
        
        const fpl = await res.json();
        
        if (fpl && fpl.elements) {
            allPlayers = fpl.elements;
            console.log("Data auto-updated at: " + new Date().toLocaleTimeString());
            
            // Search box မှာ စာရိုက်နေရင် list ကို auto refresh မလုပ်စေဖို့
            const searchVal = document.getElementById('search-input').value;
            if (!searchVal) {
                render(allPlayers.sort((a,b) => b.total_points - a.total_points).slice(0, 50));
            }
        }
    } catch (e) {
        console.error("Fetch error:", e);
        if (allPlayers.length === 0) {
            list.innerHTML = `<div style="color:orange; text-align:center; padding:20px;">
                ⏳ Workflow is generating data... <br>
                <small>ပထမဆုံးအကြိမ်ဆိုလျှင် data.json ထွက်လာရန် Actions ထဲတွင် ခဏစောင့်ပေးပါ။</small>
            </div>`;
        }
    }
}

function render(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.onclick = () => showFixtures(p);
        
        // Price Calculation (£12.5m format)
        const price = (p.now_cost / 10).toFixed(1);

        div.innerHTML = `
            <div>
                <b style="font-size: 1.05rem;">${p.web_name}</b> <br>
                <small style="color:#888">${teams[p.team] || 'FPL'} | £${price}m</small>
            </div>
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
    body.innerHTML = "<p style='text-align:center'>Analyzing fixtures...</p>";

    // Fixture အသေးစိတ်ကို Proxy သုံးပြီး ဆွဲယူမယ်
    const target = `https://fantasy.premierleague.com/api/element-summary/${p.id}/`;
    const fixProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
    
    try {
        const res = await fetch(fixProxy);
        const data = await res.json();
        const content = typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
        
        const next = content.fixtures[0];
        const nextMatchHtml = `<div class="next-match"><b>NEXT MATCH</b><br>${teams[next.is_home ? next.team_a : next.team_h]} ${next.is_home ? '(H)' : '(A)'}</div>`;
        
        const listHtml = content.fixtures.slice(0, 5).map(f => `
            <div class="fix-row">
                <span>GW ${f.event_name} vs ${teams[f.is_home ? f.team_a : f.team_h]}</span>
                <b style="color:${f.difficulty <= 2 ? '#00ff87' : (f.difficulty >= 4 ? '#ff005a' : '#fff')}">FDR ${f.difficulty}</b>
            </div>
        `).join('');

        body.innerHTML = `
            <h3 style="margin-bottom:5px;">${p.web_name}</h3>
            <p style="color:#888; margin-top:0;">Price: £${(p.now_cost/10).toFixed(1)}m | Total: ${p.total_points}pts</p>
            ${nextMatchHtml} 
            <h4 style="color:#00ff87">Upcoming 5 Matches</h4> 
            ${listHtml}
        `;
    } catch (e) { 
        body.innerHTML = "Error loading fixtures. Please try again."; 
    }
}

function closeModal() { document.getElementById('scoutModal').style.display = 'none'; }

document.getElementById('search-input').oninput = (e) => {
    const v = e.target.value.toLowerCase();
    const filtered = allPlayers.filter(p => p.web_name.toLowerCase().includes(v));
    render(filtered.slice(0, 50));
};

// INITIAL LOAD
init();

// --- ၁၅ မိနစ်တစ်ခါ AUTO UPDATE (900,000 ms) ---
setInterval(init, 900000);
