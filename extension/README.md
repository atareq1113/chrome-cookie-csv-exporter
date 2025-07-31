# Save Tab Cookies as CSV - Chrome Extension

## Overview
This Chrome extension allows you to view, search, filter, and download cookies from your browser in CSV format. It also includes a local API server for storing and managing cookies remotely. You can:
- View all cookies in a sortable, filterable table (powered by [Tabulator](http://tabulator.info/)).
- Search for cookies by name (supports multiple terms and exclusions).
- Download all visible (filtered) cookies as a CSV file.
- Send cookies to a local API server for storage and management.
- Delete stored cookies from the API server.
- Download individual cookies as CSV files.

## Features

### **Table View**
All cookies are displayed in a table with columns for:
- Name, Value, Domain, Path
- Secure flag, HTTP Only flag
- Expiration Date, Same Site setting

### **Search & Filter**
- **Real-time search** by cookie name (case-insensitive, partial match)
- **Multiple comma-separated terms** support (e.g., `foo,bar` matches cookies with `foo` or `bar` in the name)
- **Exclusion filtering** with `!` prefix (e.g., `!foo,bar` excludes cookies with `foo` or `bar` in the name)
- **Complex filtering** (e.g., `foo,!bar` includes cookies with `foo` but not `bar`)

### **Export Options**
- **CSV Download**: The "Save as CSV" button downloads only the cookies currently visible in the table (after filtering)
- **API Storage**: The "Send to API" button sends cookies to your local server for storage
- **Delete Stored**: The "Delete Stored" button removes all cookies from the API server

### **Local API Server**
- **RESTful API** for cookie storage and management
- **JSON file storage** with metadata (timestamps, search queries, etc.)
- **Health check endpoint** for server status
- **Filtered cookie storage** with search query metadata
- **Data persistence** between server restarts

## Installation

### **Chrome Extension**
1. Download or clone this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the extension folder.
5. The extension icon will appear in your toolbar.

### **Local API Server**
1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the local API server:**
   ```bash
   npm start
   ```

3. **Verify server is running:**
   - Health check: http://localhost:3000/health
   - View stored cookies: http://localhost:3000/cookies

## Usage

### **Basic Cookie Management**
1. Click the extension icon to open the popup.
2. Use the search box to filter cookies by name:
   - `session` — shows cookies with `session` in the name
   - `foo,bar` — shows cookies with `foo` or `bar` in the name
   - `!foo,bar` — excludes cookies with `foo` or `bar` in the name
   - `foo,!bar` — includes cookies with `foo` but not `bar`
3. Click **Save as CSV** to download all currently visible cookies as a CSV file.

### **API Integration**
1. **Send cookies to API:**
   - Click **Send to API** to send all visible cookies to your local server
   - Status messages will show success or error
   - Cookies are stored with metadata in `data/cookies.json`

2. **Delete stored cookies:**
   - Click **Delete Stored** to remove all cookies from the API server
   - Confirmation dialog prevents accidental deletion
   - Status messages confirm the action

3. **View stored cookies:**
   - Visit http://localhost:3000/cookies in your browser
   - See all stored cookie entries with metadata

### **Server Management**
- **Start server:** `npm start`
- **Development mode:** `npm run dev` (auto-restart on changes)
- **Stop server:** Ctrl+C in terminal
- **Clear stored cookies:** `curl -X DELETE http://localhost:3000/cookies`

## API Endpoints

### **Server Endpoints**
- `GET /health` - Health check
- `POST /cookies` - Receive all cookies
- `POST /cookies/filtered` - Receive filtered cookies with search metadata
- `GET /cookies` - View all stored cookie entries
- `GET /cookies/:id` - View specific cookie entry
- `DELETE /cookies` - Delete all stored cookies

### **Data Format**
Cookies are stored in this JSON structure:
```json
{
  "id": "1703123456789",
  "receivedAt": "2023-12-21T10:30:45.123Z",
  "timestamp": "2023-12-21T10:30:45.000Z",
  "totalCookies": 150,
  "searchQuery": "session,auth",
  "filteredCount": "25",
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "secure": true,
      "httpOnly": true,
      "expirationDate": 1735689600,
      "sameSite": "Lax",
      "storeId": "0"
    }
  ]
}
```

## CSV Format
The CSV file contains the following columns:
- Name
- Value
- Domain
- Path
- Secure (1 or 0)
- HTTP Only (1 or 0)
- Expiration Date (timestamp, if available)
- Same Site

## Troubleshooting

### **Extension Issues**
- **No cookies shown:** Check if you're on a website with cookies
- **API connection failed:** Ensure server is running on localhost:3000
- **Permission errors:** Check Chrome extension permissions

### **Server Issues**
- **Port 3000 already in use:** Change the PORT variable in `server.js`
- **CORS errors:** Server includes CORS middleware for Chrome extensions
- **Large payloads:** Server configured to handle up to 10MB requests
- **File permissions:** Ensure write access to the extension directory

### **Data Management**
- **Clear stored cookies:** Use the "Delete Stored" button or `curl -X DELETE http://localhost:3000/cookies`
- **View stored data:** Check `data/cookies.json` file
- **Backup data:** Copy `data/cookies.json` before major changes

## Development

### **File Structure**
```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Extension functionality
├── cookie-api.js         # API communication
├── server.js             # Local API server
├── package.json          # Server dependencies
├── setup.md              # Setup instructions
├── data/                 # Stored cookie data
└── node_modules/         # Server dependencies
```

### **Customization**
- **Change server port:** Modify PORT variable in `server.js`
- **Custom API endpoints:** Add new routes in `server.js`
- **Modify data storage:** Update saveCookies() function in `server.js`
- **Add new features:** Extend CookieAPI class in `cookie-api.js`

## Security Notes
- The extension can only access cookies your browser allows for extensions
- Filtering and download features work entirely client-side
- API server runs locally and doesn't send data externally
- Stored cookie data is kept in local JSON files
- No authentication required for local API server

## Credits
- Table UI powered by [Tabulator](http://tabulator.info/)
- Server built with Express.js
- Chrome Extension API for cookie access

---

**Enjoy your cookie management!** 🍪 