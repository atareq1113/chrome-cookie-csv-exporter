// Initialize CookieAPI
const cookieAPI = new CookieAPI();

// Status display functions
function showStatus(message, type = 'loading') {
  const statusEl = document.getElementById('api-status');
  if (!statusEl) return; // Guard against DOM not ready
  
  statusEl.textContent = message;
  statusEl.className = `status-${type}`;
  statusEl.style.display = 'block';
  
  if (type !== 'loading') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

function hideStatus() {
  const statusEl = document.getElementById('api-status');
  if (statusEl) {
    statusEl.style.display = 'none';
  }
}

// Send cookies to API
document.getElementById('send-cookies').addEventListener('click', async () => {
  if (!table) {
    showStatus('No cookies available', 'error');
    return;
  }
  
  const cookies = table.getData();
  if (!cookies || cookies.length === 0) {
    showStatus('No cookies found to send', 'error');
    return;
  }

  showStatus('Sending cookies to API...', 'loading');
  
  try {
    const response = await cookieAPI.sendCookies(cookies);
    showStatus(`✅ Successfully sent ${cookies.length} cookies to API`, 'success');
    console.log('API Response:', response);
  } catch (error) {
    console.error('Error sending cookies to API:', error);
    showStatus(`❌ Failed to send cookies: ${error.message}`, 'error');
  }
});

// Delete stored cookies from API
document.getElementById('delete-stored').addEventListener('click', async () => {
  // Show confirmation dialog
  const confirmed = confirm('Are you sure you want to delete all stored cookies from the API? This action cannot be undone.');
  
  if (!confirmed) {
    return;
  }

  showStatus('Deleting stored cookies...', 'loading');
  
  try {
    const response = await cookieAPI.deleteStoredCookies();
    showStatus(`✅ Successfully deleted all stored cookies`, 'success');
    console.log('Delete Response:', response);
  } catch (error) {
    console.error('Error deleting stored cookies:', error);
    showStatus(`❌ Failed to delete stored cookies: ${error.message}`, 'error');
  }
});

// Send filtered cookies to API
//document.getElementById('send-filtered').addEventListener('click', async () => {
  //await sendFilteredCookiesToAPI();
//});

async function sendFilteredCookiesToAPI() {
  const searchQuery = document.getElementById('cookie-search').value.trim();
  
  if (!allCookies || allCookies.length === 0) {
    showStatus('No cookies available', 'error');
    return;
  }

  showStatus(`Sending filtered cookies (${searchQuery}) to API...`, 'loading');
  
  try {
    const response = await cookieAPI.sendFilteredCookies(allCookies, searchQuery);
    showStatus(`✅ Sent ${response.message}`, 'success');
    console.log('Filtered API Response:', response);
  } catch (error) {
    console.error('Error sending filtered cookies to API:', error);
    showStatus(`❌ Failed to send filtered cookies: ${error.message}`, 'error');
  }
}

// Test API connection on popup load
async function testAPIConnection() {
  try {
    const response = await cookieAPI.testConnection();
    console.log('API connection test successful:', response);
  } catch (error) {
    console.warn('API connection test failed:', error.message);
    showStatus('⚠️ API server not reachable. Make sure server is running on localhost:3000', 'error');
  }
}

// Original CSV download functionality
document.getElementById('save-cookies').addEventListener('click', async () => {
  if (!table) return;
  const cookies = table.getData();
  if (!cookies || cookies.length === 0) {
    alert('No cookies found.');
    return;
  }
  const header = ['Name','Value','Domain','Path','Secure','HTTP Only','Expiration Date','Same Site'];
  const rows = [header];
  cookies.forEach(cookie => {
    rows.push([
      cookie.name,
      cookie.value,
      cookie.domain,
      cookie.path,
      cookie.secure ? '1' : '0',
      cookie.httpOnly ? '1' : '0',
      cookie.expirationDate ? cookie.expirationDate : '',
      cookie.sameSite || ''
    ]);
  });
  const csv = rows.map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  try {
    await chrome.downloads.download({
      url,
      filename: 'cookies.csv',
      saveAs: true
    });
  } finally {
    // Clean up blob URL to prevent memory leaks
    URL.revokeObjectURL(url);
  }
});

// Tabulator integration for cookie table
let allCookies = [];
let table = null;

function downloadCookieAsCSV(cookie) {
  const header = ['Name','Value','Domain','Path','Secure','HTTP Only','Expiration Date','Same Site'];
  const row = [
    cookie.name,
    cookie.value,
    cookie.domain,
    cookie.path,
    cookie.secure ? '1' : '0',
    cookie.httpOnly ? '1' : '0',
    cookie.expirationDate ? cookie.expirationDate : '',
    cookie.sameSite || ''
  ];
  const csv = [header, row].map(r => r.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  try {
    chrome.downloads.download({
      url,
      filename: `cookie_${cookie.name}.csv`,
      saveAs: true
    });
  } finally {
    // Clean up blob URL to prevent memory leaks
    URL.revokeObjectURL(url);
  }
}

function renderTable(cookies) {
  if (table) {
    table.replaceData(cookies);
    return;
  }
  table = new Tabulator("#cookie-table", {
    data: cookies,
    layout: "fitDataStretch",
    height: 300,
    columns: [
      { title: "Name", field: "name", headerFilter: false },
      { title: "Value", field: "value", headerFilter: false },
      { title: "Domain", field: "domain", headerFilter: false },
      { title: "Path", field: "path", headerFilter: false },
      { title: "Secure", field: "secure", formatter: cell => cell.getValue() ? '1' : '0' },
      { title: "HTTP Only", field: "httpOnly", formatter: cell => cell.getValue() ? '1' : '0' },
      { title: "Expiration Date", field: "expirationDate", formatter: cell => cell.getValue() || '' },
      { title: "Same Site", field: "sameSite", formatter: cell => cell.getValue() || '' }
    ]
  });
}

// Load cookies and test API connection
chrome.cookies.getAll({}, (cookies) => {
  allCookies = cookies || [];
  renderTable(allCookies);
  
  // Test API connection after a short delay to ensure DOM is ready
  setTimeout(() => {
    testAPIConnection();
  }, 100);
});

document.getElementById('cookie-search').addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  if (!query) {
    table.replaceData(allCookies);
    return;
  }
  // Support multiple comma-separated terms, with ! for exclusion
  let terms = query.split(',').map(term => term.trim()).filter(Boolean);
  let includeTerms = [];
  let excludeTerms = [];

  if (terms.length > 0 && terms[0].startsWith('!')) {
    // All terms are exclusions
    excludeTerms = terms.map((term, i) => i === 0 ? term.slice(1) : term);
  } else {
    includeTerms = terms.filter(term => !term.startsWith('!'));
    excludeTerms = terms.filter(term => term.startsWith('!')).map(term => term.slice(1));
  }

  const filtered = allCookies.filter(cookie => {
    const name = cookie.name.toLowerCase();
    // Exclude if matches any exclude term
    if (excludeTerms.some(term => name.includes(term))) return false;
    // If there are include terms, must match at least one
    if (includeTerms.length > 0) {
      return includeTerms.some(term => name.includes(term));
    }
    // If only exclude terms, include everything else
    return true;
  });
  table.replaceData(filtered);
}); 