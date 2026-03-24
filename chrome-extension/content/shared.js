// PostVault Shared Content Script Utilities
// Loaded before platform-specific scripts

/* global chrome */

// --- SVG Icons ---
const PV_ICONS = {
  bookmark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  bookmarkSm: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  spinner: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
  x: '\u00D7',
};

// --- Toast ---
function showToast(message, type) {
  const existing = document.querySelector('.postvault-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `postvault-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Analysis Overlay ---
let _overlayEl = null;

function showAnalysisOverlay() {
  removeOverlay();
  const overlay = document.createElement('div');
  overlay.id = 'postvault-overlay';

  const steps = [
    { id: 'extract', label: 'שולף תוכן מהפוסט' },
    { id: 'vision', label: 'מנתח תמונות' },
    { id: 'ai', label: 'מעבד עם AI' },
    { id: 'save', label: 'שומר בספרייה' },
  ];

  overlay.innerHTML = `
    <div class="pv-overlay-card">
      <button class="pv-overlay-close" id="pv-close">${PV_ICONS.x}</button>
      <div class="pv-overlay-title" id="pv-title">מנתח את הפוסט...</div>
      <div class="pv-progress"><div class="pv-progress-fill" id="pv-progress" style="width:5%"></div></div>
      <div class="pv-steps" id="pv-steps">
        ${steps.map((s, i) => `
          <div class="pv-step" data-step="${i}">
            <span class="pv-step-icon ${i === 0 ? 'loading' : 'waiting'}" id="pv-icon-${i}">
              ${i === 0 ? PV_ICONS.spinner : '\u23F3'}
            </span>
            <span class="pv-step-text ${i === 0 ? 'active' : ''}" id="pv-text-${i}">${s.label}</span>
          </div>
        `).join('')}
      </div>
      <div class="pv-overlay-result" id="pv-result" style="display:none"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  _overlayEl = overlay;

  // Close button
  overlay.querySelector('#pv-close').addEventListener('click', removeOverlay);
  // Click outside to close
  overlay.addEventListener('click', (e) => { if (e.target === overlay) removeOverlay(); });

  return overlay;
}

function updateOverlayStep(step, status) {
  if (!_overlayEl) return;
  const icon = _overlayEl.querySelector(`#pv-icon-${step}`);
  const text = _overlayEl.querySelector(`#pv-text-${step}`);
  const progress = _overlayEl.querySelector('#pv-progress');

  if (icon) {
    icon.className = `pv-step-icon ${status}`;
    if (status === 'done') icon.innerHTML = PV_ICONS.check;
    else if (status === 'loading') icon.innerHTML = PV_ICONS.spinner;
    else icon.innerHTML = '\u23F3';
  }
  if (text) {
    text.className = `pv-step-text ${status === 'loading' || status === 'done' ? 'active' : ''}`;
  }
  if (progress) {
    const pct = Math.min(100, ((step + (status === 'done' ? 1 : 0.5)) / 4) * 100);
    progress.style.width = pct + '%';
  }
}

function showOverlaySuccess(summary, postId) {
  if (!_overlayEl) return;
  const title = _overlayEl.querySelector('#pv-title');
  const steps = _overlayEl.querySelector('#pv-steps');
  const result = _overlayEl.querySelector('#pv-result');
  const progress = _overlayEl.querySelector('#pv-progress');

  if (title) title.style.display = 'none';
  if (steps) steps.style.display = 'none';
  if (progress) progress.style.width = '100%';

  if (result) {
    // Read API URL
    const libraryUrl = 'https://post-vault-sigma.vercel.app/library';
    result.style.display = 'block';
    result.innerHTML = `
      <h3>\u2705 נשמר בהצלחה!</h3>
      <p>${summary || ''}</p>
      <a href="${libraryUrl}" target="_blank">פתח בספרייה</a>
    `;
  }

  // Auto-close after 5 seconds
  setTimeout(removeOverlay, 5000);
}

function showOverlayError(message) {
  if (!_overlayEl) return;
  const title = _overlayEl.querySelector('#pv-title');
  const steps = _overlayEl.querySelector('#pv-steps');
  const result = _overlayEl.querySelector('#pv-result');

  if (title) title.style.display = 'none';
  if (steps) steps.style.display = 'none';

  if (result) {
    result.style.display = 'block';
    result.innerHTML = `<h3 style="color:#ef4444">\u274C ${message}</h3>`;
  }

  setTimeout(removeOverlay, 3000);
}

function removeOverlay() {
  if (_overlayEl) { _overlayEl.remove(); _overlayEl = null; }
}

// --- Save flow with overlay ---
async function savePostWithOverlay(extractFn) {
  const overlay = showAnalysisOverlay();

  try {
    // Step 0: Extract content
    updateOverlayStep(0, 'loading');
    const data = extractFn();
    updateOverlayStep(0, 'done');

    if (data.isFeedPage) {
      throw new Error('נווט לדף של הפוסט הספציפי כדי לשמור אותו');
    }
    if (!data.text && !data.imageUrl) {
      throw new Error('לא נמצא תוכן בדף הזה');
    }

    // Steps 1-3: send to background
    updateOverlayStep(1, 'loading');

    const response = await chrome.runtime.sendMessage({
      action: 'analyzePost',
      data,
    });

    if (response && response.success) {
      updateOverlayStep(1, 'done');
      updateOverlayStep(2, 'done');
      updateOverlayStep(3, 'done');
      const summary = response.data?.analysis?.summary || response.data?.post?.ai_summary || '';
      showOverlaySuccess(summary, response.data?.post?.id);
    } else {
      throw new Error((response && response.error) || 'שגיאה');
    }
  } catch (error) {
    showOverlayError(error.message || 'שגיאה בשמירת הפוסט');
  }
}

// Listen for progress updates from background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updateProgress') {
    updateOverlayStep(request.step, request.status);
  }
});
