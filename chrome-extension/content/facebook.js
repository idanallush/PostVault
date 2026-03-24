// PostVault Facebook Content Script
// Adds a "Save to PostVault" button on every Facebook post

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
  function extractPostUrl(postEl) {
    // Look for permalink-like links inside the post
    const links = postEl.querySelectorAll('a[href]');
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      // Facebook post URLs contain /posts/, /photo/, /videos/, /reel/, /watch/
      if (/\/(posts|photo|videos|reel|watch|permalink)\//.test(href)) {
        try {
          const url = new URL(href, 'https://www.facebook.com');
          return url.origin + url.pathname;
        } catch { /* ignore */ }
      }
    }
    // Timestamp links often point to the post
    const timeLinks = postEl.querySelectorAll('a[href*="facebook.com"]');
    for (const a of timeLinks) {
      const href = a.getAttribute('href') || '';
      if (href.includes('/posts/') || href.includes('/permalink/') || href.includes('/photo/')) {
        return href.split('?')[0];
      }
    }
    return window.location.href;
  }

  // --- Extract caption/text ---
  function extractCaption(postEl) {
    // Facebook post text is usually in div[dir="auto"] with data-ad-comet-rendering-mode
    // or just in div[dir="auto"] containers
    const dirAutoEls = postEl.querySelectorAll('div[dir="auto"]');
    let bestText = '';
    for (const el of dirAutoEls) {
      const text = el.textContent || '';
      // Skip short strings (like button labels)
      if (text.length > bestText.length && text.length > 15) {
        // Avoid comments section — check if it's in the main post body
        const isComment = el.closest('[role="article"]') !== postEl;
        if (!isComment) {
          bestText = text;
        }
      }
    }
    return bestText.trim() || null;
  }

  // --- Extract image ---
  function extractImage(postEl) {
    const images = postEl.querySelectorAll('img[src]');
    let best = null;
    let bestSize = 0;
    for (const img of images) {
      const src = img.getAttribute('src') || '';
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      const size = w * h;
      // Facebook CDN images
      if (src.includes('fbcdn') || src.includes('facebook')) {
        if (size > bestSize && size > 10000) {
          bestSize = size;
          best = src;
        }
      }
    }
    // Fallback
    if (!best) {
      for (const img of images) {
        const src = img.getAttribute('src') || '';
        const w = img.naturalWidth || img.width || 150;
        if (w > 200 && src.startsWith('http')) {
          best = src;
          break;
        }
      }
    }
    return best;
  }

  // --- Extract video ---
  function extractVideo(postEl) {
    const video = postEl.querySelector('video');
    if (!video) return { videoUrl: null, poster: null };
    return {
      videoUrl: video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || null,
      poster: video.getAttribute('poster') || null,
    };
  }

  // --- Extract author name ---
  function extractAuthor(postEl) {
    // Author name is usually in <strong> or <h2>/<h3> with <a> inside
    const headings = postEl.querySelectorAll('h2 a, h3 a, h4 a, strong a');
    for (const a of headings) {
      const text = a.textContent?.trim();
      if (text && text.length > 1 && text.length < 60) {
        return text;
      }
    }
    return null;
  }

  // --- Detect post type ---
  function detectPostType(postEl) {
    const url = extractPostUrl(postEl);
    if (postEl.querySelector('video') || /\/(watch|reel|videos)\//.test(url)) return 'video';
    if (postEl.querySelectorAll('img[src*="fbcdn"]').length > 1) return 'carousel';
    if (postEl.querySelector('img[src*="fbcdn"]') || /\/photo\//.test(url)) return 'image';
    return 'text';
  }

  // --- Main data extraction ---
  function extractFacebookPostData(postEl) {
    const url = extractPostUrl(postEl);
    const caption = extractCaption(postEl);
    const imageUrl = extractImage(postEl);
    const { videoUrl, poster } = extractVideo(postEl);
    const authorName = extractAuthor(postEl);
    const postType = detectPostType(postEl);

    return {
      url,
      platform: 'facebook',
      text: caption,
      imageUrl: imageUrl || poster || null,
      videoUrl: videoUrl || null,
      thumbnailUrl: poster || imageUrl || null,
      authorName,
      postType,
    };
  }

  // --- Add button ---
  function addSaveButton(postEl) {
    if (postEl.querySelector('.postvault-btn')) return;
    if (postEl.dataset.postvaultProcessed) return;
    postEl.dataset.postvaultProcessed = 'true';

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
        const data = extractFacebookPostData(postEl);

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

    // Facebook: insert at the bottom of the post, before comments
    // The post actions bar (like, comment, share) is usually a div with role
    const actionBars = postEl.querySelectorAll('[role="button"]');
    const lastActionParent = actionBars.length > 0
      ? actionBars[actionBars.length - 1].parentElement
      : null;

    if (lastActionParent && lastActionParent.closest('[role="article"]') === postEl) {
      lastActionParent.appendChild(btn);
    } else {
      postEl.appendChild(btn);
    }
  }

  // --- Scan ---
  function scanForPosts() {
    // Facebook posts: [role="article"], or div with data-ad-comet-rendering-mode
    const posts = document.querySelectorAll('[role="article"]');
    posts.forEach((p) => addSaveButton(p));
  }

  // Initial scan + MutationObserver
  scanForPosts();

  let scanTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(scanTimeout);
    scanTimeout = setTimeout(scanForPosts, 500);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
