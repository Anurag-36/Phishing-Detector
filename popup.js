async function update() {
  const titleEl = document.getElementById('title');
  const selEl = document.getElementById('selection');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    titleEl.textContent = tab ? tab.title : '—';
    if (!tab || !tab.id) {
      selEl.textContent = '—';
      return;
    }
    const canReadSelection = (() => {
      try {
        const url = new URL(tab.url || '');
        return ['http:', 'https:', 'file:', 'ftp:'].includes(url.protocol);
      } catch (e) {
        return false;
      }
    })();

    if (canReadSelection) {
      try {
        const results = await chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
        selEl.textContent = results && results.selection ? results.selection : '—';
      } catch (selectionError) {
        selEl.textContent = '—';
      }
    } else {
      selEl.textContent = '—';
    }

    // Request analysis from background even if selection lookup failed.
    const resp = await chrome.runtime.sendMessage({ type: 'ANALYZE_PAGE', tabId: tab.id });
    if (resp && resp.report) {
      renderReport(resp.report);
    } else if (resp && resp.error) {
      console.warn('Analysis failed:', resp.error);
    }
  } catch (err) {
    titleEl.textContent = '—';
    selEl.textContent = 'No selection or permission';
    console.error(err);
  }
}

document.getElementById('refresh').addEventListener('click', update);
document.getElementById('copy').addEventListener('click', async () => {
  const text = document.getElementById('selection').textContent || '';
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error('Copy failed', e);
  }
});

update();

function renderReport(report) {
  const risk = document.getElementById('risk');
  const status = document.getElementById('status');
  const reasonsEl = document.getElementById('reasons');
  if (!report || !report.scoring) return;
  risk.textContent = report.scoring.score + '%';
  status.textContent = report.scoring.category;
  reasonsEl.innerHTML = '';
  (report.scoring.reasons || []).forEach(r => {
    const li = document.createElement('li'); li.textContent = r; reasonsEl.appendChild(li);
  });
}
