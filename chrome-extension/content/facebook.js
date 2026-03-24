// PostVault Facebook Content Script
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

  // --- Extract page data ---
  function extractPageData() {
    const url = window.location.href.split('?')[0];
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    // Try to get text from DOM
    let caption = '';
    const dirAutos = document.querySelectorAll('div[dir="auto"]');
    for (const el of dirAutos) {
      const text = (el.textContent || '').trim();
      if (text.length > 30 && text.length > caption.length) {
        caption = text;
      }
    }

    const text = caption || ogDesc || ogTitle || '';

    return {
      url,
      platform: 'facebook',
      text: text || null,
      imageUrl: ogImage || null,
      videoUrl: null,
      thumbnailUrl: ogImage || null,
      authorName: null,
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
  // APPROACH B: Per-post buttons on [role="article"]
  // =====================================================
  function addPerPostButtons() {
    const articles = document.querySelectorAll('[role="article"]');
    for (const article of articles) {
      if (article.querySelector('.postvault-btn')) continue;
      if (article.dataset.postvaultProcessed) continue;
      article.dataset.postvaultProcessed = 'true';

      const btn = document.createElement('button');
      btn.className = 'postvault-btn';
      btn.innerHTML = '📚 PostVault';
      btn.title = 'שמור ונתח ב-PostVault';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveCurrentPost(btn);
      });

      article.appendChild(btn);
    }
  }

  // =====================================================
  // APPROACH C: Context menu listener
  // =====================================================
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'extractAndSave') {
      const data = extractPageData();
      sendResponse(data);
      saveCurrentPost(document.getElementById('postvault-fab'));
    }
  });

  // --- Initialize ---
  addFloatingButton();
  addPerPostButtons();

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
