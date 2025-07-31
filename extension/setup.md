# Complete Setup Guide - Cookie Extension & API Server

## Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Chrome browser** (for the extension)
- **Git** (optional, for cloning the repository)

## Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Start the Local API Server**
```bash
npm start
```

### 3. **Load the Chrome Extension**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the extension folder
4. The extension icon should appear in your toolbar

### 4. **Test the Setup**
- **Server health check:** http://localhost:3000/health
- **View stored cookies:** http://localhost:3000/cookies
- **Extension popup:** Click the extension icon in Chrome

## Detailed Setup Instructions

### **Chrome Extension Setup**

#### **Step 1: Load the Extension**
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right corner)
4. Click "Load unpacked" button
5. Select the extension folder (`/path/to/your/extension`)
6. Verify the extension appears in the list
7. The extension icon should appear in your Chrome toolbar

#### **Step 2: Grant Permissions**
The extension requires these permissions:
- **cookies** - Access to browser cookies
- **activeTab** - Access to current tab
- **scripting** - Execute scripts
- **downloads** - Download CSV files
- **host permissions** - Access to all URLs

These are automatically granted when you load the extension.

#### **Step 3: Test Basic Functionality**
1. Visit any website with cookies (e.g., google.com, github.com)
2. Click the extension icon in your toolbar
3. You should see cookies displayed in a table
4. Try the search functionality
5. Test the "Save as CSV" button

### **API Server Setup**

#### **Step 1: Install Node.js Dependencies**
```bash
# Navigate to the extension directory
cd /path/to/your/extension

# Install dependencies
npm install
```

#### **Step 2: Start the Server**
```bash
# Start the server
npm start
```

You should see output like:
```
🍪 Cookie API server running on http://localhost:3000
📁 Cookies will be stored in: /path/to/extension/data
🔗 Health check: http://localhost:3000/health
📤 Cookie endpoint: http://localhost:3000/cookies
```

#### **Step 3: Verify Server is Running**
1. **Health check:** Visit http://localhost:3000/health
   - Should return: `{"status":"ok","message":"Cookie API server is running"}`
2. **View cookies:** Visit http://localhost:3000/cookies
   - Should return: `{"totalEntries":0,"entries":[]}` (empty initially)

#### **Step 4: Test API Integration**
1. Open your Chrome extension popup
2. Click "Send to API" button
3. Check the status message for success/error
4. Visit http://localhost:3000/cookies to see stored data

## Usage Examples

### **Basic Cookie Management**
```bash
# Start the server
npm start

# In Chrome extension:
# 1. Click extension icon
# 2. Search for specific cookies (e.g., "session")
# 3. Click "Save as CSV" to download
# 4. Click "Send to API" to store remotely
```

### **API Endpoint Testing**
```bash
# Health check
curl http://localhost:3000/health

# View stored cookies
curl http://localhost:3000/cookies

# Delete all stored cookies
curl -X DELETE http://localhost:3000/cookies

# Test with sample data
curl -X POST http://localhost:3000/cookies \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2023-12-21T10:00:00Z","totalCookies":1,"cookies":[{"name":"test","value":"value","domain":"example.com","path":"/","secure":false,"httpOnly":false}]}'
```

### **Development Mode**
```bash
# Start with auto-restart (requires nodemon)
npm run dev
```

## Configuration Options

### **Change Server Port**
Edit `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

### **Modify Data Storage Location**
Edit `server.js`:
```javascript
const DATA_DIR = path.join(__dirname, 'data'); // Change path as needed
```

### **Customize API Base URL**
Edit `cookie-api.js`:
```javascript
this.baseURL = 'http://localhost:3000'; // Change to your server URL
```

## Troubleshooting

### **Extension Issues**

#### **Extension Not Loading**
- **Error:** "Manifest file is missing or unreadable"
- **Solution:** Ensure you're selecting the correct folder (the one containing `manifest.json`)

#### **No Cookies Showing**
- **Error:** Empty table in extension popup
- **Solution:** 
  - Visit a website with cookies
  - Check if cookies are enabled in Chrome
  - Verify extension permissions

#### **API Connection Failed**
- **Error:** "API server not reachable" message
- **Solution:**
  - Ensure server is running (`npm start`)
  - Check if port 3000 is available
  - Verify firewall settings

### **Server Issues**

#### **Port Already in Use**
- **Error:** `EADDRINUSE: address already in use :::3000`
- **Solution:**
  ```bash
  # Find process using port 3000
  netstat -ano | findstr :3000
  
  # Kill the process or change port in server.js
  ```

#### **Permission Denied**
- **Error:** `EACCES: permission denied`
- **Solution:**
  - Run terminal as administrator
  - Check folder permissions
  - Ensure write access to extension directory

#### **Module Not Found**
- **Error:** `Cannot find module 'express'`
- **Solution:**
  ```bash
  npm install
  # or
  npm install express cors
  ```

### **Data Management Issues**

#### **Cannot Delete Stored Cookies**
- **Error:** DELETE request fails
- **Solution:**
  ```bash
  # Manual deletion
  rm data/cookies.json
  # or restart server
  ```

#### **Data Not Persisting**
- **Error:** Cookies disappear after server restart
- **Solution:**
  - Check `data/` directory exists
  - Verify file permissions
  - Check disk space

## Advanced Usage

### **Custom API Endpoints**
Add new routes in `server.js`:
```javascript
app.get('/custom-endpoint', (req, res) => {
  res.json({ message: 'Custom endpoint' });
});
```

### **Database Integration**
Replace file storage with database in `server.js`:
```javascript
// Example with SQLite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('cookies.db');
```

### **Authentication**
Add authentication middleware in `server.js`:
```javascript
app.use('/cookies', (req, res, next) => {
  // Add your auth logic here
  next();
});
```

## Security Considerations

### **Local Development Only**
- Server runs on localhost only
- No external network access
- No authentication required

### **Data Privacy**
- Cookies stored locally in JSON files
- No data sent to external servers
- Extension only accesses browser cookies

### **Production Deployment**
For production use, consider:
- Adding authentication
- Using HTTPS
- Implementing rate limiting
- Adding input validation
- Using a proper database

## Support

### **Common Commands**
```bash
# Start server
npm start

# Development mode
npm run dev

# Install dependencies
npm install

# Check server status
curl http://localhost:3000/health

# Clear stored data
curl -X DELETE http://localhost:3000/cookies
```

### **Logs and Debugging**
- **Server logs:** Check terminal output
- **Extension logs:** Open Chrome DevTools → Console
- **Network requests:** Chrome DevTools → Network tab

### **File Locations**
- **Extension data:** `data/cookies.json`
- **Server logs:** Terminal output
- **Extension logs:** Chrome DevTools

---

**Need help?** Check the troubleshooting section above or review the main README.md file for additional information. 