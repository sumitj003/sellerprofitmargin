/* =============================================
   SellerProfitMargin.com — Global Script
   ============================================= */

// ---- CALCULATOR LOGIC ----

const PRESETS = { etsy: 6.5, shopify: 2.9, amazon: 15, custom: null };

function setPreset(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (PRESETS[name] !== null) document.getElementById('fee').value = PRESETS[name];
}

function setFee(val) {
  document.getElementById('fee').value = val;
}

function fmt(n) {
  return '$' + Math.abs(n).toFixed(2);
}

function calculate() {
  const price    = parseFloat(document.getElementById('price').value)    || 0;
  const cost     = parseFloat(document.getElementById('cost').value)     || 0;
  const shipping = parseFloat(document.getElementById('shipping').value) || 0;
  const fee      = parseFloat(document.getElementById('fee').value)      || 0;
  const ads      = parseFloat(document.getElementById('ads').value)      || 0;

  if (price <= 0) { alert('Please enter a selling price.'); return; }

  const feeAmt   = (price * fee) / 100;
  const profit   = price - cost - shipping - feeAmt - ads;
  const margin   = price > 0 ? (profit / price) * 100 : 0;
  const breakeven = cost + shipping + ads + feeAmt;

  // Update result boxes
  const profitEl = document.getElementById('r-profit');
  profitEl.textContent = (profit < 0 ? '-' : '') + fmt(profit);
  profitEl.className = 'result-value' + (profit < 0 ? ' bad' : '');

  document.getElementById('r-margin').textContent    = margin.toFixed(1) + '%';
  document.getElementById('r-breakeven').textContent = fmt(breakeven);

  // Update breakdown
  document.getElementById('b-price').textContent    = fmt(price);
  document.getElementById('b-cost').textContent     = '- ' + fmt(cost);
  document.getElementById('b-shipping').textContent = '- ' + fmt(shipping);
  document.getElementById('b-fee').textContent      = '- ' + fmt(feeAmt) + ' (' + fee + '%)';
  document.getElementById('b-ads').textContent      = '- ' + fmt(ads);
  document.getElementById('b-total').textContent    = (profit < 0 ? '-' : '') + fmt(profit);

  // Insight
  const insightEl = document.getElementById('insight');
  if (profit < 0) {
    insightEl.className = 'insight bad';
    insightEl.innerHTML = `<span class="insight-icon">⚠️</span><span>You're losing <strong>${fmt(Math.abs(profit))}</strong> per sale. Raise your price to at least <strong>${fmt(breakeven * 1.25)}</strong> for a 20% margin, or reduce product cost.</span>`;
  } else if (margin < 15) {
    insightEl.className = 'insight bad';
    insightEl.innerHTML = `<span class="insight-icon">⚠️</span><span>Margin of <strong>${margin.toFixed(1)}%</strong> is tight. Industry benchmark is 20–40%. Consider reducing costs or increasing price by <strong>${fmt(price * 0.20 - profit)}</strong>.</span>`;
  } else if (margin >= 30) {
    insightEl.className = 'insight good';
    insightEl.innerHTML = `<span class="insight-icon">🚀</span><span>Strong margin of <strong>${margin.toFixed(1)}%</strong>! At 100 sales/month that's <strong>${fmt(profit * 100)}</strong> monthly profit.</span>`;
  } else {
    insightEl.className = 'insight good';
    insightEl.innerHTML = `<span class="insight-icon">✅</span><span>Solid margin of <strong>${margin.toFixed(1)}%</strong>. You profit <strong>${fmt(profit)}</strong> per sale. Scale with ads once your ROAS is positive.</span>`;
  }

  document.getElementById('results').className = 'results show';

  // Smooth scroll to results
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- FAQ TOGGLE ----
function toggleFaq(el) {
  el.closest('.faq-item').classList.toggle('open');
}

// ---- CONTACT FORM ----
function submitContact(e) {
  e && e.preventDefault();
  const btn = document.getElementById('contact-btn');
  if (btn) {
    btn.textContent = 'Message Sent ✓';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }
  return false;
}

// ---- KEYBOARD: Enter to calculate ----
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.field input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  });
});
