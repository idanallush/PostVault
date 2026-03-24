// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  const { apiUrl, savedCount } = await chrome.storage.sync.get({
    apiUrl: 'https://post-vault-sigma.vercel.app',
    savedCount: 0,
  });

  document.getElementById('api-url').value = apiUrl;
  document.getElementById('saved-count').textContent = savedCount;
  document.getElementById('open-library').href = apiUrl + '/library';
});

// Save settings
document.getElementById('save-settings').addEventListener('click', async () => {
  const apiUrl = document.getElementById('api-url').value.replace(/\/$/, '');
  await chrome.storage.sync.set({ apiUrl });

  // Update library link
  document.getElementById('open-library').href = apiUrl + '/library';

  const btn = document.getElementById('save-settings');
  btn.textContent = '✓ נשמר';
  setTimeout(() => (btn.textContent = 'שמור'), 1500);
});
