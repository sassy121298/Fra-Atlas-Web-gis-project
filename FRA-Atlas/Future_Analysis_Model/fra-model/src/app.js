import { DISTRICTS, STATES, PRESETS } from './data/districts.js';
import { computeMetrics, computeDeltas, generateInsights, rankDistricts } from './utils/model.js';

// ── State ────────────────────────────────────────────────────
let selectedDistrictId = DISTRICTS[0].id;
let whatIfScenario = { ...DISTRICTS[0] };
let sortKey = 'riskIndex';
let sortDir = -1; // -1 = desc

// ── Helpers ──────────────────────────────────────────────────
function getBaseline() {
  return DISTRICTS.find(d => d.id === selectedDistrictId);
}

function getWhatIfMetrics() {
  return computeMetrics(whatIfScenario, getBaseline().totalClaims);
}

function getBaselineMetrics() {
  return computeMetrics(getBaseline(), getBaseline().totalClaims);
}

function deltaClass(val) {
  if (val > 0) return 'positive';
  if (val < 0) return 'negative';
  return 'neutral';
}

function deltaSign(val) {
  if (val > 0) return '+';
  if (val < 0) return '';
  return '±';
}

// ── Tab routing ──────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabId}`));
  if (tabId === 'heatmap') renderHeatmap();
  if (tabId === 'insights') renderInsights();
  if (tabId === 'compare') renderCompare();
}

// ── District selection ───────────────────────────────────────
function onStateChange(e) {
  const stateVal = e.target.value;
  const distSelect = document.getElementById('district-select');
  const filtered = stateVal ? DISTRICTS.filter(d => d.state === stateVal) : DISTRICTS;
  distSelect.innerHTML = filtered.map(d =>
    `<option value="${d.id}">${d.name}</option>`
  ).join('');
  selectDistrict(filtered[0].id);
}

function onDistrictChange(e) {
  selectDistrict(e.target.value);
}

function selectDistrict(id) {
  selectedDistrictId = id;
  const d = getBaseline();
  whatIfScenario = { ...d };
  updateSliders();
  renderMetrics();
}

// ── Sliders ──────────────────────────────────────────────────
const SLIDER_CONFIG = [
  { key: 'forestCover', label: 'Forest Cover (%)', desc: 'Proportion of district area under forest', inverse: false },
  { key: 'tribalDensity', label: 'Tribal Population Density (%)', desc: 'ST population as % of district total', inverse: false },
  { key: 'claimsPending', label: 'Claims Pending (%)', desc: 'Unresolved claims as % of total filed', inverse: true },
  { key: 'encroachmentRate', label: 'Encroachment Rate (%)', desc: 'Disputed/encroached forest area', inverse: true },
  { key: 'gramSabhaActivity', label: 'Gram Sabha Activity (%)', desc: 'Active Gram Sabha participation rate', inverse: false },
];

function buildSliders() {
  const grid = document.getElementById('sliders-grid');
  grid.innerHTML = SLIDER_CONFIG.map(cfg => `
    <div class="slider-row">
      <div class="slider-label">
        <span>${cfg.label}</span>
        <span class="slider-value ${cfg.inverse ? 'inverse' : ''}" id="val-${cfg.key}">${whatIfScenario[cfg.key]}%</span>
      </div>
      <input type="range" min="0" max="100" value="${whatIfScenario[cfg.key]}"
        id="slider-${cfg.key}" data-key="${cfg.key}" data-inverse="${cfg.inverse}" />
      <span class="slider-desc">${cfg.desc}</span>
    </div>
  `).join('');

  grid.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', onSliderChange);
  });
}

function updateSliders() {
  SLIDER_CONFIG.forEach(cfg => {
    const el = document.getElementById(`slider-${cfg.key}`);
    const val = document.getElementById(`val-${cfg.key}`);
    if (el) { el.value = whatIfScenario[cfg.key]; val.textContent = whatIfScenario[cfg.key] + '%'; }
  });
}

function onSliderChange(e) {
  const key = e.target.dataset.key;
  whatIfScenario[key] = parseInt(e.target.value);
  document.getElementById(`val-${key}`).textContent = whatIfScenario[key] + '%';
  renderMetrics();
}

// ── Metrics rendering ─────────────────────────────────────────
function renderMetrics() {
  const bm = getBaselineMetrics();
  const wm = getWhatIfMetrics();
  const delta = computeDeltas(wm, bm);

  const metrics = [
    {
      label: 'FRA Approval Rate',
      value: wm.approvalRate,
      unit: '%',
      delta: delta.approvalRate,
      deltaLabel: 'pp vs baseline',
      class: ''
    },
    {
      label: 'Risk Index',
      value: wm.riskIndex,
      unit: '',
      delta: -delta.riskIndex,  // flip: lower risk = positive
      deltaLabel: 'vs baseline',
      class: ''
    },
    {
      label: 'District Priority',
      value: wm.priority,
      unit: '',
      delta: null,
      class: wm.priority
    },
    {
      label: 'Projected Approvals/yr',
      value: wm.projectedAnnual.toLocaleString(),
      unit: '',
      delta: delta.projectedAnnual,
      deltaLabel: 'vs baseline',
      class: ''
    }
  ];

  const container = document.getElementById('metrics-grid');
  container.innerHTML = metrics.map(m => `
    <div class="metric-card ${m.class}">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}<span class="metric-unit">${m.unit}</span></div>
      ${m.delta !== null ? `
        <div class="metric-delta ${deltaClass(m.delta)}">
          ${deltaSign(m.delta)}${m.delta}${m.deltaLabel ? ' ' + m.deltaLabel : ''}
        </div>
      ` : ''}
      ${m.label === 'District Priority' ? `<div class="priority-badge ${wm.priority}">${wm.priority} Priority</div>` : ''}
    </div>
  `).join('');
}

// ── Comparison tab ────────────────────────────────────────────
function renderCompare() {
  const baseline = getBaseline();
  const bm = getBaselineMetrics();
  const wm = getWhatIfMetrics();
  const delta = computeDeltas(wm, bm);

  const VARS = [
    { key: 'forestCover', label: 'Forest Cover (%)', inverse: false },
    { key: 'tribalDensity', label: 'Tribal Density (%)', inverse: false },
    { key: 'claimsPending', label: 'Claims Pending (%)', inverse: true },
    { key: 'encroachmentRate', label: 'Encroachment Rate (%)', inverse: true },
    { key: 'gramSabhaActivity', label: 'Gram Sabha Activity (%)', inverse: false },
  ];

  const varRows = VARS.map(v => {
    const diff = whatIfScenario[v.key] - baseline[v.key];
    const impact = v.inverse ? -diff : diff;
    return `
      <tr>
        <td>${v.label}</td>
        <td>${baseline[v.key]}%</td>
        <td>${whatIfScenario[v.key]}%</td>
        <td class="delta-cell ${deltaClass(impact)}">
          ${impact >= 0 ? '+' : ''}${diff}pp
        </td>
        <td class="delta-cell ${deltaClass(impact)}">
          ${impact > 0 ? '▲ Positive' : impact < 0 ? '▼ Negative' : '— No change'}
        </td>
      </tr>
    `;
  }).join('');

  const outRows = [
    { label: 'Approval Rate (%)', bVal: bm.approvalRate + '%', wVal: wm.approvalRate + '%', diff: delta.approvalRate, unit: 'pp' },
    { label: 'Risk Index', bVal: bm.riskIndex, wVal: wm.riskIndex, diff: -delta.riskIndex, unit: '' },
    { label: 'Priority', bVal: bm.priority, wVal: wm.priority, diff: null },
    { label: 'Projected Approvals/yr', bVal: bm.projectedAnnual.toLocaleString(), wVal: wm.projectedAnnual.toLocaleString(), diff: delta.projectedAnnual, unit: '' },
  ].map(r => `
    <tr>
      <td>${r.label}</td>
      <td>${r.bVal}</td>
      <td>${r.wVal}</td>
      <td class="delta-cell ${r.diff !== null ? deltaClass(r.diff) : ''}">
        ${r.diff !== null ? (r.diff >= 0 ? '+' : '') + r.diff + r.unit : '—'}
      </td>
    </tr>
  `).join('');

  document.getElementById('compare-content').innerHTML = `
    <div class="grid-2" style="gap:24px">
      <div class="card">
        <div class="card-title">🔢 Input Variables</div>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Baseline</th>
              <th>What-If</th>
              <th>Change</th>
              <th>Impact Direction</th>
            </tr>
          </thead>
          <tbody>${varRows}</tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title">📊 Output Outcomes</div>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Baseline</th>
              <th>What-If</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>${outRows}</tbody>
        </table>
        <div style="margin-top:20px">
          <button class="ask-claude-btn" onclick="askClaude('compare')">
            🤖 Ask Claude for Policy Recommendations
          </button>
          <div id="claude-compare-panel" class="ask-claude-panel"></div>
        </div>
      </div>
    </div>
  `;
}

// ── Heatmap tab ───────────────────────────────────────────────
function renderHeatmap() {
  const ranked = rankDistricts(DISTRICTS);
  ranked.sort((a, b) => {
    let av = a.metrics[sortKey] ?? a[sortKey];
    let bv = b.metrics[sortKey] ?? b[sortKey];
    return sortDir * (av - bv);
  });

  const rows = ranked.map((d, i) => {
    const m = d.metrics;
    const fillClass = m.priority === 'High' ? 'risk-fill-high' : m.priority === 'Medium' ? 'risk-fill-medium' : 'risk-fill-low';
    return `
      <tr>
        <td style="font-weight:600;color:var(--ink-light)">#${i + 1}</td>
        <td style="font-weight:600">${d.name}</td>
        <td><span class="state-chip">${d.stateCode}</span></td>
        <td class="risk-bar-cell">
          <div class="risk-bar-wrap">
            <div class="risk-bar-bg">
              <div class="risk-bar-fill ${fillClass}" style="width:${m.riskIndex}%"></div>
            </div>
            <span class="risk-num">${m.riskIndex}</span>
          </div>
        </td>
        <td class="approval-bar-cell">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="approval-bar-bg" style="flex:1">
              <div class="approval-bar-fill" style="width:${m.approvalRate}%"></div>
            </div>
            <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;min-width:36px">${m.approvalRate}%</span>
          </div>
        </td>
        <td>${d.forestCover}%</td>
        <td>${d.tribalDensity}%</td>
        <td>${d.encroachmentRate}%</td>
        <td>
          <span class="priority-badge ${m.priority}">${m.priority}</span>
        </td>
      </tr>
    `;
  }).join('');

  function thBtn(key, label) {
    const active = sortKey === key;
    const arrow = active ? (sortDir === -1 ? '▼' : '▲') : '⇅';
    return `<th onclick="setSortKey('${key}')" title="Sort by ${label}">
      ${label} <span class="sort-arrow ${active ? 'active' : ''}">${arrow}</span>
    </th>`;
  }

  document.getElementById('heatmap-content').innerHTML = `
    <div class="card" style="overflow-x:auto">
      <table class="heatmap-table">
        <thead>
          <tr>
            <th>#</th>
            <th>District</th>
            <th>State</th>
            ${thBtn('riskIndex', 'Risk Index')}
            ${thBtn('approvalRate', 'Approval Rate')}
            ${thBtn('forestCover', 'Forest Cover')}
            ${thBtn('tribalDensity', 'Tribal Density')}
            ${thBtn('encroachmentRate', 'Encroachment')}
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

window.setSortKey = function(key) {
  if (sortKey === key) sortDir *= -1;
  else { sortKey = key; sortDir = -1; }
  renderHeatmap();
};

// ── Insights tab ──────────────────────────────────────────────
function renderInsights() {
  const baseline = getBaseline();
  const bm = getBaselineMetrics();
  const wm = getWhatIfMetrics();
  const insights = generateInsights(baseline, whatIfScenario, bm, wm);

  const insightHTML = insights.map(i => `
    <div class="insight-item ${i.type}">
      <span class="insight-icon">${i.icon}</span>
      <span>${i.text}</span>
    </div>
  `).join('');

  const WEIGHT_COLORS = {
    forestCover: '#27ae60',
    tribalDensity: '#2980b9',
    claimsPending: '#e67e22',
    encroachmentRate: '#c0392b',
    gramSabhaActivity: '#8e44ad',
  };

  const WEIGHT_LABELS = {
    forestCover: 'Forest Cover 35%',
    tribalDensity: 'Tribal Density 20%',
    claimsPending: 'Claims Backlog 15%',
    encroachmentRate: 'Encroachment 15%',
    gramSabhaActivity: 'Gram Sabha 15%',
  };

  document.getElementById('insights-content').innerHTML = `
    <div class="grid-2" style="gap:24px">
      <div>
        <div class="card">
          <div class="card-title">💡 Scenario Insights — ${baseline.name}</div>
          <div class="insights-list">${insightHTML}</div>
          <div style="margin-top:20px">
            <button class="ask-claude-btn" onclick="askClaude('insights')">
              🤖 Ask Claude for Intervention Plan
            </button>
            <div id="claude-insights-panel" class="ask-claude-panel"></div>
          </div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-title">⚖️ Model Weight Structure</div>
          <p style="font-size:13px;color:var(--ink-light);margin-bottom:16px">
            Calibrated weights represent each driver's relative contribution to FRA approval outcomes,
            based on implementation literature from central Indian forest districts.
          </p>
          ${buildWeightBars(WEIGHT_LABELS, WEIGHT_COLORS)}
          <div style="margin-top:20px;padding:16px;background:var(--parchment);border-radius:var(--radius)">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--ink-light);margin-bottom:8px">Model Formula</div>
            <code style="font-size:12px;color:var(--forest-700);line-height:1.8">
              Score = FC×0.35 + TD×0.20 + (1−CP)×0.15 + (1−ER)×0.15 + GS×0.15<br>
              ApprovalRate = 15% + Score × 75%<br>
              RiskIndex = ER×0.35 + (1−FC)×0.30 + CP×0.20 + (1−GS)×0.15
            </code>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildWeightBars(labels, colors) {
  const weights = { forestCover: 35, tribalDensity: 20, claimsPending: 15, encroachmentRate: 15, gramSabhaActivity: 15 };
  return Object.entries(weights).map(([key, w]) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
        <span style="font-weight:600">${labels[key]}</span>
        <span style="font-family:var(--font-mono);font-weight:700;color:${colors[key]}">${w}%</span>
      </div>
      <div style="height:8px;background:var(--parchment-dark);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${w * (100/35)}%;background:${colors[key]};border-radius:4px"></div>
      </div>
    </div>
  `).join('');
}

// ── Ask Claude integration ─────────────────────────────────────
window.askClaude = async function(context) {
  const panelId = `claude-${context}-panel`;
  const panel = document.getElementById(panelId);
  if (!panel) return;
  panel.classList.add('visible');
  panel.innerHTML = '<span class="thinking">⏳ Claude is analysing your scenario…</span>';

  const baseline = getBaseline();
  const bm = getBaselineMetrics();
  const wm = getWhatIfMetrics();
  const delta = computeDeltas(wm, bm);

  const prompt = `You are a Forest Rights Act (FRA) 2006 policy expert for India.
District: ${baseline.name}, ${baseline.state}
BASELINE: Approval Rate ${bm.approvalRate}%, Risk Index ${bm.riskIndex}, Priority ${bm.priority}
WHAT-IF SCENARIO:
- Forest Cover: ${whatIfScenario.forestCover}% (baseline: ${baseline.forestCover}%)
- Tribal Density: ${whatIfScenario.tribalDensity}% (baseline: ${baseline.tribalDensity}%)
- Claims Pending: ${whatIfScenario.claimsPending}% (baseline: ${baseline.claimsPending}%)
- Encroachment Rate: ${whatIfScenario.encroachmentRate}% (baseline: ${baseline.encroachmentRate}%)
- Gram Sabha Activity: ${whatIfScenario.gramSabhaActivity}% (baseline: ${baseline.gramSabhaActivity}%)
PROJECTED OUTCOME: Approval Rate ${wm.approvalRate}% (${delta.approvalRate > 0 ? '+' : ''}${delta.approvalRate}pp), Risk Index ${wm.riskIndex}, ${wm.projectedAnnual.toLocaleString()} approvals/year

${context === 'insights'
  ? 'Provide a concise, actionable 3-point intervention plan to improve FRA implementation in this district given the scenario. Reference specific FRA provisions.'
  : 'Provide 3 concrete policy recommendations to improve FRA approval rates in this district, referencing relevant sections of FRA 2006 and PESA where applicable.'
}
Keep response under 200 words. Be specific and practical.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(c => c.text || '').join('\n') || 'No response received.';
    panel.innerHTML = text.replace(/\n/g, '<br>');
  } catch (err) {
    panel.innerHTML = `<span style="color:#e74c3c">Error: ${err.message}</span>`;
  }
};

// ── Presets ───────────────────────────────────────────────────
function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return;
  const baseline = getBaseline();
  whatIfScenario = { ...baseline, ...preset.overrides };
  updateSliders();
  renderMetrics();
}

// ── Init ──────────────────────────────────────────────────────
function init() {
  // State selector
  const stateSelect = document.getElementById('state-select');
  stateSelect.innerHTML = `<option value="">All States</option>` +
    STATES.map(s => `<option value="${s}">${s}</option>`).join('');
  stateSelect.addEventListener('change', onStateChange);

  // District selector
  const distSelect = document.getElementById('district-select');
  distSelect.innerHTML = DISTRICTS.map(d =>
    `<option value="${d.id}">${d.name} (${d.state})</option>`
  ).join('');
  distSelect.addEventListener('change', onDistrictChange);

  // Sliders
  buildSliders();

  // Initial render
  renderMetrics();

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    whatIfScenario = { ...getBaseline() };
    updateSliders();
    renderMetrics();
  });
}

document.addEventListener('DOMContentLoaded', init);
