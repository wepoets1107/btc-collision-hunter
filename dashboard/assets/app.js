/**
 * Bitcoin Collision Hunter — Dashboard Renderer
 */
const SEARCH_SPACE = Math.pow(2, 160);
const TARGET_ADDRS = 5e7;
const CHANCE_DENOM = SEARCH_SPACE / TARGET_ADDRS;

function fmt(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
}
function sci(n) {
    if (n === 0) return '0';
    let e = Math.floor(Math.log10(n));
    let m = n / Math.pow(10, e);
    return m.toFixed(3) + ' × 10^' + e;
}
function $(id) { return document.getElementById(id); }

function fetchState() {
    return fetch('data/state.json?' + Date.now()).then(r => r.json()).catch(() => null);
}

function renderHitRecord(h) {
    const btc = ((h.balance || 0) / 1e8).toFixed(8);
    return '<div style="border:1px solid #2a2a2a;padding:0.8rem;margin-bottom:0.5rem;background:#0a0a0e">' +
        '<div style="font-size:0.5rem;color:var(--green);letter-spacing:3px;text-transform:uppercase;margin-bottom:0.6rem">🚨 HIT</div>' +
        '<table>' +
        '<tr><td style="width:70px;font-size:0.5rem;color:var(--text-dim);letter-spacing:2px">私钥<br><span style="font-size:0.45rem;text-transform:uppercase;color:var(--text-dim)">PRIV</span></td><td style="font-size:0.55rem;color:var(--btc);word-break:break-all">' + (h.priv||'--') + '</td></tr>' +
        '<tr><td style="font-size:0.5rem;color:var(--text-dim);letter-spacing:2px">公钥<br><span style="font-size:0.45rem;text-transform:uppercase;color:var(--text-dim)">PUB</span></td><td style="font-size:0.55rem;color:var(--text);word-break:break-all">' + (h.pub||'--') + '</td></tr>' +
        '<tr><td style="font-size:0.5rem;color:var(--text-dim);letter-spacing:2px">余额<br><span style="font-size:0.45rem;text-transform:uppercase;color:var(--text-dim)">BALANCE</span></td><td style="font-size:0.65rem;color:var(--green)">' + btc + ' BTC</td></tr>' +
        '</table></div>';
}

function render() {
    fetchState().then(state => {
        if (!state) return;
        const counter = state.counter || 0, hits = state.hits || 0;
        const progress = counter / CHANCE_DENOM, pct = Math.min(progress * 100, 100);

        $('counter').textContent = fmt(counter);
        $('counter-sci').textContent = sci(counter) + ' / ' + sci(CHANCE_DENOM);
        $('pct').textContent = pct < 1e-10 ? '< 0.0000000001%' : pct.toFixed(10) + '%';
        $('progress-fill').style.width = Math.min(pct, 100) + '%';

        const hEl = $('hits');
        hEl.textContent = hits;
        hEl.className = 'value' + (hits === 0 ? ' hit-zero' : '');

        const etaEl = $('eta');
        if (counter > 0 && state.started_at) {
            const elapsedMs = Date.now() - new Date(state.started_at).getTime();
            const etaSec = (1 / progress) * elapsedMs / 1000;
            const etaYears = etaSec / (86400 * 365.25);
            if (etaYears > 1e30) etaEl.textContent = '∞';
            else if (etaYears > 1e9) etaEl.textContent = '~' + sci(etaYears) + ' yrs';
            else etaEl.textContent = '~' + etaYears.toFixed(0) + ' yrs';
        } else etaEl.textContent = '∞';

        // Analogy
        const analogies = [
            '≈ 连续中 ' + sci(1e7) + ' 次双色球头奖',
            '≈ 在撒哈拉沙漠找到一粒做过标记的沙子',
            '≈ 从宇宙诞生至今每秒一次，还需 ' + sci(1e20) + ' 倍时间',
            '≈ 全地球80亿人每秒一次，连抽 ' + sci(1e12) + ' 年',
        ];
        const aEl = $('analogy');
        if (aEl) aEl.textContent = analogies[Math.floor(Math.random() * analogies.length)];

        // Runtime
        if (state.started_at) {
            const start = new Date(state.started_at), now = new Date();
            const diff = now - start;
            $('uptime').textContent = Math.floor(diff / 86400000) + 'd ' + Math.floor((diff % 86400000) / 3600000) + 'h ' + Math.floor((diff % 3600000) / 60000) + 'm';
            $('started-at').textContent = state.started_at;
        }
        $('today').textContent = fmt(36000);

        // Global counter from aggregate
        fetch('data/global.json?' + Date.now()).then(r => r.json()).then(g => {
            if (g && g.global_counter !== undefined) {
                const el = $('nodes');
                if (el) el.textContent = g.global_counter.toLocaleString();
            }
        }).catch(() => {});

        // Latest check
        if (state.last_hit) {
            $('recent-counter').textContent = (state.last_hit.counter || 0).toLocaleString();
            $('recent-addr').textContent = state.last_hit.addr || '--';
            $('recent-balance').textContent = '0 BTC';
        }

        // Hit records
        const hitLog = state.hits_log || [];
        const ph = $('hit-placeholder');
        const hl = $('hit-list');
        const hf = $('hit-framework');
        if (hitLog.length === 0) {
            if (hf) hf.style.display = 'block';
            if (hl) hl.style.display = 'none';
            if (ph) ph.textContent = '等待第一个也是唯一一个奇迹';
        } else {
            if (hf) hf.style.display = 'none';
            if (ph) ph.textContent = '已命中 ' + hitLog.length + ' 次';
            if (hl) {
                hl.style.display = 'block';
                hl.innerHTML = hitLog.map(renderHitRecord).join('');
            }
        }
    });
}

render();
setInterval(render, 5000);

// Global counter from aggregate
function fetchGlobal() {
    return fetch('data/global.json?' + Date.now()).then(r => r.json()).catch(() => null);
}

// Patch render to include global
const origRender = render;
render = function() {
    origRender();
    fetchGlobal().then(g => {
        if (g && g.global_counter !== undefined) {
            const el = document.getElementById('nodes');
            if (el) el.textContent = fmt(g.global_counter);
        }
    });
};
