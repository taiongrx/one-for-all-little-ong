/**
 * ONE FOR ALL (little-ong) — Interactive Cloud & Intranet OS Launchpad
 * Features:
 * - Context-Aware Custom Vector SVG App Icons
 * - Interactive 3D Mouse Tilt & Cosmic Spotlight Physics
 * - Drag-and-Drop App Reordering (Persisted to Turso Cloud + Local SQLite)
 * - Spotlight Command Palette (Ctrl+K) with Keyboard Navigation
 * - Interactive QR Code Generator for Mobile/iPad Scanning
 * - In-App Live Split/Floating Window Preview
 * - Built-in Antigravity Prompt Studio for Cross-Machine Icon & Interactive Sync
 */

let allApps = [];
let healthMap = {};
let currentFilter = 'ALL';
let currentHostFilter = 'ALL';
let searchQuery = '';
let launchMode = localStorage.getItem('ofa_launch_mode') || 'SMART';
let viewMode = localStorage.getItem('ofa_view_mode') || 'LAUNCHPAD';
let activeLanIp = '192.168.3.186';
let draggedAppId = null;
let spotlightIndex = 0;
let spotlightMatches = [];

const QUICK_EMOJIS = ['🪐', '🌿', '🐍', '🦠', '🤝', '⚠️', '🏥', '💊', '🛰️', '🌐', '🤖', '🎰', '🚀', '📊', '🧬', '🛡️'];

const MASTER_ANTIGRAVITY_PROMPT = `ช่วยวิเคราะห์บริบทของโปรเจกต์ทั้งหมดในเครื่องนี้ แล้วดำเนินการ 3 ส่วนนี้แบบครบวงจร (Zero Mockup Policy):

ส่วนที่ 1: วิเคราะห์บริบท & ออกแบบ Custom App Icon ประจำแต่ละโปรเจกต์
- สแกนหาโปรเจกต์ทั้งหมดในเครื่องนี้ (ทั้งที่รันอยู่บน Local/Intranet Port, FastAPI, Streamlit, React/Vite, Next.js, Docker และโปรเจกต์ที่ผูกกับ Vercel / Firebase)
- วิเคราะห์บริบทจริงของแต่ละโปรเจกต์ (เช่น ระบบคลังยา, ระบบบริบาลเภสัชกรรม CDSS, ระบบห้องแล็บ/เชื้อดื้อยา, ระบบเวชระเบียน, ระบบคิว หรือ AI)
- สร้างไฟล์ Custom SVG App Icon สวยๆ (พร้อมตั้งค่า <link rel="icon"> และ Web App Manifest / Apple Touch Icon) ให้เหมาะกับบริบทของแต่ละเว็บแอปในเครื่องนี้

ส่วนที่ 2: อัปเกรด Web App ในเครื่องนี้ให้เป็น Interactive
- ตรวจสอบ UI ของโปรเจกต์หลักในเครื่องนี้ เพิ่มความสามารถแบบ Interactive ที่ใช้งานได้จริง (เช่น Real-time Search/Filter, Interactive Status Indicator, Keyboard Shortcuts, Smooth Micro-animations และ Responsive Touch UI สำหรับ PC/iPad/Mobile) โดยใช้ข้อมูลจริงจากระบบ 100%

ส่วนที่ 3: ส่งข้อมูลโปรเจกต์และ Icon ขึ้นไปรวมที่ศูนย์กลาง ONE FOR ALL Cloud Portal อัตโนมัติ
- ตรวจสอบชื่อเครื่อง (Hostname) และ IP Address ในวง LAN ปัจจุบันของเครื่องนี้
- ส่ง HTTP POST ไปที่: https://one-for-all-little-ong.vercel.app/api/apps/import
  Headers: {"Content-Type": "application/json"}
  Body: {"apps": [ ... ]} โดยแต่ละรายการมีโครงสร้างดังนี้:
  {
    "id": "<รหัสโปรเจกต์ภาษาอังกฤษ-ตามด้วยชื่อเครื่อง>",
    "name": "<ชื่อโปรเจกต์>",
    "subtitle": "<คำโปรยสั้นๆ พร้อมระบุชื่อเครื่องและ IP:Port>",
    "description": "<คำอธิบายบริบทและฟีเจอร์หลักของระบบ>",
    "environment_type": "<INTRANET | VERCEL | HYBRID>",
    "category": "<ระบบเภสัชกรรม & คลังเวชภัณฑ์ | บริบาลเภสัชกรรมคลินิก (CDSS) | ระบบบริหารจัดการ & AI>",
    "protocol": "<http หรือ https>",
    "host_or_url": "<IP ของเครื่องนี้ หรือโดเมน .vercel.app>",
    "port": "<หมายเลขพอร์ต หรือเว้นว่างถ้าเป็น Cloud>",
    "path": "<เช่น / หรือ path ของแอป>",
    "full_url": "<URL หลักเมื่อคลิกไอคอน>",
    "intranet_url": "<http://IP_เครื่องนี้:PORT/path>",
    "hostname_url": "<http://ชื่อเครื่อง:PORT/path>",
    "https_url": "<ลิงก์ HTTPS / PWA หรือพอร์ตสำรองถ้ามี>",
    "cloud_url": "<https://*.vercel.app หรือ .web.app ถ้ามี>",
    "local_folder": "<[ชื่อเครื่อง] Path โฟลเดอร์ในเครื่องนี้>",
    "icon_name": "<เลือก preset: orbit | shield-check | stethoscope | microscope | repeat | activity | building-2 | pill | radar | globe | cpu | sparkles>",
    "icon_emoji": "<Emoji ประจำโปรเจกต์>",
    "icon_color": "<เลือก Gradient: from-indigo-500 via-purple-500 to-pink-500 | from-emerald-500 via-teal-500 to-cyan-600 | from-rose-500 via-red-500 to-orange-500 | from-cyan-500 via-blue-500 to-indigo-600 | from-amber-500 via-orange-500 to-red-500 | from-blue-600 via-indigo-600 to-violet-600 | from-teal-500 via-emerald-500 to-green-600 | from-fuchsia-600 via-purple-600 to-indigo-700>",
    "is_pinned": 1,
    "sort_order": 15
  }
- เมื่อยิง API เสร็จแล้ว ให้ตรวจสอบจาก https://one-for-all-little-ong.vercel.app/api/apps และสรุปรายการโปรเจกต์ที่ซิงค์สำเร็จให้ดูด้วย`;

/**
 * Context-Aware Vector SVG Icon Library
 * Renders bespoke multi-layered vector artwork inside each squircle icon
 */
function getBespokeSvgForApp(app) {
  const key = String(app.icon_name || '').toLowerCase();
  const id = String(app.id || '').toLowerCase();
  const name = String(app.name || '').toLowerCase();

  if (key === 'emoji_only') return '';

  // 1. PLUTO / Orbit / Forecasting
  if (key === 'orbit' || id.includes('pluto') || name.includes('pluto')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="15" fill="url(#plutoGrad)" stroke="white" stroke-width="2.2"/>
        <ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(-24 32 32)" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="120 20"/>
        <circle cx="52" cy="20" r="3.5" fill="#fde047"/>
        <path d="M28 32H36M32 28V36" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        <defs>
          <linearGradient id="plutoGrad" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ffffff" stop-opacity="0.45"/>
            <stop offset="1" stop-color="#ffffff" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
      </svg>`;
  }

  // 2. MORPHEUS VAULT / Shield / Narcotics Inventory
  if (key === 'shield-check' || id.includes('morpheus') || name.includes('morpheus')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <path d="M32 8L12 16V30C12 44.5 20.5 53.8 32 58C43.5 53.8 52 44.5 52 30V16L32 8Z" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2.8" stroke-linejoin="round"/>
        <circle cx="32" cy="32" r="9" stroke="#a7f3d0" stroke-width="2.4"/>
        <path d="M28 32L31 35L37 29" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  // 3. MEDUSA / IPD Pharmacist CDSS / Stethoscope + AI Pulse
  if (key === 'stethoscope' || id.includes('medusa') || name.includes('medusa')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <path d="M16 14V26C16 34.8 23.2 42 32 42C40.8 42 48 34.8 48 26V14" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <path d="M20 26H26L29 19L35 33L38 26H44" stroke="#fde047" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M32 42V50C32 53.3 34.7 56 38 56H44" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <circle cx="48" cy="54" r="4.5" fill="white"/>
      </svg>`;
  }

  // 4. AGIS Antibiogram / Microscope / Bacteria Susceptibility
  if (key === 'microscope' || id.includes('agis') || id.includes('antibiogram')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="21" fill="rgba(255,255,255,0.16)" stroke="white" stroke-width="2.6"/>
        <circle cx="32" cy="32" r="13" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" stroke-dasharray="4 4"/>
        <circle cx="26" cy="27" r="4" fill="#67e8f9"/>
        <circle cx="39" cy="35" r="5" fill="#fde047"/>
        <circle cx="27" cy="39" r="3" fill="white"/>
      </svg>`;
  }

  // 5. Drug Borrow / Exchange Network
  if (key === 'repeat' || id.includes('borrow')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <path d="M16 24H46L38 16" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M48 40H18L26 48" stroke="#fde047" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="25" y="26" width="14" height="12" rx="3" fill="rgba(255,255,255,0.25)" stroke="white" stroke-width="2"/>
      </svg>`;
  }

  // 6. Fall Risk Clinical Platform
  if (key === 'activity' || id.includes('fall-risk')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <path d="M32 10L54 48H10L32 10Z" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M20 38H27L30 29L35 43L38 38H44" stroke="#fde047" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  // 7. Chaba Medical Center / Hospital Building + AI
  if (key === 'building-2' || id.includes('chaba')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <rect x="16" y="12" width="32" height="42" rx="4" fill="rgba(255,255,255,0.18)" stroke="white" stroke-width="2.8"/>
        <path d="M27 24H37M32 19V29" stroke="#fde047" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M24 36H40M24 43H40" stroke="white" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`;
  }

  // 8. easy DISPENSINGX / Pill & Queue
  if (key === 'pill' || id.includes('dispensing')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <rect x="14" y="24" width="36" height="16" rx="8" transform="rotate(-35 32 32)" fill="rgba(255,255,255,0.22)" stroke="white" stroke-width="2.8"/>
        <line x1="27" y1="25" x2="37" y2="39" stroke="#fde047" stroke-width="2.8"/>
      </svg>`;
  }

  // 9. Sentinel Watchdog / Radar
  if (key === 'radar' || id.includes('sentinel') || id.includes('watchdog')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="21" stroke="white" stroke-width="2.6"/>
        <circle cx="32" cy="32" r="12" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
        <path d="M32 32L47 17" stroke="#34d399" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="3.5" fill="#34d399"/>
      </svg>`;
  }

  // 10. Ollama / Neural AI Chip
  if (key === 'cpu' || id.includes('ollama')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <rect x="18" y="18" width="28" height="28" rx="6" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2.8"/>
        <rect x="25" y="25" width="14" height="14" rx="3" fill="#fde047"/>
        <path d="M26 12V18M38 12V18M26 46V52M38 46V52M12 26H18M12 38H18M46 26H52M46 38H52" stroke="white" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
  }

  // 11. Globe / Web Portal
  if (key === 'globe' || id.includes('portal')) {
    return `
      <svg class="w-11 h-11 sm:w-13 sm:h-13 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] icon-svg-anim" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="20" fill="rgba(255,255,255,0.15)" stroke="white" stroke-width="2.6"/>
        <ellipse cx="32" cy="32" rx="10" ry="20" stroke="white" stroke-width="2.2"/>
        <path d="M13 26H51M13 38H51" stroke="white" stroke-width="2.2"/>
      </svg>`;
  }

  // Default Sparkles / App Vector
  return '';
}

function renderIconArtwork(app, isLarge = true) {
  const svgArt = getBespokeSvgForApp(app);
  const emoji = escapeHtml(app.icon_emoji || '🚀');
  if (svgArt) {
    return `
      <div class="relative w-full h-full flex items-center justify-center">
        ${svgArt}
        <span class="absolute top-1.5 right-1.5 ${isLarge ? 'text-xs' : 'text-[10px]'} bg-black/35 backdrop-blur-md rounded-full w-5 h-5 flex items-center justify-center border border-white/20 shadow">
          ${emoji}
        </span>
      </div>
    `;
  }
  return `<span class="${isLarge ? 'text-4xl sm:text-5xl' : 'text-2xl'} select-none">${emoji}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  initEmojiPicker();
  initCosmicCursorTracking();
  const promptArea = document.getElementById('masterAntigravityPrompt');
  if (promptArea) promptArea.value = MASTER_ANTIGRAVITY_PROMPT;

  setLaunchMode(launchMode, false);
  setViewMode(viewMode, false);
  loadApps();

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSpotlight();
    } else if (e.key === 'Escape') {
      closeSpotlight();
      closeQrModal();
      closePreviewModal();
      closePromptStudioModal();
      closeAppModal();
      closeScannerModal();
    }
  });
});

function initCosmicCursorTracking() {
  document.addEventListener('mousemove', (e) => {
    const xPct = Math.round((e.clientX / window.innerWidth) * 100);
    const yPct = Math.round((e.clientY / window.innerHeight) * 100);
    document.body.style.setProperty('--mouse-x', `${xPct}%`);
    document.body.style.setProperty('--mouse-y', `${yPct}%`);
  });
}

function initEmojiPicker() {
  const container = document.getElementById('emojiQuickList');
  if (!container) return;
  container.innerHTML = QUICK_EMOJIS.map(em => `
    <button type="button" onclick="selectEmoji('${em}')"
      class="w-6 h-6 rounded-md bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center justify-center text-xs transition">
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
  const iconName = document.getElementById('formIconName')?.value || 'auto';
  const color = document.getElementById('formColor')?.value || 'from-indigo-500 via-purple-500 to-pink-500';
  const name = document.getElementById('formName')?.value || '';
  const preview = document.getElementById('modalPreviewSquircle');
  if (preview) {
    preview.className = `w-14 h-14 app-squircle bg-gradient-to-br ${color} flex items-center justify-center`;
    preview.innerHTML = renderIconArtwork({ id: name, name, icon_name: iconName, icon_emoji: em }, false);
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
    populateHostDropdown();
    renderApps();
    renderBottomDock();
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

function populateHostDropdown() {
  const sel = document.getElementById('hostFilterSelect');
  if (!sel) return;
  const hosts = new Set();
  allApps.forEach(a => {
    const h = (a.host_or_url || '').trim();
    if (h) hosts.add(h);
  });
  const currentVal = sel.value || 'ALL';
  let opts = `<option value="ALL">🖥️ ทุกเครื่อง & Cloud (${allApps.length})</option>`;
  Array.from(hosts).forEach(h => {
    opts += `<option value="${escapeAttr(h)}" ${currentVal === h ? 'selected' : ''}>📍 ${escapeHtml(h)}</option>`;
  });
  sel.innerHTML = opts;
}

function setHostFilter(val) {
  currentHostFilter = val || 'ALL';
  renderApps();
}

function updateDbBadge(dbStatus) {
  const badge = document.getElementById('dbStatusBadge');
  if (!badge) return;
  const mode = dbStatus?.mode || 'DISCONNECTED';
  if (mode === 'HYBRID_CLOUD_AND_LOCAL') {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Turso Cloud + SQLite`;
  } else if (mode === 'TURSO_CLOUD') {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Turso Cloud Active`;
  } else if (mode === 'LOCAL_SQLITE') {
    badge.className = 'hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Local SQLite Active`;
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
  const isRemoteHost = !['localhost', '127.0.0.1', activeLanIp, 'drug-330'].includes(window.location.hostname);
  if (isRemoteHost && app.cloud_url) {
    return app.cloud_url;
  }
  return app.full_url || app.intranet_url || app.cloud_url;
}

function getFilteredApps() {
  return allApps.filter(app => {
    if (currentFilter === 'PINNED' && Number(app.is_pinned) !== 1) return false;
    if (currentFilter === 'VERCEL' && !(app.environment_type === 'VERCEL' || app.environment_type === 'HYBRID' || app.cloud_url)) return false;
    if (currentFilter === 'INTRANET' && !(app.environment_type === 'INTRANET' || app.environment_type === 'HYBRID' || app.intranet_url)) return false;
    if (currentFilter === 'PHARMACY' && !String(app.category).includes('เภสัช')) return false;
    if (currentFilter === 'ADMIN_AI' && !String(app.category).includes('บริหาร')) return false;

    if (currentHostFilter !== 'ALL' && app.host_or_url !== currentHostFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = [
        app.name, app.subtitle, app.description, app.category,
        app.port, app.host_or_url, app.full_url, app.intranet_url,
        app.cloud_url, app.local_folder,
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

  attachInteractive3DTilt();
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
    return `<span class="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" title="ONLINE${ms}"></span>`;
  }
  return `<span class="w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950" title="OFFLINE"></span>`;
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

function renderLaunchpadIconGrid(workspace, apps) {
  const pinned = apps.filter(a => Number(a.is_pinned) === 1);
  const others = apps.filter(a => Number(a.is_pinned) !== 1);

  let html = '';

  if (pinned.length > 0 && currentFilter === 'ALL' && currentHostFilter === 'ALL' && !searchQuery) {
    html += `
      <section>
        <div class="flex items-center justify-between mb-3.5 px-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              📌 แอปพลิเคชันหลักที่ปักหมุด (Pinned Launchpad)
            </span>
            <span class="text-xs text-slate-500 font-mono">(${pinned.length})</span>
          </div>
          <span class="text-[11px] text-slate-400 hidden sm:inline">💡 คลิกไอคอนเพื่อเปิดทันที • ลากวางการ์ดเพื่อเรียงลำดับ</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
          ${pinned.map(app => renderSingleLaunchpadTile(app)).join('')}
        </div>
      </section>
    `;
  }

  const remainingList = (pinned.length > 0 && currentFilter === 'ALL' && currentHostFilter === 'ALL' && !searchQuery) ? others : apps;
  if (remainingList.length > 0) {
    const sectionTitle = (pinned.length > 0 && currentFilter === 'ALL' && currentHostFilter === 'ALL' && !searchQuery)
      ? '🚀 ระบบงานและโปรเจกต์อื่นๆ ในเครือข่าย & Cloud'
      : `🎯 รายการแอปพลิเคชัน (${remainingList.length})`;

    html += `
      <section>
        <div class="flex items-center justify-between mb-3.5 px-1">
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
  const h = healthMap[app.id];
  const latencyText = (h && h.online && h.latency_ms !== null) ? `${h.latency_ms}ms` : '';

  return `
    <div class="glass-card tilt-card rounded-3xl p-4 sm:p-5 flex flex-col items-center text-center relative group cursor-grab active:cursor-grabbing"
         draggable="true"
         data-app-id="${escapeAttr(app.id)}"
         ondragstart="handleDragStart(event, '${escapeAttr(app.id)}')"
         ondragover="handleDragOver(event)"
         ondragleave="handleDragLeave(event)"
         ondrop="handleDrop(event, '${escapeAttr(app.id)}')"
         ondragend="handleDragEnd(event)">
      
      <!-- Top Right Interactive Action Toolbar -->
      <div class="absolute top-3 right-3 flex items-center gap-1 opacity-75 group-hover:opacity-100 transition z-10">
        <button onclick="openPreviewModal('${escapeAttr(app.id)}')"
          class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/10 transition"
          title="เปิดหน้าต่าง Interactive Preview">
          <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="openQrModal('${escapeAttr(app.id)}')"
          class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-emerald-600 text-slate-300 hover:text-white border border-white/10 transition"
          title="สแกน QR Code เข้าแอปบนมือถือ/iPad">
          <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="openEditModal('${escapeAttr(app.id)}')"
          class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 border border-white/10 transition"
          title="ตั้งค่า / แก้ไขไอคอน">
          <i data-lucide="settings-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <!-- Top Left Environment Badge -->
      <div class="self-start mb-2">
        ${getEnvBadgeHtml(app)}
      </div>

      <!-- Main Clickable 3D Squircle App Icon -->
      <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener"
         class="app-icon-trigger flex flex-col items-center cursor-pointer my-1.5 focus:outline-none w-full"
         title="คลิกเพื่อเปิด ${escapeAttr(app.name)} -> ${escapeAttr(targetUrl)}">
        <div class="relative">
          <div class="w-20 h-20 sm:w-24 sm:h-24 app-squircle bg-gradient-to-br ${escapeAttr(gradient)} flex items-center justify-center">
            ${renderIconArtwork(app, true)}
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

      <!-- Direct Route Pills -->
      <div class="mt-3 pt-2.5 border-t border-white/10 w-full flex items-center justify-center flex-wrap gap-1.5">
        ${buildQuickRouteButtons(app)}
      </div>
    </div>
  `;
}

function renderDetailedCards(workspace, apps) {
  workspace.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${apps.map(app => {
        const targetUrl = resolveTargetUrl(app);
        const gradient = app.icon_color || 'from-indigo-500 via-purple-500 to-pink-500';
        return `
          <div class="glass-card tilt-card rounded-3xl p-5 flex items-start gap-4 relative group">
            <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener" class="app-icon-trigger shrink-0 relative">
              <div class="w-16 h-16 app-squircle bg-gradient-to-br ${escapeAttr(gradient)} flex items-center justify-center">
                ${renderIconArtwork(app, false)}
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
                  <button onclick="openQrModal('${escapeAttr(app.id)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border border-white/10"
                    title="QR Code">
                    <i data-lucide="qr-code" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="togglePinApp('${escapeAttr(app.id)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 ${Number(app.is_pinned) === 1 ? 'text-amber-400' : 'text-slate-500'} border border-white/10"
                    title="ปักหมุด">
                    <i data-lucide="pin" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="openEditModal('${escapeAttr(app.id)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10"
                    title="แก้ไข">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="deleteApp('${escapeAttr(app.id)}', '${escapeAttr(app.name)}')"
                    class="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-900/60 text-rose-400 border border-white/10"
                    title="ลบ">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>

              <p class="text-xs text-slate-300 mt-1 line-clamp-2">${escapeHtml(app.description || app.subtitle || '')}</p>

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
 * Interactive Bottom OS Dock
 */
function renderBottomDock() {
  const dock = document.getElementById('osBottomDock');
  if (!dock) return;
  const pinned = allApps.filter(a => Number(a.is_pinned) === 1).slice(0, 10);
  if (pinned.length === 0) {
    dock.parentElement?.classList.add('hidden');
    return;
  }
  dock.parentElement?.classList.remove('hidden');

  dock.innerHTML = pinned.map(app => {
    const targetUrl = resolveTargetUrl(app);
    const gradient = app.icon_color || 'from-indigo-500 via-purple-500 to-pink-500';
    return `
      <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener"
         class="group relative flex flex-col items-center p-1 transition-transform duration-200 hover:-translate-y-2 hover:scale-110"
         title="${escapeAttr(app.name)} (${escapeAttr(targetUrl)})">
        <div class="w-11 h-11 app-squircle bg-gradient-to-br ${escapeAttr(gradient)} flex items-center justify-center text-xl shadow-lg">
          ${escapeHtml(app.icon_emoji || '🚀')}
        </div>
        <span class="mt-1 w-1 h-1 rounded-full ${healthMap[app.id]?.online ? 'bg-emerald-400' : 'bg-slate-600'}"></span>
      </a>
    `;
  }).join('') + `
    <div class="w-px h-8 bg-white/10 mx-1"></div>
    <button onclick="openSpotlight()" class="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-indigo-300 hover:text-white transition" title="Spotlight Search (Ctrl+K)">
      <i data-lucide="search" class="w-4 h-4"></i>
    </button>
    <button onclick="openPromptStudioModal()" class="p-2.5 rounded-xl bg-slate-900 hover:bg-purple-600 text-purple-300 hover:text-white transition" title="Antigravity Prompt Studio">
      <i data-lucide="sparkles" class="w-4 h-4"></i>
    </button>
    <button onclick="openAppModal()" class="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition" title="เพิ่มโปรเจกต์ใหม่">
      <i data-lucide="plus" class="w-4 h-4"></i>
    </button>
  `;
  if (window.lucide) lucide.createIcons();
}

/**
 * Interactive 3D Card Tilt Physics
 */
function attachInteractive3DTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/**
 * Interactive Drag-and-Drop Reordering
 */
function handleDragStart(e, appId) {
  draggedAppId = appId;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e, targetAppId) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!draggedAppId || draggedAppId === targetAppId) return;

  const fromIdx = allApps.findIndex(a => a.id === draggedAppId);
  const toIdx = allApps.findIndex(a => a.id === targetAppId);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = allApps.splice(fromIdx, 1);
  allApps.splice(toIdx, 0, moved);
  renderApps();
  renderBottomDock();

  try {
    await fetch('/api/apps/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordered_ids: allApps.map(a => a.id) }),
    });
    showToast(`จัดเรียงลำดับ "${moved.name}" เรียบร้อยแล้ว`, 'info');
  } catch (err) {
    showToast('บันทึกลำดับไม่สำเร็จ', 'error');
  }
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedAppId = null;
}

/**
 * Spotlight Command Palette (Ctrl+K)
 */
function openSpotlight() {
  const modal = document.getElementById('spotlightModal');
  const input = document.getElementById('spotlightInput');
  if (!modal || !input) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  input.value = '';
  spotlightIndex = 0;
  renderSpotlightList('');
  setTimeout(() => input.focus(), 40);
  if (window.lucide) lucide.createIcons();
}

function closeSpotlight() {
  const modal = document.getElementById('spotlightModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderSpotlightList(q) {
  const query = (q || '').trim().toLowerCase();
  spotlightMatches = allApps.filter(app => {
    if (!query) return true;
    const hay = [app.name, app.subtitle, app.port, app.host_or_url, app.category, app.full_url].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(query);
  });
  if (spotlightIndex >= spotlightMatches.length) spotlightIndex = 0;

  const container = document.getElementById('spotlightResults');
  if (!container) return;

  if (spotlightMatches.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">ไม่พบแอปพลิเคชันที่ค้นหา</div>`;
    return;
  }

  container.innerHTML = spotlightMatches.map((app, idx) => {
    const active = idx === spotlightIndex;
    const targetUrl = resolveTargetUrl(app);
    return `
      <a href="${escapeAttr(targetUrl)}" target="_blank" rel="noopener"
         onclick="closeSpotlight()"
         class="flex items-center justify-between p-2.5 rounded-2xl transition ${active ? 'bg-indigo-600/30 border border-indigo-500/40' : 'hover:bg-white/5'}">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 app-squircle bg-gradient-to-br ${escapeAttr(app.icon_color || 'from-indigo-500 to-purple-600')} flex items-center justify-center text-lg shrink-0">
            ${escapeHtml(app.icon_emoji || '🚀')}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate">${escapeHtml(app.name)}</div>
            <div class="text-[11px] font-mono text-indigo-300 truncate">${escapeHtml(targetUrl)}</div>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">Enter ↵</span>
      </a>
    `;
  }).join('');
}

function handleSpotlightKey(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (spotlightMatches.length > 0) {
      spotlightIndex = (spotlightIndex + 1) % spotlightMatches.length;
      renderSpotlightList(e.target.value);
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (spotlightMatches.length > 0) {
      spotlightIndex = (spotlightIndex - 1 + spotlightMatches.length) % spotlightMatches.length;
      renderSpotlightList(e.target.value);
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const chosen = spotlightMatches[spotlightIndex];
    if (chosen) {
      window.open(resolveTargetUrl(chosen), '_blank', 'noopener');
      closeSpotlight();
    }
  }
}

/**
 * Interactive QR Code Modal
 */
function openQrModal(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;
  const targetUrl = resolveTargetUrl(app);
  document.getElementById('qrModalTitle').textContent = `📱 QR Code: ${app.name}`;
  setQrTargetUrl(targetUrl);

  const btnBox = document.getElementById('qrRouteButtons');
  const routes = [];
  if (app.cloud_url) routes.push({ label: '☁️ Vercel Cloud', url: app.cloud_url });
  if (app.intranet_url) routes.push({ label: `🏥 LAN (${app.port ? ':' + app.port : 'IP'})`, url: app.intranet_url });
  if (app.https_url) routes.push({ label: '🔒 HTTPS / Alt', url: app.https_url });

  btnBox.innerHTML = routes.map(r => `
    <button onclick="setQrTargetUrl('${escapeAttr(r.url)}')"
      class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-xs font-mono text-slate-200 transition">
      ${escapeHtml(r.label)}
    </button>
  `).join('');

  const modal = document.getElementById('qrModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function setQrTargetUrl(url) {
  const img = document.getElementById('qrImage');
  const txt = document.getElementById('qrUrlText');
  if (img) {
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`;
  }
  if (txt) txt.textContent = url;
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * Interactive In-App Live Preview Modal
 */
function openPreviewModal(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;
  const targetUrl = resolveTargetUrl(app);
  document.getElementById('previewTitle').textContent = `${app.icon_emoji || '🚀'} ${app.name}`;
  document.getElementById('previewUrlBadge').textContent = targetUrl;
  document.getElementById('previewOpenNewTab').href = targetUrl;
  document.getElementById('previewExternalBtn').href = targetUrl;
  document.getElementById('previewIframe').src = targetUrl;

  const modal = document.getElementById('previewModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  const iframe = document.getElementById('previewIframe');
  if (iframe) iframe.src = 'about:blank';
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * Prompt Studio Modal
 */
function openPromptStudioModal() {
  const modal = document.getElementById('promptStudioModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  }
}

function closePromptStudioModal() {
  const modal = document.getElementById('promptStudioModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function copyPromptText() {
  navigator.clipboard.writeText(MASTER_ANTIGRAVITY_PROMPT).then(() => {
    showToast('คัดลอก Prompt สำเร็จ! นำไปวางใน Antigravity เครื่องอื่นได้เลย', 'success');
  });
}

async function runLiveHealthCheck(silent = false) {
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
      renderBottomDock();
      if (!silent) {
        showToast(`ตรวจสอบสถานะสำเร็จ: ออนไลน์ ${data.online_count}/${data.total} โปรเจกต์`, 'success');
      }
    }
  } catch (e) {
    if (!silent) showToast('ไม่สามารถตรวจสอบสถานะพอร์ตได้ในขณะนี้', 'error');
  } finally {
    if (txt) txt.textContent = 'Ping';
  }
}

function setLaunchMode(mode, rerender = true) {
  launchMode = mode;
  localStorage.setItem('ofa_launch_mode', mode);
  document.querySelectorAll('.launch-mode-btn').forEach(btn => {
    btn.className = 'launch-mode-btn px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1';
  });
  const activeBtn = document.getElementById(`modeBtn-${mode}`);
  if (activeBtn) {
    activeBtn.className = 'launch-mode-btn px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow transition flex items-center gap-1';
  }
  if (rerender) {
    renderApps();
    renderBottomDock();
    const labels = {
      SMART: '⚡ โหมดอัตโนมัติ (Smart Launch)',
      CLOUD: '☁️ โหมดเปิดลิงก์ Cloud / Vercel',
      INTRANET: `🏥 โหมดเปิดผ่าน IP โรงพยาบาล (${activeLanIp})`,
      HOSTNAME: '💻 โหมดเปิดผ่านชื่อเครื่อง (Host)',
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
      btnLaunch.className = 'px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white transition flex items-center gap-1';
      btnCards.className = 'px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1';
    } else {
      btnCards.className = 'px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white transition flex items-center gap-1';
      btnLaunch.className = 'px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1';
    }
  }
  if (rerender) renderApps();
}

function setFilter(filterKey) {
  currentFilter = filterKey;
  document.querySelectorAll('.filter-pill').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterKey) {
      btn.className = 'filter-pill px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow transition whitespace-nowrap';
    } else {
      btn.className = 'filter-pill px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition whitespace-nowrap';
    }
  });
  renderApps();
}

function handleSearch(val) {
  searchQuery = (val || '').trim();
  renderApps();
}

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
  document.getElementById('formIconName').value = 'auto';
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
  document.getElementById('formIconName').value = app.icon_name || 'auto';
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
    icon_name: document.getElementById('formIconName').value || 'auto',
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
    showToast(`คัดลอก ${name} เรียบร้อยแล้ว`, 'success');
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
