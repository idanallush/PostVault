// PostVault Background Service Worker

// --- Context Menu ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-postvault',
    title: 'שמור ב-PostVault',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://www.instagram.com/*',
      'https://www.facebook.com/*',
    ],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-to-postvault' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'extractAndSave' });
  }
});

// --- Message handler ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePost') {
    const tabId = sender.tab?.id;
    handleAnalyzePost(request.data, tabId)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleAnalyzePost(postData, tabId) {
  const { apiUrl } = await chrome.storage.sync.get({
    apiUrl: 'https://post-vault-sigma.vercel.app',
  });

  // Progress: step 1 done (extraction happened in content script)
  if (tabId) chrome.tabs.sendMessage(tabId, { action: 'updateProgress', step: 1, status: 'loading' });

  const payload = {
    url: postData.url,
    manualText: postData.text || undefined,
    imageUrl: postData.imageUrl || postData.thumbnailUrl || undefined,
  };

  // Progress: step 2 (AI processing)
  if (tabId) chrome.tabs.sendMessage(tabId, { action: 'updateProgress', step: 2, status: 'loading' });

  const response = await fetch(`${apiUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 409) {
      throw new Error('הפוסט הזה כבר שמור בספרייה!');
    }
    if (response.status === 429) {
      throw new Error('יש להמתין כמה שניות בין שמירות');
    }
    throw new Error(errorData.error || `שגיאה ${response.status}`);
  }

  // Progress: step 3 done (saving)
  if (tabId) chrome.tabs.sendMessage(tabId, { action: 'updateProgress', step: 2, status: 'done' });
  if (tabId) chrome.tabs.sendMessage(tabId, { action: 'updateProgress', step: 3, status: 'loading' });

  const result = await response.json();

  if (tabId) chrome.tabs.sendMessage(tabId, { action: 'updateProgress', step: 3, status: 'done' });

  // Update saved count
  const { savedCount } = await chrome.storage.sync.get({ savedCount: 0 });
  await chrome.storage.sync.set({ savedCount: savedCount + 1 });

  return result;
}
