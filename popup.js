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
  chrome.downloads.download({
    url,
    filename: 'cookies.csv',
    saveAs: true
  });
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
  chrome.downloads.download({
    url,
    filename: `cookie_${cookie.name}.csv`,
    saveAs: true
  });
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

chrome.cookies.getAll({}, (cookies) => {
  allCookies = cookies || [];
  renderTable(allCookies);
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