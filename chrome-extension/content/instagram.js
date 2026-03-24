// PostVault Instagram Content Script
// Three approaches: FAB (always works), per-post buttons (DOM-dependent), context menu

(function () {
  'use strict';

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

  // --- Extract page data (meta tags — always works) ---
  function extractPageData() {
    const url = window.location.href.split('?')[0];
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    // Try to get caption from DOM spans (longer text = likely caption)
    let caption = '';
    const spans = document.querySelectorAll('span');
    for (const span of spans) {
      const text = (span.textContent || '').trim();
      if (text.length > 50 && text.length > caption.length
        && !text.includes('©') && !text.includes('Instagram')
        && !text.includes('Log in') && !text.includes('Sign up')) {
        caption = text;
      }
    }

    // Try to get username from links
    let username = null;
    const userLinks = document.querySelectorAll('a[role="link"]');
    for (const a of userLinks) {
      const href = a.getAttribute('href') || '';
      if (/^\/[A-Za-z0-9_.]+\/?$/.test(href)) {
        const text = (a.textContent || '').trim();
        if (text.length > 0 && text.length < 30 && !text.includes(' ')) {
          username = text;
          break;
        }
      }
    }

    const text = caption || ogDesc || ogTitle || '';

    return {
      url,
      platform: 'instagram',
      text: text || null,
      imageUrl: ogImage || null,
      videoUrl: null,
      thumbnailUrl: ogImage || null,
      authorName: username,
    };
  }

  // --- Save post flow ---
  async function saveCurrentPost(feedbackEl) {
    const setFeedback = (html) => { if (feedbackEl) feedbackEl.innerHTML = html; };
    setFeedback('⏳');

    try {
      const data = extractPageData();

      if (!data.text && !data.imageUrl) {
        throw new Error('לא נמצא תוכן בדף הזה');
      }

      const response = await chrome.runtime.sendMessage({
        action: 'analyzePost',
        data,
      });

      if (response && response.success) {
        setFeedback('✅');
        showToast('הפוסט נשמר ונותח בהצלחה!', 'success');
      } else {
        throw new Error((response && response.error) || 'שגיאה');
      }
    } catch (error) {
      setFeedback('❌');
      showToast(error.message || 'שגיאה בשמירת הפוסט', 'error');
    }

    setTimeout(() => setFeedback('📚'), 3000);
  }

  // =====================================================
  // APPROACH A: Floating Action Button (always visible)
  // =====================================================
  function addFloatingButton() {
    if (document.getElementById('postvault-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'postvault-fab';
    fab.innerHTML = '📚';
    fab.title = 'שמור דף זה ב-PostVault';

    fab.addEventListener('click', () => saveCurrentPost(fab));
    document.body.appendChild(fab);
  }

  // =====================================================
  // APPROACH B: Per-post buttons (DOM-dependent)
  // Instagram Reels use SVG buttons for Like/Comment/Share/Save/More
  // We inject our button near the "Save" or "More" button
  // =====================================================
  function addPerPostButtons() {
    // Find all "Save" SVG buttons as anchors for per-reel buttons
    const saveIcons = document.querySelectorAll('svg[aria-label="Save"]');

    for (const svg of saveIcons) {
      // Walk up to find the clickable container
      const btnContainer = svg.closest('[role="button"]')
        || svg.closest('button')
        || svg.parentElement;

      if (!btnContainer) continue;

      // The column of action buttons is the parent of these buttons
      const actionsColumn = btnContainer.parentElement;
      if (!actionsColumn) continue;
      if (actionsColumn.querySelector('.postvault-btn')) continue;

      const btn = document.createElement('button');
      btn.className = 'postvault-btn postvault-reel-btn';
      btn.innerHTML = '📚';
      btn.title = 'שמור ב-PostVault';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveCurrentPost(btn);
      });

      // Insert after the Save button
      actionsColumn.appendChild(btn);
    }
  }

  // =====================================================
  // APPROACH C: Context menu listener
  // =====================================================
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'extractAndSave') {
      const data = extractPageData();
      sendResponse(data);
      // Also trigger the save
      saveCurrentPost(document.getElementById('postvault-fab'));
    }
  });

  // --- Initialize ---
  addFloatingButton();
  addPerPostButtons();

  // MutationObserver for dynamic content
  let scanTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => {
      addFloatingButton();
      addPerPostButtons();
    }, 800);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
