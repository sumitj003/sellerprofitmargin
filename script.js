/* =============================================
   SellerProfitMargin.com — Script v3
   Features: Scenario Compare, Export, Batch Calc, Break-Even Volume
   ============================================= */

// ---- CURRENCY ----
const CURRENCIES = {
  USD: { symbol: '$',  rate: 1,     label: 'USD — US Dollar' },
  EUR: { symbol: '€',  rate: 0.92,  label: 'EUR — Euro' },
  GBP: { symbol: '£',  rate: 0.79,  label: 'GBP — British Pound' },
  INR: { symbol: '₹',  rate: 83.5,  label: 'INR — Indian Rupee' },
  CAD: { symbol: 'C$', rate: 1.36,  label: 'CAD — Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.53,  label: 'AUD — Australian Dollar' },
};
let currentCurrency = 'USD';

function getCurrency() { return CURRENCIES[currentCurrency]; }

function setCurrency(code) {
  currentCurrency = code;
  const cur = getCurrency();
  document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = cur.symbol);
  const btn = document.getElementById('currency-btn');
  if (btn) btn.textContent = code + ' ' + cur.symbol + ' ▾';
  if (document.getElementById('results').classList.contains('show')) calculate();
}

function toggleCurrencyDropdown() {
  document.getElementById('currency-dropdown').classList.toggle('open');
}
function selectCurrency(code) {
  setCurrency(code);
  document.getElementById('currency-dropdown').classList.remove('open');
  document.querySelectorAll('.curr-option').forEach(el => el.classList.toggle('active', el.dataset.code === code));
}
document.addEventListener('click', function(e) {
  const w = document.getElementById('currency-switcher');
  if (w && !w.contains(e.target)) { const d = document.getElementById('currency-dropdown'); if (d) d.classList.remove('open'); }
});

// ---- PLATFORM PRESETS ----
const PLATFORMS = {
  etsy:    { fee: 6.5,  info: 'Etsy charges 6.5% transaction fee + $0.20 listing fee + ~3% + $0.25 payment processing. Offsite Ads adds 12–15% on eligible sales.' },
  shopify: { fee: 2.9,  info: 'Shopify Payments: 2.9% + $0.30 per transaction on Basic plan. No per-sale commission — $39/mo subscription is a separate fixed cost.' },
  amazon:  { fee: 15,   info: '~15% referral fee for most categories. FBA fulfillment fees ($3–$8+/unit) are separate — add them to product/shipping cost fields.' },
  walmart: { fee: 8,    info: 'Walmart Marketplace: 6–15% referral fee (avg ~8%). No monthly subscription. WFS fulfillment fees are optional — add to shipping field.' },
  ebay:    { fee: 13,   info: 'eBay final value fee: 12–15% depending on category and store plan, plus a small fixed per-order fee.' },
  tiktok:  { fee: 6,    info: '~6% referral fee on most TikTok Shop categories + ~2% payment processing. Creator affiliate commission is additional if used.' },
  custom:  { fee: null, info: 'Enter any custom platform fee percentage. Add fixed per-order fees to your shipping/cost fields.' },
};
let activePreset = 'etsy';
let offsiteAdsActive = false;

function setPreset(name, el) {
  activePreset = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const p = PLATFORMS[name];
  if (p.fee !== null) document.getElementById('fee').value = p.fee;
  const row = document.getElementById('offsite-row');
  if (row) row.style.display = name === 'etsy' ? 'flex' : 'none';
  if (name !== 'etsy') { offsiteAdsActive = false; const t = document.getElementById('offsite-toggle'); if (t) t.classList.remove('on'); }
  const tip = document.getElementById('fee-tooltip-text');
  if (tip) tip.textContent = p.info;
}

function toggleTooltip(e) { e.stopPropagation(); document.getElementById('fee-tooltip-box').classList.toggle('show'); }
document.addEventListener('click', function(e) { const b = document.getElementById('fee-tooltip-box'); if (b && !b.contains(e.target)) b.classList.remove('show'); });

function toggleOffsiteAds() {
  offsiteAdsActive = !offsiteAdsActive;
  const t = document.getElementById('offsite-toggle');
  if (t) t.classList.toggle('on', offsiteAdsActive);
  if (document.getElementById('results').classList.contains('show')) calculate();
}
function setFee(val) { document.getElementById('fee').value = val; }

// ---- FORMATTING ----
function fmt(n) {
  const cur = getCurrency();
  const val = Math.abs(n) * cur.rate;
  if (currentCurrency === 'INR') return cur.symbol + Math.round(val).toLocaleString('en-IN');
  return cur.symbol + val.toFixed(2);
}
function fmtFixed(n) { const cur = getCurrency(); return cur.symbol + (n * cur.rate).toFixed(2); }

// ---- MAIN CALCULATOR ----
function calculate() {
  const price    = parseFloat(document.getElementById('price').value)    || 0;
  const cost     = parseFloat(document.getElementById('cost').value)     || 0;
  const shipping = parseFloat(document.getElementById('shipping').value) || 0;
  const fee      = parseFloat(document.getElementById('fee').value)      || 0;
  const ads      = parseFloat(document.getElementById('ads').value)      || 0;
  if (price <= 0) { alert('Please enter a selling price greater than 0.'); return; }

  let feeAmt = (price * fee) / 100;
  let etsyListing = 0, etsyProcessing = 0, offsiteAdsFee = 0, shopifyFixed = 0;
  if (activePreset === 'etsy') {
    etsyListing    = 0.20;
    etsyProcessing = (price * 0.03) + 0.25;
    if (offsiteAdsActive) offsiteAdsFee = price * 0.12;
  }
  if (activePreset === 'shopify') shopifyFixed = 0.30;

  const totalFees  = feeAmt + etsyListing + etsyProcessing + offsiteAdsFee + shopifyFixed;
  const totalCosts = cost + shipping + totalFees + ads;
  const profit     = price - totalCosts;
  const margin     = (profit / price) * 100;
  const breakeven  = totalCosts;

  const profitEl = document.getElementById('r-profit');
  profitEl.textContent = (profit < 0 ? '−' : '') + fmt(Math.abs(profit));
  profitEl.className   = 'result-value' + (profit < 0 ? ' bad' : '');
  document.getElementById('r-margin').textContent    = margin.toFixed(1) + '%';
  document.getElementById('r-breakeven').textContent = fmt(breakeven);
  document.getElementById('b-price').textContent    = fmt(price);
  document.getElementById('b-cost').textContent     = '− ' + fmt(cost);
  document.getElementById('b-shipping').textContent = '− ' + fmt(shipping);
  document.getElementById('b-ads').textContent      = '− ' + fmt(ads);
  document.getElementById('b-total').textContent    = (profit < 0 ? '−' : '') + fmt(Math.abs(profit));

  if (activePreset === 'etsy') {
    document.getElementById('b-fee').textContent = '− ' + fmt(feeAmt) + ' (6.5% txn)';
  } else if (activePreset === 'shopify') {
    document.getElementById('b-fee').textContent = '− ' + fmt(feeAmt + shopifyFixed) + ' (2.9% + ' + fmtFixed(0.30) + ')';
  } else {
    document.getElementById('b-fee').textContent = '− ' + fmt(feeAmt) + ' (' + fee + '%)';
  }

  const e1 = document.getElementById('b-etsy-listing-row');
  const e2 = document.getElementById('b-etsy-processing-row');
  const e3 = document.getElementById('b-offsite-row-result');
  if (e1) e1.style.display = activePreset === 'etsy' ? 'flex' : 'none';
  if (e2) e2.style.display = activePreset === 'etsy' ? 'flex' : 'none';
  if (e3) e3.style.display = (activePreset === 'etsy' && offsiteAdsActive) ? 'flex' : 'none';
  if (activePreset === 'etsy') {
    document.getElementById('b-etsy-listing').textContent    = '− ' + fmtFixed(0.20) + ' (listing fee)';
    document.getElementById('b-etsy-processing').textContent = '− ' + fmt(etsyProcessing) + ' (3% + ' + fmtFixed(0.25) + ')';
    if (offsiteAdsActive && document.getElementById('b-offsite-fee'))
      document.getElementById('b-offsite-fee').textContent   = '− ' + fmt(offsiteAdsFee) + ' (12% Offsite Ads)';
  }

  const tp = totalCosts / 0.80;
  const ins = document.getElementById('insight');
  if (profit < 0) {
    ins.className = 'insight bad';
    ins.innerHTML = `<span class="insight-icon">⚠️</span><span>Losing <strong>${fmt(Math.abs(profit))}</strong> per sale. Raise price to at least <strong>${fmt(tp)}</strong> for 20% margin.</span>`;
  } else if (margin < 15) {
    ins.className = 'insight bad';
    ins.innerHTML = `<span class="insight-icon">⚠️</span><span>Margin of <strong>${margin.toFixed(1)}%</strong> is too thin — target 20–40%. Raise price to <strong>${fmt(tp)}</strong> for 20%.</span>`;
  } else if (margin >= 30) {
    ins.className = 'insight good';
    ins.innerHTML = `<span class="insight-icon">🚀</span><span>Strong margin of <strong>${margin.toFixed(1)}%</strong>! At 100 sales/month that's <strong>${fmt(profit * 100)}</strong> monthly profit.</span>`;
  } else {
    ins.className = 'insight good';
    ins.innerHTML = `<span class="insight-icon">✅</span><span>Solid margin of <strong>${margin.toFixed(1)}%</strong>. You pocket <strong>${fmt(profit)}</strong> per sale.</span>`;
  }

  document.getElementById('results').className = 'results show';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// FEATURE TABS
// ============================================
function switchFeature(name, el) {
  document.querySelectorAll('.feat-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.feat-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const panel = document.getElementById('feat-' + name);
  if (panel) panel.classList.add('active');
}

// ============================================
// FEATURE 1: SCENARIO COMPARE
// ============================================
function loadScenario() {
  const fields = ['price','cost','shipping','fee','ads'];
  fields.forEach(f => {
    const main = document.getElementById(f);
    const sc   = document.getElementById('sc-' + f);
    if (main && sc && main.value) sc.value = main.value;
  });
  // Show current A values
  const cur = getCurrency();
  const fv = id => document.getElementById(id)?.value || '0';
  document.getElementById('sc-a-price').textContent   = cur.symbol + parseFloat(fv('price')).toFixed(2);
  document.getElementById('sc-a-cost').textContent    = cur.symbol + parseFloat(fv('cost')).toFixed(2);
  document.getElementById('sc-a-ship').textContent    = cur.symbol + parseFloat(fv('shipping')).toFixed(2);
  document.getElementById('sc-a-fee').textContent     = fv('fee') + '%';
  document.getElementById('sc-a-ads').textContent     = cur.symbol + parseFloat(fv('ads')).toFixed(2);
}

function compareScenarios() {
  const calcOne = (price, cost, shipping, fee, ads) => {
    const feeAmt = (price * fee) / 100;
    const profit  = price - cost - shipping - feeAmt - ads;
    const margin  = price > 0 ? (profit / price) * 100 : 0;
    const be      = cost + shipping + feeAmt + ads;
    return { profit, margin, breakeven: be };
  };

  const gv = id => parseFloat(document.getElementById(id)?.value) || 0;

  const a = calcOne(gv('price'), gv('cost'), gv('shipping'), gv('fee'), gv('ads'));
  const b = calcOne(gv('sc-price'), gv('sc-cost'), gv('sc-shipping'), gv('sc-fee'), gv('sc-ads'));

  // Scenario A results
  document.getElementById('cmp-a-profit').textContent   = (a.profit < 0 ? '−' : '') + fmt(Math.abs(a.profit));
  document.getElementById('cmp-a-margin').textContent   = a.margin.toFixed(1) + '%';
  document.getElementById('cmp-a-breakeven').textContent = fmt(a.breakeven);
  document.getElementById('cmp-a-results').style.display = 'grid';

  // Scenario B results
  document.getElementById('cmp-b-profit').textContent   = (b.profit < 0 ? '−' : '') + fmt(Math.abs(b.profit));
  document.getElementById('cmp-b-margin').textContent   = b.margin.toFixed(1) + '%';
  document.getElementById('cmp-b-breakeven').textContent = fmt(b.breakeven);
  document.getElementById('cmp-b-results').style.display = 'grid';

  // Difference callout
  const diff     = b.profit - a.profit;
  const marginD  = b.margin - a.margin;
  const diffEl   = document.getElementById('cmp-diff');
  if (Math.abs(diff) < 0.001) {
    diffEl.innerHTML = `<span style="color:var(--muted-light)">Both scenarios produce identical results.</span>`;
  } else if (diff > 0) {
    diffEl.innerHTML = `<span style="color:var(--positive)">▲ Scenario B earns <strong>${fmt(diff)}</strong> more per sale (+${marginD.toFixed(1)}% margin)</span>`;
  } else {
    diffEl.innerHTML = `<span style="color:var(--negative)">▼ Scenario B earns <strong>${fmt(Math.abs(diff))}</strong> less per sale (${marginD.toFixed(1)}% margin)</span>`;
  }
}

// ============================================
// FEATURE 3: EXPORT
// ============================================
function exportCSV() {
  const profit = document.getElementById('r-profit')?.textContent;
  if (!profit || profit === '—') { alert('Please run the main calculator first.'); return; }

  const rows = [
    ['Metric', 'Value'],
    ['Date', new Date().toLocaleDateString()],
    ['Platform', activePreset.toUpperCase()],
    ['Currency', currentCurrency],
    ['Selling Price', document.getElementById('price')?.value || ''],
    ['Product Cost', document.getElementById('cost')?.value || ''],
    ['Shipping Cost', document.getElementById('shipping')?.value || ''],
    ['Platform Fee %', document.getElementById('fee')?.value || ''],
    ['Ad Spend', document.getElementById('ads')?.value || ''],
    ['Net Profit', profit],
    ['Profit Margin', document.getElementById('r-margin')?.textContent || ''],
    ['Break-Even Price', document.getElementById('r-breakeven')?.textContent || ''],
  ];

  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'profit-calc-' + activePreset + '-' + Date.now() + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportPrint() {
  const profit = document.getElementById('r-profit')?.textContent;
  if (!profit || profit === '—') { alert('Please run the main calculator first.'); return; }
  window.print();
}

// ============================================
// FEATURE 4: BATCH CALCULATOR
// ============================================
let batchCount = 0;

function addBatchRow() {
  batchCount++;
  const id   = batchCount;
  const tbody= document.getElementById('batch-tbody');
  if (!tbody) return;
  const tr   = document.createElement('tr');
  tr.id      = 'brow-' + id;
  tr.innerHTML = `
    <td><input type="text" class="batch-input" placeholder="Product ${id}"></td>
    <td><input type="number" class="batch-input batch-num" placeholder="29.99" min="0" step="0.01"></td>
    <td><input type="number" class="batch-input batch-num" placeholder="8.00"  min="0" step="0.01"></td>
    <td><input type="number" class="batch-input batch-num" placeholder="3.50"  min="0" step="0.01"></td>
    <td><input type="number" class="batch-input batch-num" placeholder="6.5"   min="0" max="100" step="0.1"></td>
    <td><input type="number" class="batch-input batch-num" placeholder="0.00"  min="0" step="0.01"></td>
    <td class="batch-result" id="bpr-${id}">—</td>
    <td class="batch-result" id="bmg-${id}">—</td>
    <td class="batch-result" id="bbe-${id}">—</td>
    <td><button class="batch-del" onclick="removeBatchRow(${id})" title="Remove">×</button></td>
  `;
  tbody.appendChild(tr);
}

function removeBatchRow(id) {
  const r = document.getElementById('brow-' + id);
  if (r) r.remove();
}

function calculateBatch() {
  const rows = document.querySelectorAll('#batch-tbody tr');
  if (!rows.length) { alert('Add at least one product row.'); return; }

  rows.forEach(row => {
    const nums = row.querySelectorAll('.batch-num');
    const price    = parseFloat(nums[0]?.value) || 0;
    const cost     = parseFloat(nums[1]?.value) || 0;
    const shipping = parseFloat(nums[2]?.value) || 0;
    const fee      = parseFloat(nums[3]?.value) || 0;
    const ads      = parseFloat(nums[4]?.value) || 0;
    if (price <= 0) return;

    const feeAmt  = (price * fee) / 100;
    const profit  = price - cost - shipping - feeAmt - ads;
    const margin  = (profit / price) * 100;
    const be      = cost + shipping + feeAmt + ads;
    const id      = row.id.replace('brow-', '');

    const pEl = document.getElementById('bpr-' + id);
    const mEl = document.getElementById('bmg-' + id);
    const bEl = document.getElementById('bbe-' + id);

    if (pEl) { pEl.textContent = (profit < 0 ? '−' : '') + fmt(Math.abs(profit)); pEl.style.color = profit < 0 ? 'var(--negative)' : 'var(--positive)'; }
    if (mEl) { mEl.textContent = margin.toFixed(1) + '%'; mEl.style.color = margin < 15 ? 'var(--negative)' : margin >= 25 ? 'var(--positive)' : 'var(--warn)'; }
    if (bEl) { bEl.textContent = fmt(be); bEl.style.color = 'var(--text-secondary)'; }
  });
}

function clearBatch() {
  const tbody = document.getElementById('batch-tbody');
  if (tbody) tbody.innerHTML = '';
  batchCount = 0;
  addBatchRow(); addBatchRow(); addBatchRow();
}

// ============================================
// FEATURE 6: BREAK-EVEN VOLUME
// ============================================
function calculateBreakevenVolume() {
  const profitText = document.getElementById('r-profit')?.textContent || '';
  if (!profitText || profitText === '—') {
    document.getElementById('bev-message').textContent = 'Run the main calculator first to get profit per unit.';
    document.getElementById('bev-message').style.display = 'block';
    document.getElementById('bev-results').style.display = 'none';
    return;
  }

  // Extract numeric profit value (raw USD, before currency conversion)
  const price    = parseFloat(document.getElementById('price')?.value)    || 0;
  const cost     = parseFloat(document.getElementById('cost')?.value)     || 0;
  const shipping = parseFloat(document.getElementById('shipping')?.value) || 0;
  const fee      = parseFloat(document.getElementById('fee')?.value)      || 0;
  const ads      = parseFloat(document.getElementById('ads')?.value)      || 0;
  const feeAmt   = (price * fee) / 100;
  let extraFees  = 0;
  if (activePreset === 'etsy') extraFees = 0.20 + (price * 0.03) + 0.25 + (offsiteAdsActive ? price * 0.12 : 0);
  if (activePreset === 'shopify') extraFees = 0.30;
  const profitPerUnit = price - cost - shipping - feeAmt - extraFees - ads;

  if (profitPerUnit <= 0) {
    document.getElementById('bev-message').textContent = 'Your profit per unit is zero or negative — break-even volume is infinite. Increase your price first.';
    document.getElementById('bev-message').style.display = 'block';
    document.getElementById('bev-results').style.display = 'none';
    return;
  }

  const overhead = parseFloat(document.getElementById('bev-overhead')?.value) || 0;
  const target   = parseFloat(document.getElementById('bev-target')?.value)   || 0;

  const unitsOverhead = overhead > 0 ? Math.ceil(overhead / profitPerUnit) : 0;
  const unitsTarget   = (overhead + target) > 0 ? Math.ceil((overhead + target) / profitPerUnit) : 0;
  const revenueNeeded = unitsOverhead * price;
  const daysToBreak   = unitsOverhead > 0 ? Math.ceil(unitsOverhead / 30) : 0; // assuming 1 sale/day base

  document.getElementById('bev-profit-unit').textContent   = fmt(profitPerUnit);
  document.getElementById('bev-units-overhead').textContent = overhead > 0 ? unitsOverhead.toLocaleString() : '—';
  document.getElementById('bev-units-target').textContent  = (overhead + target) > 0 ? unitsTarget.toLocaleString() : '—';
  document.getElementById('bev-revenue').textContent       = overhead > 0 ? fmt(revenueNeeded) : '—';

  document.getElementById('bev-message').style.display = 'none';
  document.getElementById('bev-results').style.display = 'grid';
}

// ---- FAQ ----
function toggleFaq(el) { el.closest('.faq-item').classList.toggle('open'); }

// ---- CONTACT ----
function submitContact(e) {
  e && e.preventDefault();
  const btn = document.getElementById('contact-btn');
  if (btn) { btn.textContent = 'Message Sent ✓'; btn.disabled = true; btn.style.opacity = '0.7'; }
  return false;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setCurrency('USD');
  // Batch: start with 3 empty rows
  addBatchRow(); addBatchRow(); addBatchRow();
  // Keyboard enter = calculate
  document.querySelectorAll('.field input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  });
});
