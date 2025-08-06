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

// Add event listener for Jancy Profiles button
document.getElementById('view-jancy-profiles').addEventListener('click', async () => {
  showJancyDialog();
});

// Add event listener for close button
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('jancy-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideJancyDialog);
  }
  
  // Add event listener for search input
  const searchInput = document.getElementById('jancy-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterJancyProfiles(this.value);
    });
  }
});

// Global variable to store the Tabulator table instance
let jancyTable = null;

// Filter profiles based on search term
function filterJancyProfiles(searchTerm) {
  if (!jancyTable) return;
  
  const query = searchTerm.toLowerCase().trim();
  
  if (!query) {
    // If no search term, show all profiles
    jancyTable.setFilter(function(data) {
      return true;
    });
    return;
  }
  
  // Filter by profileName, name, or email
  jancyTable.setFilter(function(data) {
    const profileName = (data.profileName || '').toLowerCase();
    const name = (data.name || '').toLowerCase();
    const email = (data.email || '').toLowerCase();
    
    return profileName.includes(query) || 
           name.includes(query) || 
           email.includes(query);
  });
}

// Show Jancy dialog
function showJancyDialog() {
  const dialog = document.getElementById('jancy-dialog');
  const content = document.getElementById('jancy-content');
  
  // Show dialog
  dialog.style.display = 'block';
  
  // Ensure close button has event listener
  const closeBtn = document.getElementById('jancy-close-btn');
  if (closeBtn && !closeBtn.hasEventListener) {
    closeBtn.addEventListener('click', hideJancyDialog);
    closeBtn.hasEventListener = true;
  }
  
  // Clear search input
  const searchInput = document.getElementById('jancy-search');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Load profiles
  loadJancyProfiles();
}

// Hide Jancy dialog
function hideJancyDialog() {
  const dialog = document.getElementById('jancy-dialog');
  dialog.style.display = 'none';
}

// Make hideJancyDialog available globally
window.hideJancyDialog = hideJancyDialog;

// Load Jancy profiles from API
async function loadJancyProfiles() {
  const content = document.getElementById('jancy-content');
  
  try {
    // Show loading state
    content.innerHTML = `
      <div class="jancy-loading">
        <div style="font-size: 48px; margin-bottom: 20px;">👤</div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Jancy Profiles</h3>
        <p style="margin: 0; color: #666;">Loading profile information...</p>
        <div style="margin-top: 20px;">
          <div class="jancy-spinner"></div>
        </div>
      </div>
    `;
    
    // Fetch profiles from API
    const response = await fetch('http://localhost:43033/jancy/v1/profiles');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const profiles = await response.json();
    
    // Transform the data to show only the fields we want
    const transformedProfiles = profiles.map(profile => ({
      id: profile.providerId,
      profileName: profile.profileName || 'N/A',
      name: profile.name || 'N/A',
      email: profile.email || 'N/A',
      proxyHost: profile.proxy?.host || 'N/A',
      proxyPort: profile.proxy?.port || 'N/A',
      proxyUsername: profile.proxy?.username || 'N/A',
      proxyPassword: profile.proxy?.password || 'N/A'
    }));
    
    // Create Tabulator table for profiles
    content.innerHTML = '<div id="jancy-table"></div>';
    
    // Initialize Tabulator table
    jancyTable = new Tabulator("#jancy-table", {
      data: transformedProfiles,
      layout: "fitDataStretch",
      height: 300,
      columns: [
        { title: "Profile", field: "profileName", headerFilter: false, width: 80 },
        { title: "Name", field: "name", headerFilter: false, width: 120 },
        { title: "Email", field: "email", headerFilter: false, width: 150 },
        { title: "Proxy Host", field: "proxyHost", headerFilter: false, width: 120 },
        { title: "Port", field: "proxyPort", headerFilter: false, width: 60 },
        { title: "Username", field: "proxyUsername", headerFilter: false, width: 80 },
        { title: "Password", field: "proxyPassword", headerFilter: false, width: 80,
          formatter: function(cell) {
            const value = cell.getValue();
            return value === 'N/A' ? 'N/A' : '••••••••';
          }
        }
      ],
      pagination: true,
      paginationSize: 5,
      paginationSizeSelector: [5, 10, 15],
      paginationButtonCount: 3,
      paginationCounter: function(pageSize, currentRow, currentPage, totalRows, totalPages) {
        return `Showing ${currentRow} of ${totalRows} profiles`;
      }
    });
    
    // Add a success note
    const note = document.createElement('div');
    note.style.cssText = 'margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 4px; font-size: 12px; color: #155724; text-align: center;';
    note.innerHTML = `Loaded ${transformedProfiles.length} profiles from API`;
    content.appendChild(note);
    
  } catch (error) {
    console.error('Error loading profiles:', error);
    content.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #e74c3c;">
        <h3>Error Loading Profiles</h3>
        <p>Unable to load profile information from API.</p>
        <p style="font-size: 12px; margin-top: 10px;">Error: ${error.message}</p>
        <button onclick="loadJancyProfiles()" style="margin-top: 15px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}

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