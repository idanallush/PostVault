// PostVault Instagram Content Script
// Uses shared.js (loaded first) for overlay, icons, save flow

(function () {
  'use strict';

  // --- Extract page data (meta tags — always works) ---
  function extractPageData() {
    const url = window.location.href.split('?')[0];
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

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

    return {
      url,
      platform: 'instagram',
      text: caption || ogDesc || ogTitle || null,
      imageUrl: ogImage || null,
      videoUrl: null,
      thumbnailUrl: ogImage || null,
      authorName: username,
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

  // --- Per-reel inline buttons ---
  function addPerPostButtons() {
    const saveIcons = document.querySelectorAll('svg[aria-label="Save"]');
    for (const svg of saveIcons) {
      const btnContainer = svg.closest('[role="button"]') || svg.closest('button') || svg.parentElement;
      if (!btnContainer) continue;
      const actionsColumn = btnContainer.parentElement;
      if (!actionsColumn || actionsColumn.querySelector('.postvault-reel-btn')) continue;

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

      const btn = document.createElement('button');
      btn.className = 'postvault-btn postvault-reel-btn';
      btn.innerHTML = PV_ICONS.bookmarkSm;
      btn.title = 'שמור ב-PostVault';

      const label = document.createElement('span');
      label.className = 'postvault-reel-label';
      label.textContent = 'שמור';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.innerHTML = PV_ICONS.spinner;
        label.textContent = '...';
        savePostWithOverlay(extractPageData).finally(() => {
          setTimeout(() => {
            btn.innerHTML = PV_ICONS.bookmarkSm;
            label.textContent = 'שמור';
          }, 2000);
        });
      });

      wrapper.appendChild(btn);
      wrapper.appendChild(label);
      actionsColumn.appendChild(wrapper);
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
