// PostVault Facebook Content Script
// Uses shared.js (loaded first) for overlay, icons, save flow

(function () {
  'use strict';

  function isSpecificPostUrl(url) {
    return /\/(posts|photo|videos|reel|watch|permalink|story\.php)/.test(url)
      || /[?&](v|story_fbid|fbid)=/.test(url)
      || /fb\.watch\//.test(url);
  }

  function extractPageData() {
    let url = window.location.href.split('?')[0];
    const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
    if (ogUrl && isSpecificPostUrl(ogUrl)) {
      url = ogUrl.split('?')[0];
    }

    if (!isSpecificPostUrl(url) && !isSpecificPostUrl(window.location.href)) {
      return { url: null, platform: 'facebook', text: null, imageUrl: null, isFeedPage: true };
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    let caption = '';
    const dirAutos = document.querySelectorAll('div[dir="auto"]');
    for (const el of dirAutos) {
      const text = (el.textContent || '').trim();
      if (text.length > 30 && text.length > caption.length) {
        caption = text;
      }
    }

    return {
      url,
      platform: 'facebook',
      text: caption || ogDesc || ogTitle || null,
      imageUrl: ogImage || null,
      videoUrl: null,
      thumbnailUrl: ogImage || null,
      authorName: null,
    };
  }

  // --- FAB ---
  function addFloatingButton() {
    if (document.getElementById('postvault-fab')) return;
    const fab = document.createElement('button');
    fab.id = 'postvault-fab';
    fab.innerHTML = PV_ICONS.bookmark + '<span class="pv-fab-text">PostVault</span>';
    fab.title = 'שמור דף זה ב-PostVault';

    fab.addEventListener('click', () => {
      fab.innerHTML = PV_ICONS.spinner + '<span class="pv-fab-text">שומר...</span>';
      savePostWithOverlay(extractPageData).finally(() => {
        setTimeout(() => {
          fab.className = '';
          fab.innerHTML = PV_ICONS.bookmark + '<span class="pv-fab-text">PostVault</span>';
        }, 2000);
      });
    });

    document.body.appendChild(fab);
  }

  // --- Per-post buttons ---
  function addPerPostButtons() {
    const articles = document.querySelectorAll('[role="article"]');
    for (const article of articles) {
      if (article.querySelector('.postvault-btn')) continue;
      if (article.dataset.postvaultProcessed) continue;
      article.dataset.postvaultProcessed = 'true';

      const btn = document.createElement('button');
      btn.className = 'postvault-btn';
      btn.innerHTML = PV_ICONS.bookmark + ' PostVault';
      btn.title = 'שמור ונתח ב-PostVault';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        savePostWithOverlay(extractPageData);
      });

      article.appendChild(btn);
    }
  }

  // --- Context menu listener ---
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'extractAndSave') {
      sendResponse({ ok: true });
      savePostWithOverlay(extractPageData);
    }
  });

  // --- Init ---
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
