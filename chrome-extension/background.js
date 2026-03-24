// PostVault Background Service Worker

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'analyzePost') {
    handleAnalyzePost(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // keep message channel open for async response
  }
});

async function handleAnalyzePost(postData) {
  // Read API URL from storage (default: production Vercel)
  const { apiUrl } = await chrome.storage.sync.get({
    apiUrl: 'https://post-vault-sigma.vercel.app',
  });

  const payload = {
    url: postData.url,
    manualText: postData.text || undefined,
    imageUrl: postData.imageUrl || postData.thumbnailUrl || undefined,
  };

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

  const result = await response.json();

  // Update saved count
  const { savedCount } = await chrome.storage.sync.get({ savedCount: 0 });
  await chrome.storage.sync.set({ savedCount: savedCount + 1 });

  return result;
}
