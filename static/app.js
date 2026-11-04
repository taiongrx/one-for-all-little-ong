/**
 * ONE FOR ALL (little-ong) — Unified Cloud & Intranet Application Launchpad
 * Frontend Controller (Zero Mockup Policy Compliant)
 */

let allApps = [];
let healthMap = {};
let currentFilter = 'ALL';
let searchQuery = '';
let launchMode = localStorage.getItem('ofa_launch_mode') || 'SMART'; // SMART | CLOUD | INTRANET | HOSTNAME
let viewMode = localStorage.getItem('ofa_view_mode') || 'LAUNCHPAD'; // LAUNCHPAD | CARDS
let activeLanIp = '192.168.3.186';

const QUICK_EMOJIS = ['🪐', '🌿', '🐍', '🦠', '🤝', '⚠️', '🏥', '💊', '🛰️', '🌐', '🤖', '🎰', '🚀', '📊', '🧬', '🛡️'];

document.addEventListener('DOMContentLoaded', () => {
  initEmojiPicker();
  setLaunchMode(launchMode, false);
  setViewMode(viewMode, false);
  loadApps();

  // Keyboard shortcut Ctrl+K or / to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    } else if (e.key === 'Escape') {
      closeAppModal();
    }
  });
});

function initEmojiPicker() {
  const container = document.getElementById('emojiQuickList');
  if (!container) return;
  container.innerHTML = QUICK_EMOJIS.map(em => `
    <button type="button" onclick="selectEmoji('${em}')"
      class="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center justify-center text-sm transition">
      ${em}
    </button>
  `).join('');
}

function selectEmoji(em) {
  const input = document.getElementById('formEmoji');
  if (input) {
    input.value = em;
    updateModalPreview();
  }
}

function updateModalPreview() {
  const em = document.getElementById('formEmoji')?.value || '🚀';
  const color = document.getElementById('formColor')?.value || 'from-indigo-500 via-purple-500 to-pink-500';
  const preview = document.getElementById('modalPreviewSquircle');
  if (preview) {
    preview.className = `w-12 h-12 app-squircle bg-gradient-to-br ${color} flex items-center justify-center text-2xl`;
    preview.textContent = em;
  }
}

async function loadApps() {
  const errBanner = document.getElementById('dbErrorBanner');
  try {
    const resp = await fetch('/api/apps');
    const data = await resp.json();

    if (!resp.ok || data.status === 'error') {
      throw new Error(data.message || 'Database connection failed');
    }

    errBanner?.classList.add('hidden');
    allApps = Array.isArray(data.apps) ? data.apps : [];

    if (data.host_info?.lan_ip) {
      activeLanIp = data.host_info.lan_ip;
      const lanEl = document.getElementById('lanIpDisplay');
      if (lanEl) lanEl.textContent = `LAN: ${activeLanIp}`;
    }

    updateDbBadge(data.db_status);
    updateFilterCounts();
    renderApps();

    // Run live health check asynchronously after initial render
    runLiveHealthCheck(true);
  } catch (err) {
    if (errBanner) {
      errBanner.classList.remove('hidden');
      document.getElementById('dbErrorText').textContent = err.message;
    }
    updateDbBadge({ mode: 'DISCONNECTED' });
    allApps = [];
    renderApps();
  }
}

function updateDbBadge(dbStatus) {
  const badge = document.getElementById('dbStatusBadge');
  if (!badge) return;
  const mode = dbStatus?.mode || 'DISCONNECTED';
  if (mode === 'HYBRID_CLOUD_AND_LOCAL') {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Turso Cloud + SQLite Synced`;
  } else if (mode === 'TURSO_CLOUD') {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Turso Cloud DB Connected`;
  } else if (mode === 'LOCAL_SQLITE') {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Local SQLite Connected`;
  } else {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> DB Disconnected`;
  }
}

function updateFilterCounts() {
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setTxt('count-ALL', allApps.length);
  setTxt('count-PINNED', allApps.filter(a => Number(a.is_pinned) === 1).length);
  setTxt('count-VERCEL', allApps.filter(a => a.environment_type === 'VERCEL' || a.environment_type === 'HYBRID' || a.cloud_url).length);
  setTxt('count-INTRANET', allApps.filter(a => a.environment_type === 'INTRANET' || a.environment_type === 'HYBRID' || a.intranet_url).length);
}

/**
 * Resolves which URL to open when clicking the main App Icon based on current Launch Mode
 */
function resolveTargetUrl(app) {
  if (launchMode === 'CLOUD') {
    return app.cloud_url || app.https_url || app.full_url || app.intranet_url;
  }
  if (launchMode === 'INTRANET') {
    return app.intranet_url || app.full_url || app.cloud_url;
  }
  if (launchMode === 'HOSTNAME') {
    return app.hostname_url || app.intranet_url || app.full_url;
  }
  // SMART mode: if browsing from Vercel/remote and app has cloud_url, or if full_url is set
  const isRemoteHost = !['localhost', '127.0.0.1', activeLanIp, 'drug-330'].includes(window.location.hostname);
  if (isRemoteHost && app.cloud_url) {
    return app.cloud_url;
  }
  return app.full_url || app.intranet_url || app.cloud_url;
}

function getFilteredApps() {
  return allApps.filter(app => {
    // Filter tab check
    if (currentFilter === 'PINNED' && Number(app.is_pinned) !== 1) return false;
    if (currentFilter === 'VERCEL' && !(app.environment_type === 'VERCEL' || app.environment_type === 'HYBRID' || app.cloud_url)) return false;
    if (currentFilter === 'INTRANET' && !(app.environment_type === 'INTRANET' || app.environment_type === 'HYBRID' || app.intranet_url)) return false;
    if (currentFilter === 'PHARMACY' && !String(app.category).includes('เภสัช')) return false;
    if (currentFilter === 'ADMIN_AI' && !String(app.category).includes('บริหาร')) return false;

    // Search query check
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = [
        app.name,
        app.subtitle,
        app.description,
        app.category,
        app.port,
        app.host_or_url,
        app.full_url,
        app.intranet_url,
        app.cloud_url,
        app.local_folder,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderApps() {
  const workspace = document.getElementById('appsWorkspace');
  const emptyState = document.getElementById('emptyStateContainer');
  if (!workspace) return;

  const filtered = getFilteredApps();

  if (filtered.length === 0) {
    workspace.innerHTML = '';
    emptyState?.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    return;
  }

  emptyState?.classList.add('hidden');

  if (viewMode === 'LAUNCHPAD') {
    renderLaunchpadIconGrid(workspace, filtered);
  } else {
    renderDetailedCards(workspace, filtered);
  }

  if (window.lucide) lucide.createIcons();
}

function getEnvBadgeHtml(app) {
  const env = String(app.environment_type || 'INTRANET').toUpperCase();
  if (env === 'HYBRID') {
    return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-indigo-500/30 to-emerald-500/30 text-indigo-200 border border-indigo-400/30">⚡ Cloud + LAN</span>`;
  }
  if (env === 'VERCEL') {
    return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">☁️ Vercel</span>`;
  }
  return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🏥 LAN ${app.port ? ':' + app.port : ''}</span>`;
}

function getHealthDotHtml(appId) {
  const h = healthMap[appId];
  if (!h) {
    return `<span class="w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-950" title="กำลังตรวจสอบสถานะ..."></span>`;
  }
  if (h.online) {
    const ms = h.latency_ms !== null ? ` (${h.latency_ms}ms)` : '';
    return `<span class="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" title="ONLINE${ms}"></span>`;
  }
  return `<span class="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-slate-950" title="OFFLINE"></span>`;
}

function buildQuickRouteButtons(app) {
  const pills = [];
  if (app.cloud_url) {
    pills.push(`
      <a href="${escapeAttr(app.cloud_url)}" target="_blank" rel="noopener"
         onclick="event.stopPropagation()"
         class="px-2 py-0.5 rounded-md bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-400/25 text-[10px] font-mono transition flex items-center gap-1"
         title="เปิดบน Vercel Cloud: ${escapeAttr(app.cloud_url)}">
        ☁️ Vercel
      </a>
    `);
  }
  if (app.intranet_url) {
    const label = app.port ? `:${app.port}` : 'LAN IP';
    pills.push(`
      <a href="${escapeAttr(app.intranet_url)}" target="_blank" rel="noopener"
         onclick="event.stopPropagation()"
         class="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/25 text-[10px] font-mono transition flex items-center gap-1"
         title="เปิดผ่าน IP โรงพยาบาล: ${escapeAttr(app.intranet_url)}">
        🏥 ${escapeHtml(label)}
      </a>
    `);
  }
  if (app.https_url && app.https_url !== app.cloud_url && app.https_url !== app.intranet_url) {
    const is8080 = app.https_url.includes(':8080');
    const is8443 = app.https_url.includes(':8443');
    const tag = is8443 ? '🔒 :8443' : (is8080 ? '⚡ :8080' : '🔗 Alt');
    pills.push(`
      <a href="${escapeAttr(app.https_url)}" target="_blank" rel="noopener"
         onclick="event.stopPropagation()"
         class="px-2 py-0.5 rounded-md bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-400/25 text-[10px] font-mono transition flex items-center gap-1"
         title="ลิงก์ทางเลือก / HTTPS: ${escapeAttr(app.https_url)}">
        ${tag}
      </a>
    `);
  }
  return pills.join('');
}

/**
 * 1. LAUNCHPAD ICON GRID VIEW (macOS / iPadOS Cloud OS Launchpad)
 */
function renderLaunchpadIconGrid(workspace, apps) {
  const pinned = apps.filter(a => Number(a.is_pinned) === 1);
  const others = apps.filter(a => Number(a.is_pinned) !== 1);

  let html = '';

  if (pinned.length > 0 && currentFilter === 'ALL' && !searchQuery) {
    html += `
      <section>
        <div class="flex items-center justify-between mb-4 px-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              📌 แอปพลิเคชันหลักที่ปักหมุด (Pinned Launchpad)
            </span>
            <span class="text-xs text-slate-500 font-mono">(${pinned.length})</span>
          </div>
          <span class="text-[11px] text-slate-400">คลิกที่ไอคอนเพื่อเปิดเข้าโปรเจกต์ทันที</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
          ${pinned.map(app => renderSingleLaunchpadTile(app)).join('')}
        </div>
      </section>
    `;
  }

  const remainingList = (pinned.length > 0 && currentFilter === 'ALL' && !searchQuery) ? others : apps;
  if (remainingList.length > 0) {
    const sectionTitle = (pinned.length > 0 && currentFilter === 'ALL' && !searchQuery)
      ? '🚀 ระบบงานและโปรเจกต์อื่นๆ ในเครื่อง & Cloud'
      : `🎯 รายการแอปพลิเคชัน (${remainingList.length})`;

    html += `
      <section>
        <div class="flex items-center justify-between mb-4 px-1">
          <span class="text-sm font-bold text-slate-200">${sectionTitle}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
          ${remainingList.map(app => renderSingleLaunchpadTile(app)).join('')}
        </div>
      </section>
    `;
  }

  workspace.innerHTML = html;
}

function renderSingleLaunchpadTile(app) {
  const targetUrl = resolveTargetUrl(app);
  const gradient = app.icon_color || 'from-indigo-500 via-purple-500 to-pink-500';
  const emoji = app.icon_emoji || '🚀';
  const h = healthMap[app.id];
  const latencyText = (h && h.online && h.latency_ms !== null) ? `${h.latency_ms}ms` : '';

  return `
    <div class="glass-card rounded-3xl p-4 sm:p-5 flex flex-col items-center text-center relative group">
      
      <!-- Top Corner Quick Actions (Pin / Edit / Copy) -->
      <div class="absolute top-3 right-3 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition z-10">
        <button onclick="copyUrl('${escapeAttr(targetUrl)}', '${escapeAttr(app.name)}')"
          class="p-1.5 rounded-lg bg-slate-900/75 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition"
          title="คัดลอก URL: ${escapeAttr(targetUrl)}">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="openEditModal('${escapeAttr(app.id)}')"
          class="p-1.5 rounded-lg bg-slate-900/75 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-white/10 transition"
          title="แก้ไขข้อมูลแอป">
          <i data-lucide="settings-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <!-- Top Left Badge -->
      <div class=" self-start mb-2">
        ${getEnvBadgeHtml(app)}
      </div>

      <!-- Main Clickable Squircle App Icon -->
      <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener"
         class="app-icon-trigger flex flex-col items-center cursor-pointer my-2 focus:outline-none w-full"
         title="คลิกเพื่อเปิด ${escapeAttr(app.name)} -> ${escapeAttr(targetUrl)}">
        <div class="relative">
          <div class="w-20 h-20 sm:w-24 sm:h-24 app-squircle bg-gradient-to-br ${escapeAttr(gradient)} flex items-center justify-center text-4xl sm:text-5xl select-none">
            ${escapeHtml(emoji)}
          </div>
          <div class="absolute -bottom-1 -right-1 flex items-center gap-1 bg-slate-950/90 px-1.5 py-0.5 rounded-full border border-white/15">
            ${getHealthDotHtml(app.id)}
            ${latencyText ? `<span class="text-[9px] font-mono text-emerald-300 pr-0.5">${latencyText}</span>` : ''}
          </div>
        </div>

        <h3 class="mt-3.5 font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition line-clamp-1">
          ${escapeHtml(app.name)}
        </h3>
        <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5 px-1">
          ${escapeHtml(app.subtitle || app.category || '')}
        </p>
      </a>

      <!-- Direct Route Pills (Switch between Vercel Cloud & Hospital LAN IP:Port in 1 click) -->
      <div class="mt-3 pt-2.5 border-t border-white/10 w-full flex items-center justify-center flex-wrap gap-1.5">
        ${buildQuickRouteButtons(app)}
      </div>
    </div>
  `;
}

/**
 * 2. DETAILED PORTAL CARDS VIEW
 */
function renderDetailedCards(workspace, apps) {
  workspace.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${apps.map(app => {
        const targetUrl = resolveTargetUrl(app);
        const gradient = app.icon_color || 'from-indigo-500 via-purple-500 to-pink-500';
        const emoji = app.icon_emoji || '🚀';
        return `
          <div class="glass-card rounded-3xl p-5 flex items-start gap-4 relative group">
            <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener" class="app-icon-trigger shrink-0 relative">
              <div class="w-16 h-16 app-squircle bg-gradient-to-br ${escapeAttr(gradient)} flex items-center justify-center text-3xl">
                ${escapeHtml(emoji)}
              </div>
              <div class="absolute -bottom-1 -right-1">
                ${getHealthDotHtml(app.id)}
              </div>
            </a>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener"
                     class="font-bold text-base text-white hover:text-indigo-300 transition truncate">
                    ${escapeHtml(app.name)}
                  </a>
                  ${getEnvBadgeHtml(app)}
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button onclick="togglePinApp('${escapeAttr(app.id)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 ${Number(app.is_pinned) === 1 ? 'text-amber-400' : 'text-slate-500'} border border-white/10"
                    title="ปักหมุด / เลิกปักหมุด">
                    <i data-lucide="pin" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="openEditModal('${escapeAttr(app.id)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10"
                    title="แก้ไข">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="deleteApp('${escapeAttr(app.id)}', '${escapeAttr(app.name)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-900/60 text-rose-400 border border-white/10"
                    title="ลบรายการ">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>

              <p class="text-xs text-slate-300 mt-1 line-clamp-2">${escapeHtml(app.description || app.subtitle || '')}</p>

              <!-- URLs & Folder Metadata -->
              <div class="mt-3 space-y-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-indigo-300">🎯 ${escapeHtml(targetUrl)}</span>
                  <button onclick="copyUrl('${escapeAttr(targetUrl)}', '${escapeAttr(app.name)}')" class="text-slate-400 hover:text-white shrink-0">คัดลอก</button>
                </div>
                ${app.local_folder ? `<div class="truncate text-slate-500">📁 ${escapeHtml(app.local_folder)}</div>` : ''}
              </div>

              <div class="mt-3 flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  ${buildQuickRouteButtons(app)}
                </div>
                <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener"
                   class="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow">
                  <span>เปิดแอป</span>
                  <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Live Health Check across all Intranet Ports & Cloud URLs
 */
async function runLiveHealthCheck(silent = false) {
  const btn = document.getElementById('pingBtn');
  const txt = document.getElementById('pingBtnText');
  const summary = document.getElementById('onlineSummaryBadge');
  if (!silent && txt) txt.textContent = 'กำลังเช็ค...';

  try {
    const resp = await fetch('/api/health-check');
    const data = await resp.json();
    if (data.status === 'ok' && data.results) {
      healthMap = data.results;
      if (summary) {
        summary.textContent = `ONLINE: ${data.online_count}/${data.total}`;
      }
      renderApps();
      if (!silent) {
        showToast(`ตรวจสอบสถานะสำเร็จ: ออนไลน์ ${data.online_count} จาก ${data.total} โปรเจกต์`, 'success');
      }
    }
  } catch (e) {
    if (!silent) showToast('ไม่สามารถตรวจสอบสถานะพอร์ตได้ในขณะนี้', 'error');
  } finally {
    if (txt) txt.textContent = 'เช็คสถานะ';
  }
}

function setLaunchMode(mode, rerender = true) {
  launchMode = mode;
  localStorage.setItem('ofa_launch_mode', mode);
  document.querySelectorAll('.launch-mode-btn').forEach(btn => {
    btn.className = 'launch-mode-btn px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1';
  });
  const activeBtn = document.getElementById(`modeBtn-${mode}`);
  if (activeBtn) {
    activeBtn.className = 'launch-mode-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow transition flex items-center gap-1';
  }
  if (rerender) {
    renderApps();
    const labels = {
      SMART: '⚡ โหมดอัตโนมัติ (Smart Launch)',
      CLOUD: '☁️ โหมดเปิดลิงก์ Cloud / Vercel เป็นหลัก',
      INTRANET: `🏥 โหมดเปิดผ่าน IP โรงพยาบาล (${activeLanIp})`,
      HOSTNAME: '💻 โหมดเปิดผ่านชื่อเครื่อง (http://drug-330)',
    };
    showToast(`สลับเป็น ${labels[mode] || mode}`, 'info');
  }
}

function setViewMode(mode, rerender = true) {
  viewMode = mode;
  localStorage.setItem('ofa_view_mode', mode);
  const btnLaunch = document.getElementById('viewBtn-LAUNCHPAD');
  const btnCards = document.getElementById('viewBtn-CARDS');
  if (btnLaunch && btnCards) {
    if (mode === 'LAUNCHPAD') {
      btnLaunch.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white transition flex items-center gap-1';
      btnCards.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1';
    } else {
      btnCards.className = 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white transition flex items-center gap-1';
      btnLaunch.className = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1';
    }
  }
  if (rerender) renderApps();
}

function setFilter(filterKey) {
  currentFilter = filterKey;
  document.querySelectorAll('.filter-pill').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterKey) {
      btn.className = 'filter-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow transition whitespace-nowrap';
    } else {
      btn.className = 'filter-pill px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition whitespace-nowrap';
    }
  });
  renderApps();
}

function handleSearch(val) {
  searchQuery = (val || '').trim();
  renderApps();
}

/**
 * Smart URL Builder inside Add/Edit Modal
 */
function autoBuildFormUrl() {
  const proto = document.getElementById('formProtocol')?.value || 'http';
  const host = (document.getElementById('formHost')?.value || '').trim();
  const port = (document.getElementById('formPort')?.value || '').trim();
  let path = (document.getElementById('formPath')?.value || '').trim();
  const envType = document.getElementById('formEnvType')?.value || 'INTRANET';

  if (path && !path.startsWith('/')) path = '/' + path;
  if (!host) return;

  const cleanHost = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const portSegment = port ? `:${port}` : '';
  const built = `${proto}://${cleanHost}${portSegment}${path}`;

  const fullUrlEl = document.getElementById('formFullUrl');
  if (fullUrlEl) fullUrlEl.value = built;

  if (envType === 'INTRANET' || envType === 'HYBRID') {
    const intraEl = document.getElementById('formIntranetUrl');
    if (intraEl && (cleanHost.startsWith('192.168.') || port)) {
      const ipHost = cleanHost.includes('vercel.app') ? activeLanIp : cleanHost;
      intraEl.value = `${proto}://${ipHost}${portSegment}${path}`;
    }
  }
  if (envType === 'VERCEL' || cleanHost.includes('vercel.app') || cleanHost.includes('web.app')) {
    const cloudEl = document.getElementById('formCloudUrl');
    if (cloudEl) cloudEl.value = `https://${cleanHost}${path}`;
  }
}

function openAppModal() {
  document.getElementById('appForm')?.reset();
  document.getElementById('formAppId').value = '';
  document.getElementById('modalTitle').textContent = 'เพิ่มโปรเจกต์ / แอปพลิเคชันใหม่';
  document.getElementById('formHost').value = activeLanIp;
  document.getElementById('formEmoji').value = '🚀';
  document.getElementById('formColor').value = 'from-indigo-500 via-purple-500 to-pink-500';
  document.getElementById('formCategory').value = 'ระบบเภสัชกรรม & คลังเวชภัณฑ์';
  document.getElementById('formPinned').checked = true;
  document.getElementById('modalDeleteBtn')?.classList.add('hidden');
  updateModalPreview();

  const modal = document.getElementById('appModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openEditModal(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('formAppId').value = app.id;
  document.getElementById('modalTitle').textContent = `แก้ไขโปรเจกต์: ${app.name}`;
  document.getElementById('formName').value = app.name || '';
  document.getElementById('formSubtitle').value = app.subtitle || '';
  document.getElementById('formEnvType').value = app.environment_type || 'INTRANET';
  document.getElementById('formCategory').value = app.category || '';
  document.getElementById('formPinned').checked = Number(app.is_pinned) === 1;
  document.getElementById('formProtocol').value = app.protocol || 'http';
  document.getElementById('formHost').value = app.host_or_url || '';
  document.getElementById('formPort').value = app.port || '';
  document.getElementById('formPath').value = app.path || '';
  document.getElementById('formIntranetUrl').value = app.intranet_url || '';
  document.getElementById('formCloudUrl').value = app.cloud_url || '';
  document.getElementById('formFullUrl').value = app.full_url || '';
  document.getElementById('formHttpsUrl').value = app.https_url || '';
  document.getElementById('formEmoji').value = app.icon_emoji || '🚀';
  document.getElementById('formColor').value = app.icon_color || 'from-indigo-500 via-purple-500 to-pink-500';
  document.getElementById('formLocalFolder').value = app.local_folder || '';
  document.getElementById('formDescription').value = app.description || '';
  document.getElementById('modalDeleteBtn')?.classList.remove('hidden');
  updateModalPreview();

  const modal = document.getElementById('appModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

async function deleteFromModal() {
  const appId = document.getElementById('formAppId').value;
  const appName = document.getElementById('formName').value;
  if (!appId) return;
  closeAppModal();
  await deleteApp(appId, appName);
}

function closeAppModal() {
  const modal = document.getElementById('appModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openScannerModal() {
  const modal = document.getElementById('scannerModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }
}

function closeScannerModal() {
  const modal = document.getElementById('scannerModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function saveAppForm(event) {
  event.preventDefault();
  const appId = document.getElementById('formAppId').value.trim();
  const portVal = document.getElementById('formPort').value.trim();
  const pathVal = document.getElementById('formPath').value.trim();
  const protoVal = document.getElementById('formProtocol').value;

  const payload = {
    id: appId || undefined,
    name: document.getElementById('formName').value.trim(),
    subtitle: document.getElementById('formSubtitle').value.trim(),
    environment_type: document.getElementById('formEnvType').value,
    category: document.getElementById('formCategory').value.trim() || 'ทั่วไป',
    is_pinned: document.getElementById('formPinned').checked ? 1 : 0,
    protocol: protoVal,
    host_or_url: document.getElementById('formHost').value.trim(),
    port: portVal,
    path: pathVal,
    intranet_url: document.getElementById('formIntranetUrl').value.trim(),
    cloud_url: document.getElementById('formCloudUrl').value.trim(),
    full_url: document.getElementById('formFullUrl').value.trim(),
    https_url: document.getElementById('formHttpsUrl').value.trim(),
    hostname_url: portVal ? `${protoVal}://drug-330:${portVal}${pathVal.startsWith('/') ? pathVal : (pathVal ? '/' + pathVal : '')}` : '',
    icon_emoji: document.getElementById('formEmoji').value.trim() || '🚀',
    icon_color: document.getElementById('formColor').value,
    local_folder: document.getElementById('formLocalFolder').value.trim(),
    description: document.getElementById('formDescription').value.trim(),
  };

  try {
    const resp = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.detail || 'ไม่สามารถบันทึกข้อมูลได้');
    }
    closeAppModal();
    showToast(`บันทึก "${payload.name}" เรียบร้อยแล้ว`, 'success');
    await loadApps();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function togglePinApp(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;
  const newPin = Number(app.is_pinned) === 1 ? 0 : 1;
  try {
    const resp = await fetch(`/api/apps/${encodeURIComponent(appId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: newPin }),
    });
    if (resp.ok) {
      showToast(newPin ? `ปักหมุด "${app.name}" แล้ว` : `เลิกปักหมุด "${app.name}"`, 'info');
      await loadApps();
    }
  } catch (e) {
    showToast('อัปเดตการปักหมุดไม่สำเร็จ', 'error');
  }
}

async function deleteApp(appId, appName) {
  if (!confirm(`ยืนยันการลบโปรเจกต์ "${appName}" ออกจากฐานข้อมูล?`)) return;
  try {
    const resp = await fetch(`/api/apps/${encodeURIComponent(appId)}`, { method: 'DELETE' });
    if (resp.ok) {
      showToast(`ลบ "${appName}" เรียบร้อยแล้ว`, 'info');
      await loadApps();
    }
  } catch (e) {
    showToast('ลบข้อมูลไม่สำเร็จ', 'error');
  }
}

async function syncMachineProjects() {
  try {
    const resp = await fetch('/api/apps/sync-machine', { method: 'POST' });
    const data = await resp.json();
    if (resp.ok) {
      showToast(data.message || 'ซิงค์โปรเจกต์ในเครื่องเรียบร้อยแล้ว', 'success');
      await loadApps();
    }
  } catch (e) {
    showToast('ซิงค์โปรเจกต์ไม่สำเร็จ', 'error');
  }
}

function exportAppsJson() {
  const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), apps: allApps }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `one-for-all-apps-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('ส่งออกไฟล์สำรองข้อมูล JSON สำเร็จ', 'success');
}

async function importAppsJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const resp = await fetch('/api/apps/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'นำเข้าไฟล์ไม่สำเร็จ');
    showToast(`นำเข้าโปรเจกต์สำเร็จ ${data.imported} รายการ`, 'success');
    await loadApps();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    event.target.value = '';
  }
}

function copyUrl(url, name) {
  navigator.clipboard.writeText(url).then(() => {
    showToast(`คัดลอกลิงก์ ${name}: ${url}`, 'success');
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const colors = {
    success: 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200',
    error: 'bg-rose-950/95 border-rose-500/40 text-rose-200',
    info: 'bg-slate-900/95 border-indigo-500/40 text-indigo-200',
  };
  const toast = document.createElement('div');
  toast.className = `px-4 py-2.5 rounded-2xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all duration-300 pointer-events-auto ${colors[type] || colors.info}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
