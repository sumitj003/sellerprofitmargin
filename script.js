/* =============================================
   SellerProfitMargin.com — Global Script v2
   ============================================= */

// ---- CURRENCY CONFIG ----
const CURRENCIES = {
  USD: { symbol: '$',  rate: 1,     label: 'USD — US Dollar' },
  EUR: { symbol: '€',  rate: 0.92,  label: 'EUR — Euro' },
  GBP: { symbol: '£',  rate: 0.79,  label: 'GBP — British Pound' },
  INR: { symbol: '₹',  rate: 83.5,  label: 'INR — Indian Rupee' },
  CAD: { symbol: 'C$', rate: 1.36,  label: 'CAD — Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.53,  label: 'AUD — Australian Dollar' },
};

let currentCurrency = 'USD';

function getCurrency() {
  return CURRENCIES[currentCurrency];
}

function setCurrency(code) {
  currentCurrency = code;
  const cur = getCurrency();
  document.querySelectorAll('.currency-symbol').forEach(el => {
    el.textContent = cur.symbol;
  });
  const btn = document.getElementById('currency-btn');
  if (btn) btn.textContent = code + ' ' + cur.symbol + ' ▾';
  if (document.getElementById('results').classList.contains('show')) {
    calculate();
  }
}

function toggleCurrencyDropdown() {
  document.getElementById('currency-dropdown').classList.toggle('open');
}

function selectCurrency(code) {
  setCurrency(code);
  document.getElementById('currency-dropdown').classList.remove('open');
  document.querySelectorAll('.curr-option').forEach(el => {
    el.classList.toggle('active', el.dataset.code === code);
  });
}

document.addEventListener('click', function(e) {
  const wrapper = document.getElementById('currency-switcher');
  if (wrapper && !wrapper.contains(e.target)) {
    const dd = document.getElementById('currency-dropdown');
    if (dd) dd.classList.remove('open');
  }
});

// ---- PLATFORM PRESETS ----
const PLATFORMS = {
  etsy:    { fee: 6.5,  info: 'Etsy charges 6.5% transaction fee on sale price + $0.20 listing fee per item + ~3% + $0.25 payment processing. Offsite Ads adds 12–15% on eligible sales.' },
  shopify: { fee: 2.9,  info: 'Shopify Payments charges 2.9% + $0.30 per transaction on Basic plan. No per-sale commission — $39/mo subscription is a separate fixed cost.' },
  amazon:  { fee: 15,   info: '~15% referral fee for most categories. FBA fulfillment fees ($3–$8+/unit) and storage fees are separate — add them to your product/shipping cost fields.' },
  walmart: { fee: 8,    info: 'Walmart Marketplace: 6–15% referral fee (avg ~8%). No monthly subscription fee. Optional WFS fulfillment fees — add those to the shipping field.' },
  ebay:    { fee: 13,   info: 'eBay final value fee is typically 12–15% depending on category and store plan, plus a small fixed per-order fee. No monthly fee on basic accounts.' },
  tiktok:  { fee: 6,    info: '~6% referral fee on most TikTok Shop categories + payment processing (~2%). Affiliate/creator commission is additional if you use their affiliate program.' },
  custom:  { fee: null, info: 'Enter any custom platform fee percentage. Add any fixed per-order fees to your shipping/cost fields.' },
};

let activePreset = 'etsy';
let offsiteAdsActive = false;

function setPreset(name, el) {
  activePreset = name;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const preset = PLATFORMS[name];
  if (preset.fee !== null) document.getElementById('fee').value = preset.fee;

  // Offsite Ads row: only visible for Etsy
  const offsiteRow = document.getElementById('offsite-row');
  if (offsiteRow) offsiteRow.style.display = name === 'etsy' ? 'flex' : 'none';

  if (name !== 'etsy') {
    offsiteAdsActive = false;
    const toggle = document.getElementById('offsite-toggle');
    if (toggle) toggle.classList.remove('on');
  }

  // Update tooltip text
  const tip = document.getElementById('fee-tooltip-text');
  if (tip) tip.textContent = preset.info;
}

function toggleTooltip(e) {
  e.stopPropagation();
  document.getElementById('fee-tooltip-box').classList.toggle('show');
}

document.addEventListener('click', function(e) {
  const box = document.getElementById('fee-tooltip-box');
  if (box && !box.contains(e.target)) box.classList.remove('show');
});

function toggleOffsiteAds() {
  offsiteAdsActive = !offsiteAdsActive;
  const toggle = document.getElementById('offsite-toggle');
  if (toggle) toggle.classList.toggle('on', offsiteAdsActive);
  if (document.getElementById('results').classList.contains('show')) calculate();
}

function setFee(val) {
  document.getElementById('fee').value = val;
}

// ---- FORMATTING ----
function fmt(n, raw) {
  const cur = getCurrency();
  const val = (raw !== undefined ? raw : Math.abs(n)) * cur.rate;
  if (currentCurrency === 'INR') return cur.symbol + Math.round(val).toLocaleString('en-IN');
  return cur.symbol + val.toFixed(2);
}

function fmtFixed(n) {
  const cur = getCurrency();
  return cur.symbol + (n * cur.rate).toFixed(2);
}

// ---- CALCULATOR ----
function calculate() {
  const price    = parseFloat(document.getElementById('price').value)    || 0;
  const cost     = parseFloat(document.getElementById('cost').value)     || 0;
  const shipping = parseFloat(document.getElementById('shipping').value) || 0;
  const fee      = parseFloat(document.getElementById('fee').value)      || 0;
  const ads      = parseFloat(document.getElementById('ads').value)      || 0;

  if (price <= 0) { alert('Please enter a selling price greater than 0.'); return; }

  // Base platform fee
  let feeAmt = (price * fee) / 100;

  // Etsy extras
  let etsyListing = 0, etsyProcessing = 0, offsiteAdsFee = 0;
  if (activePreset === 'etsy') {
    etsyListing    = 0.20;
    etsyProcessing = (price * 0.03) + 0.25;
    if (offsiteAdsActive) offsiteAdsFee = price * 0.12;
  }

  // Shopify: fixed $0.30 per transaction on top of 2.9%
  let shopifyFixed = 0;
  if (activePreset === 'shopify') shopifyFixed = 0.30;

  const totalFees  = feeAmt + etsyListing + etsyProcessing + offsiteAdsFee + shopifyFixed;
  const totalCosts = cost + shipping + totalFees + ads;
  const profit     = price - totalCosts;
  const margin     = (profit / price) * 100;
  const breakeven  = totalCosts;

  // Results
  const profitEl = document.getElementById('r-profit');
  profitEl.textContent = (profit < 0 ? '−' : '') + fmt(Math.abs(profit));
  profitEl.className   = 'result-value' + (profit < 0 ? ' bad' : '');

  document.getElementById('r-margin').textContent    = margin.toFixed(1) + '%';
  document.getElementById('r-breakeven').textContent = fmt(breakeven);

  // Breakdown rows
  document.getElementById('b-price').textContent    = fmt(price);
  document.getElementById('b-cost').textContent     = '− ' + fmt(cost);
  document.getElementById('b-shipping').textContent = '− ' + fmt(shipping);
  document.getElementById('b-ads').textContent      = '− ' + fmt(ads);
  document.getElementById('b-total').textContent    = (profit < 0 ? '−' : '') + fmt(Math.abs(profit));

  // Fee row label changes by platform
  if (activePreset === 'etsy') {
    document.getElementById('b-fee').textContent = '− ' + fmt(feeAmt) + ' (6.5% transaction)';
  } else if (activePreset === 'shopify') {
    document.getElementById('b-fee').textContent = '− ' + fmt(feeAmt + shopifyFixed) + ' (2.9% + ' + fmtFixed(0.30) + ')';
  } else {
    document.getElementById('b-fee').textContent = '− ' + fmt(feeAmt) + ' (' + fee + '%)';
  }

  // Etsy extra rows
  const etsy1 = document.getElementById('b-etsy-listing-row');
  const etsy2 = document.getElementById('b-etsy-processing-row');
  const etsy3 = document.getElementById('b-offsite-row-result');
  if (etsy1) etsy1.style.display = activePreset === 'etsy' ? 'flex' : 'none';
  if (etsy2) etsy2.style.display = activePreset === 'etsy' ? 'flex' : 'none';
  if (etsy3) etsy3.style.display = (activePreset === 'etsy' && offsiteAdsActive) ? 'flex' : 'none';

  if (activePreset === 'etsy') {
    document.getElementById('b-etsy-listing').textContent    = '− ' + fmtFixed(0.20) + ' (listing fee)';
    document.getElementById('b-etsy-processing').textContent = '− ' + fmt(etsyProcessing) + ' (3% + ' + fmtFixed(0.25) + ' processing)';
    if (offsiteAdsActive && document.getElementById('b-offsite-fee')) {
      document.getElementById('b-offsite-fee').textContent = '− ' + fmt(offsiteAdsFee) + ' (12% Offsite Ads)';
    }
  }

  // Insight
  const targetPrice20 = totalCosts / 0.80;
  const insightEl = document.getElementById('insight');
  if (profit < 0) {
    insightEl.className = 'insight bad';
    insightEl.innerHTML = `<span class="insight-icon">⚠️</span><span>You're losing <strong>${fmt(Math.abs(profit))}</strong> per sale. Raise price to at least <strong>${fmt(targetPrice20)}</strong> for a 20% margin.</span>`;
  } else if (margin < 15) {
    insightEl.className = 'insight bad';
    insightEl.innerHTML = `<span class="insight-icon">⚠️</span><span>Margin of <strong>${margin.toFixed(1)}%</strong> is too thin — target 20–40%. Price to at least <strong>${fmt(targetPrice20)}</strong> for 20% margin.</span>`;
  } else if (margin >= 30) {
    insightEl.className = 'insight good';
    insightEl.innerHTML = `<span class="insight-icon">🚀</span><span>Strong margin of <strong>${margin.toFixed(1)}%</strong>! At 100 sales/month that's <strong>${fmt(profit * 100)}</strong> monthly profit.</span>`;
  } else {
    insightEl.className = 'insight good';
    insightEl.innerHTML = `<span class="insight-icon">✅</span><span>Solid margin of <strong>${margin.toFixed(1)}%</strong>. You pocket <strong>${fmt(profit)}</strong> per sale. Scale ads once ROAS is positive.</span>`;
  }

  document.getElementById('results').className = 'results show';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- FAQ ----
function toggleFaq(el) {
  el.closest('.faq-item').classList.toggle('open');
}

// ---- CONTACT FORM ----
function submitContact(e) {
  e && e.preventDefault();
  const btn = document.getElementById('contact-btn');
  if (btn) { btn.textContent = 'Message Sent ✓'; btn.disabled = true; btn.style.opacity = '0.7'; }
  return false;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.field input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  });
  setCurrency('USD');
});
