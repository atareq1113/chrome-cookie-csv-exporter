const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow requests from Chrome extension
app.use(express.json({ limit: '10mb' })); // Handle large cookie payloads

// Create data directory if it doesn't exist
const DATA_DIR = path.join(__dirname, 'data');
const COOKIES_FILE = path.join(DATA_DIR, 'cookies.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Load existing cookies
async function loadCookies() {
  try {
    const data = await fs.readFile(COOKIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save cookies to file
async function saveCookies(cookies) {
  await ensureDataDir();
  await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Cookie API server is running'
  });
});

// Receive cookies endpoint
app.post('/cookies', async (req, res) => {
  try {
    const { timestamp, totalCookies, cookies } = req.body;
    
    if (!cookies || !Array.isArray(cookies)) {
      return res.status(400).json({ error: 'Invalid cookie data' });
    }

    console.log(`Received ${cookies.length} cookies at ${timestamp}`);

    // Load existing cookies
    const existingCookies = await loadCookies();
    
    // Add new cookies with metadata
    const newCookieEntry = {
      id: Date.now().toString(),
      receivedAt: new Date().toISOString(),
      timestamp: timestamp,
      totalCookies: totalCookies,
      cookies: cookies
    };
    
    existingCookies.push(newCookieEntry);
    
    // Save updated cookies
    await saveCookies(existingCookies);
    
    res.json({
      success: true,
      message: `Successfully stored ${cookies.length} cookies`,
      entryId: newCookieEntry.id,
      totalEntries: existingCookies.length
    });
    
  } catch (error) {
    console.error('Error storing cookies:', error);
    res.status(500).json({ error: 'Failed to store cookies' });
  }
});

// Receive filtered cookies endpoint
app.post('/cookies/filtered', async (req, res) => {
  try {
    const { timestamp, totalCookies, cookies } = req.body;
    const searchQuery = req.headers['x-search-query'] || 'unknown';
    const filteredCount = req.headers['x-filtered-count'] || '0';
    
    if (!cookies || !Array.isArray(cookies)) {
      return res.status(400).json({ error: 'Invalid cookie data' });
    }

    console.log(`Received ${cookies.length} filtered cookies (query: "${searchQuery}")`);

    // Load existing cookies
    const existingCookies = await loadCookies();
    
    // Add new filtered cookies with metadata
    const newCookieEntry = {
      id: Date.now().toString(),
      receivedAt: new Date().toISOString(),
      timestamp: timestamp,
      totalCookies: totalCookies,
      searchQuery: searchQuery,
      filteredCount: filteredCount,
      cookies: cookies,
      type: 'filtered'
    };
    
    existingCookies.push(newCookieEntry);
    
    // Save updated cookies
    await saveCookies(existingCookies);
    
    res.json({
      success: true,
      message: `Successfully stored ${cookies.length} filtered cookies`,
      entryId: newCookieEntry.id,
      searchQuery: searchQuery,
      totalEntries: existingCookies.length
    });
    
  } catch (error) {
    console.error('Error storing filtered cookies:', error);
    res.status(500).json({ error: 'Failed to store filtered cookies' });
  }
});

// Get all stored cookie entries
app.get('/cookies', async (req, res) => {
  try {
    const cookies = await loadCookies();
    res.json({
      totalEntries: cookies.length,
      entries: cookies
    });
  } catch (error) {
    console.error('Error loading cookies:', error);
    res.status(500).json({ error: 'Failed to load cookies' });
  }
});

// Get specific cookie entry by ID
app.get('/cookies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cookies = await loadCookies();
    const entry = cookies.find(entry => entry.id === id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error loading cookie entry:', error);
    res.status(500).json({ error: 'Failed to load cookie entry' });
  }
});

// Delete all stored cookies
app.delete('/cookies', async (req, res) => {
  try {
    await saveCookies([]);
    res.json({ success: true, message: 'All cookies deleted' });
  } catch (error) {
    console.error('Error deleting cookies:', error);
    res.status(500).json({ error: 'Failed to delete cookies' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🍪 Cookie API server running on http://localhost:${PORT}`);
  console.log(`📁 Cookies will be stored in: ${DATA_DIR}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Cookie endpoint: http://localhost:${PORT}/cookies`);
});

module.exports = app; 