// PostVault Instagram Content Script
// Adds a "Save to PostVault" button on every Instagram post

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

  // --- Extract post URL ---
  function extractPostUrl(articleEl) {
    // Single post/reel page
    const path = window.location.pathname;
    if (/^\/(p|reel|reels)\/[A-Za-z0-9_-]+/.test(path)) {
      return window.location.href.split('?')[0];
    }
    // Feed: find <a> with /p/ or /reel/ inside the article
    const links = articleEl.querySelectorAll('a[href]');
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      if (/^\/(p|reel|reels)\/[A-Za-z0-9_-]+/.test(href)) {
        return 'https://www.instagram.com' + href.split('?')[0];
      }
    }
    return window.location.href;
  }

  // --- Extract caption text ---
  function extractCaption(articleEl) {
    // Instagram captions live inside <span> elements with dir="auto" or
    // inside the first <li> after the post media
    // Strategy: find longest text span inside the article
    const spans = articleEl.querySelectorAll('span');
    let bestText = '';
    for (const span of spans) {
      const text = span.textContent || '';
      // Skip very short strings, usernames, "like" buttons etc
      if (text.length > bestText.length && text.length > 20) {
        // Avoid picking up comment section — stick to first relevant container
        const parent = span.closest('ul, [role="presentation"]');
        if (!parent || parent.closest('article') === articleEl) {
          bestText = text;
        }
      }
    }
    // Fallback: og:description from meta (works on single post pages)
    if (!bestText) {
      const meta = document.querySelector('meta[property="og:description"]');
      if (meta) bestText = meta.getAttribute('content') || '';
    }
    return bestText.trim() || null;
  }

  // --- Extract images ---
  function extractImage(articleEl) {
    // Prefer the main post image (largest, inside article)
    const images = articleEl.querySelectorAll('img[src]');
    let best = null;
    let bestSize = 0;
    for (const img of images) {
      // Skip profile pics (small, usually in header)
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      const size = w * h;
      const src = img.getAttribute('src') || '';
      // Filter: Instagram CDN images
      if (src.includes('instagram') || src.includes('cdninstagram') || src.includes('fbcdn')) {
        if (size > bestSize) {
          bestSize = size;
          best = src;
        }
      }
    }
    // Fallback: first large img
    if (!best) {
      for (const img of images) {
        const src = img.getAttribute('src') || '';
        if (src.startsWith('http') && !src.includes('profile') && !src.includes('_s.jpg')) {
          best = src;
          break;
        }
      }
    }
    return best;
  }

  // --- Extract video ---
  function extractVideo(articleEl) {
    const video = articleEl.querySelector('video');
    if (!video) return { videoUrl: null, poster: null };
    return {
      videoUrl: video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || null,
      poster: video.getAttribute('poster') || null,
    };
  }

  // --- Extract username ---
  function extractUsername(articleEl) {
    // Header area: first <a> inside header that links to a profile
    const header = articleEl.querySelector('header');
    if (header) {
      const links = header.querySelectorAll('a[href]');
      for (const a of links) {
        const href = a.getAttribute('href') || '';
        // Profile links: /username/ (no /p/, /reel/, etc.)
        if (/^\/[A-Za-z0-9_.]+\/?$/.test(href)) {
          return a.textContent?.trim() || href.replace(/\//g, '');
        }
      }
    }
    return null;
  }

  // --- Detect post type ---
  function detectPostType(articleEl) {
    if (articleEl.querySelector('video')) return 'video';
    const carouselDots = articleEl.querySelectorAll('[role="tablist"] [role="tab"], [aria-label*="Go to"]');
    if (carouselDots.length > 1) return 'carousel';
    return 'image';
  }

  // --- Main data extraction ---
  function extractInstagramPostData(articleEl) {
    const url = extractPostUrl(articleEl);
    const caption = extractCaption(articleEl);
    const imageUrl = extractImage(articleEl);
    const { videoUrl, poster } = extractVideo(articleEl);
    const username = extractUsername(articleEl);
    const postType = detectPostType(articleEl);

    return {
      url,
      platform: 'instagram',
      text: caption,
      imageUrl: imageUrl || poster || null,
      videoUrl: videoUrl || null,
      thumbnailUrl: poster || imageUrl || null,
      authorName: username,
      postType,
    };
  }

  // --- Add button ---
  function addSaveButton(articleEl) {
    if (articleEl.querySelector('.postvault-btn')) return;
    if (articleEl.dataset.postvaultProcessed) return;
    articleEl.dataset.postvaultProcessed = 'true';

    const btn = document.createElement('button');
    btn.className = 'postvault-btn';
    btn.innerHTML = '📚 PostVault';
    btn.title = 'שמור ונתח ב-PostVault';

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      btn.classList.add('loading');
      btn.innerHTML = '⏳ מנתח...';

      try {
        const data = extractInstagramPostData(articleEl);

        if (!data.url) throw new Error('לא נמצא URL לפוסט');

        const response = await chrome.runtime.sendMessage({
          action: 'analyzePost',
          data,
        });

        if (response && response.success) {
          btn.className = 'postvault-btn success';
          btn.innerHTML = '✅ נשמר!';
          showToast('הפוסט נשמר ונותח בהצלחה!', 'success');
        } else {
          throw new Error((response && response.error) || 'שגיאה');
        }
      } catch (error) {
        btn.className = 'postvault-btn error';
        btn.innerHTML = '❌ שגיאה';
        showToast(error.message || 'שגיאה בשמירת הפוסט', 'error');
      }

      setTimeout(() => {
        btn.className = 'postvault-btn';
        btn.innerHTML = '📚 PostVault';
      }, 3000);
    });

    // Insert near action buttons (like, comment, share section)
    const sections = articleEl.querySelectorAll('section');
    // The action buttons section is usually the second <section> inside the article
    const actionsSection = sections[1] || sections[0];
    if (actionsSection) {
      actionsSection.appendChild(btn);
    } else {
      // Fallback: append to article
      articleEl.appendChild(btn);
    }
  }

  // --- Scan ---
  function scanForPosts() {
    const articles = document.querySelectorAll('article');
    articles.forEach((a) => addSaveButton(a));
  }

  // Initial scan + MutationObserver for infinite scroll
  scanForPosts();

  let scanTimeout;
  const observer = new MutationObserver(() => {
    // Debounce to avoid excessive DOM scans
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(scanForPosts, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
