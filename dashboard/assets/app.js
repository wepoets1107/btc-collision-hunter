/**
 * Bitcoin Collision Hunter — Dashboard Renderer
 * Polls state.json every 5 seconds
 */

const SEARCH_SPACE = Math.pow(2, 160);
const TARGET_ADDRS = 5e7;
const CHANCE_DENOM = SEARCH_SPACE / TARGET_ADDRS;  // ~2^133

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

function fetchState() {
    return fetch('data/state.json?' + Date.now())
        .then(r => r.json())
        .catch(() => null);
}

function render() {
    fetchState().then(state => {
        if (!state) return;

        const counter = state.counter || 0;
        const hits = state.hits || 0;
        const progress = counter / CHANCE_DENOM;
        const pct = Math.min(progress * 100, 100);

        // 主计数器
        document.getElementById('counter').textContent = fmt(counter);
        document.getElementById('counter-sci').textContent = sci(counter) + ' / ' + sci(CHANCE_DENOM);

        // 进度
        let pctStr = pct < 1e-10 ? '< 0.0000000001%' : pct.toFixed(10) + '%';
        document.getElementById('pct').textContent = pctStr;
        document.getElementById('progress-fill').style.width = Math.min(pct, 100) + '%';

        // Hits
        const hEl = document.getElementById('hits');
        hEl.textContent = hits;
        hEl.className = 'value' + (hits === 0 ? ' hit-zero' : '');

        // ETA
        const etaEl = document.getElementById('eta');
        if (counter > 0 && state.started_at) {
            const elapsedMs = Date.now() - new Date(state.started_at).getTime();
            const etaSec = (1 / progress) * elapsedMs / 1000;
            const etaYears = etaSec / (86400 * 365.25);
            if (etaYears > 1e30) etaEl.textContent = '∞';
            else if (etaYears > 1e9) etaEl.textContent = '~' + sci(etaYears) + ' yrs';
            else etaEl.textContent = '~' + etaYears.toFixed(0) + ' yrs';
        } else {
            etaEl.textContent = '∞';
        }

        // 类比
        const analogies = [
            '≈ 连续中 ' + sci(1e7) + ' 次双色球头奖',
            '≈ 在撒哈拉沙漠找到一粒做过标记的沙子',
            '≈ 从宇宙诞生至今每秒一次，还需 ' + sci(1e20) + ' 倍时间',
            '≈ 全地球80亿人每秒一次，连抽 ' + sci(1e12) + ' 年',
        ];
        const aEl = document.getElementById('analogy');
        if (aEl) aEl.textContent = analogies[Math.floor(Math.random() * analogies.length)];

        // 上线时间
        if (state.started_at) {
            const start = new Date(state.started_at);
            const now = new Date();
            const diff = now - start;
            document.getElementById('uptime').textContent =
                Math.floor(diff / 86400000) + 'd ' +
                Math.floor((diff % 86400000) / 3600000) + 'h ' +
                Math.floor((diff % 3600000) / 60000) + 'm';
            document.getElementById('started-at').textContent = state.started_at;
        }

        // 今日检查
        document.getElementById('today').textContent = fmt(36000);

        // 最新记录
        if (state.last_hit) {
            document.getElementById('recent-counter').textContent =
                (state.last_hit.counter || 0).toLocaleString();
            document.getElementById('recent-addr').textContent =
                state.last_hit.addr || '--';
            document.getElementById('recent-balance').textContent =
                '0 BTC';
        }
    });
}

render();
setInterval(render, 5000);
