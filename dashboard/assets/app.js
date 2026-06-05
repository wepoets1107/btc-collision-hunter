/**
 * 比特币碰撞猎手 — 看板渲染
 * 每 5 秒读取 state.json 更新
 */

const SEARCH_SPACE = Math.pow(2, 160);
const TARGET_ADDRS = 5e7;
const CHANCE_DENOM = SEARCH_SPACE / TARGET_ADDRS;  // ~2^133

function formatNum(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
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
        const progressPct = Math.min(progress * 100, 100);

        // 主计数器
        document.getElementById('counter').textContent = formatNum(counter);
        document.getElementById('counter-sci').textContent =
            sci(counter) + ' / ' + sci(CHANCE_DENOM);

        // 进度条
        let pctStr = progressPct < 1e-10 ? '< 0.0000000001%' : progressPct.toFixed(10) + '%';
        document.getElementById('pct').textContent = pctStr;
        document.getElementById('progress-fill').style.width = Math.min(progressPct, 100) + '%';

        // 命中
        const hitsEl = document.getElementById('hits');
        hitsEl.textContent = hits;
        hitsEl.className = 'value' + (hits === 0 ? ' zero' : '');

        // 预计撞到时间
        const etaEl = document.getElementById('eta');
        if (counter > 0) {
            const etaSec = (1 / progress) * (Date.now() - new Date(state.started_at).getTime()) / 1000;
            const etaYears = etaSec / (365.25 * 86400);
            if (etaYears > 1e30) {
                etaEl.textContent = '∞';
            } else if (etaYears > 1e9) {
                etaEl.textContent = '~' + sci(etaYears) + ' 年';
            } else {
                etaEl.textContent = '~' + etaYears.toFixed(0) + ' 年';
            }
        } else {
            etaEl.textContent = '∞';
        }

        // 类比（随机切换）
        const analogies = [
            '≈ 连续中 ' + sci(1e7) + ' 次双色球头奖',
            '≈ 在撒哈拉沙漠随机找到一粒做过标记的沙子',
            '≈ 从宇宙诞生至今每秒一次，还需 ' + sci(1e20) + ' 倍时间',
            '≈ 全地球 80 亿人每人每秒一次，连抽 ' + sci(1e12) + ' 年',
        ];
        const analogyEl = document.getElementById('analogy');
        if (analogyEl) {
            analogyEl.textContent = analogies[Math.floor(Math.random() * analogies.length)];
        }

        // 运行时长
        if (state.started_at) {
            const start = new Date(state.started_at);
            const now = new Date();
            const diffMs = now - start;
            document.getElementById('uptime').textContent =
                Math.floor(diffMs / 86400000) + 'd ' +
                Math.floor((diffMs % 86400000) / 3600000) + 'h ' +
                Math.floor((diffMs % 3600000) / 60000) + 'm';
            document.getElementById('started-at').textContent = state.started_at;
        }

        // 今日检查数（基于上线时间和速度估算）
        if (state.started_at) {
            const start = new Date(state.started_at);
            const now = new Date();
            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            // 每天1小时 × 10 addr/s = 36000/天
            const daysRunning = Math.round((nowDay - startDay) / 86400000) + 1;
            document.getElementById('today').textContent = formatNum(36000);
        }

        // 最新结果
        if (state.last_hit) {
            document.getElementById('recent-counter').textContent =
                (state.last_hit.counter || 0).toLocaleString();
            document.getElementById('recent-addr').textContent =
                state.last_hit.addr || '--';
            document.getElementById('recent-balance').textContent =
                '0 SAT';
        }
    });
}

render();
setInterval(render, 5000);
