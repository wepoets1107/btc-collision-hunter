/**
 * 比特币碰撞猎手 — 看板渲染
 * 每3秒读取 state.json 更新数据
 */

// 全量搜索空间 2^160
const SEARCH_SPACE = Math.pow(2, 160);

// 全球估算有资产地址数
const TARGET_ADDRS = 5e7;

// 撞到一个的概率倒数
const CHANCE_DENOM = SEARCH_SPACE / TARGET_ADDRS;

function formatNum(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}

function scientificNotation(n) {
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

        // 科学计数法
        document.getElementById('counter-sci').textContent =
            `= ${scientificNotation(counter)} / ${scientificNotation(CHANCE_DENOM)}`;

        // 进度条
        let pctStr = progressPct.toFixed(10) + '%';
        if (progressPct < 1e-10) {
            pctStr = '< 0.0000000001%';
        }
        document.getElementById('pct').textContent = pctStr;
        document.getElementById('progress-fill').style.width =
            Math.min(progressPct, 100) + '%';

        // 命中数
        document.getElementById('hits').textContent = hits;
        document.getElementById('hits').className = 'value' + (hits === 0 ? ' zero' : '');

        // 速度（取最后一批的时间差近似）
        if (state.last_updated_at) {
            // 粗略估算：每秒100个
            const speed = 100;
            document.getElementById('speed').textContent = speed + ' /s';
        }

        // 预计撞到时间
        if (progressPct > 0 && progressPct < 100) {
            const etaSec = (1 / progress) * (Date.now() - new Date(state.started_at).getTime()) / 1000;
            const etaYears = etaSec / (365.25 * 86400);
            let etaStr = '';
            if (etaYears > 1e30) {
                etaStr = '>> 宇宙年龄 × 10^20';
            } else if (etaYears > 1e9) {
                etaStr = '~' + scientificNotation(etaYears) + ' 年';
            } else {
                etaStr = '~' + etaYears.toFixed(0) + ' 年';
            }
            document.getElementById('eta').textContent = etaStr;
        } else {
            document.getElementById('eta').textContent = '∞';
        }

        // 类比
        const analogies = [
            `≈ 连续中 ${(counter > 0 ? (CHANCE_DENOM / counter) * 1e-7 : 1e30).toExponential(2)} 次双色球头奖`,
            `≈ 在撒哈拉沙漠随机找到一粒做过标记的沙子`,
            `≈ 从宇宙诞生至今，每秒一次，还需 ${(CHANCE_DENOM / counter / 1e18).toExponential(2)} 倍的时间`,
            `≈ 全地球每个人买彩票，连续中 ${Math.max(1, Math.floor(Math.log10(CHANCE_DENOM / (counter + 1)))).toString()} 次`,
        ];
        const analogyEl = document.getElementById('analogy');
        if (analogyEl) {
            const idx = Math.floor(Math.random() * analogies.length);
            analogyEl.textContent = analogies[idx];
        }

        // 运行时长
        if (state.started_at) {
            const start = new Date(state.started_at);
            const now = new Date();
            const diffMs = now - start;
            const days = Math.floor(diffMs / (86400000));
            const hours = Math.floor((diffMs % 86400000) / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            document.getElementById('uptime').textContent =
                days + 'd ' + hours + 'h ' + mins + 'm';
        }

        // 启动时间
        if (state.started_at) {
            document.getElementById('started-at').textContent = state.started_at;
        }

        // 最新结果
        if (state.last_hit) {
            document.getElementById('recent-counter').textContent =
                (state.last_hit.counter || 0).toLocaleString();
            document.getElementById('recent-addr').textContent =
                state.last_hit.addr || '--';
            document.getElementById('recent-balance').textContent =
                '0';
        }
    });
}

// 初始渲染
render();
// 每 3 秒刷新
setInterval(render, 3000);
