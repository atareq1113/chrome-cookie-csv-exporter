// Cookie API Handler for Chrome Extension
// Handles sending cookie information via HTTP requests

class CookieAPI {
  constructor() {
    this.baseURL = 'http://localhost:3000'; // Default to local server
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Chrome-Extension-Cookie-Manager/1.0'
    };
  }

  /**
   * Set the base URL for API endpoints
   * @param {string} baseURL - The base URL for your API
   */
  setBaseURL(baseURL) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Prepare cookie data for API transmission
   * @param {Array} cookies - Array of cookie objects from chrome.cookies.getAll()
   * @returns {Object} Formatted cookie data
   */
  prepareCookieData(cookies) {
    return {
      timestamp: new Date().toISOString(),
      totalCookies: cookies.length,
      cookies: cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: cookie.expirationDate,
        sameSite: cookie.sameSite,
        storeId: cookie.storeId
      }))
    };
  }

  /**
   * Send cookies to a specific endpoint
   * @param {Array} cookies - Array of cookie objects
   * @param {string} endpoint - API endpoint (e.g., '/cookies', '/upload')
   * @param {Object} options - Additional options for the request
   * @returns {Promise} Response from the server
   */
  async sendCookies(cookies, endpoint = '/cookies', options = {}) {
    if (!this.baseURL) {
      throw new Error('Base URL not set. Call setBaseURL() first.');
    }

    // Validate cookies parameter
    if (!cookies || !Array.isArray(cookies)) {
      throw new Error('Invalid cookies parameter. Expected an array of cookie objects.');
    }

    const url = `${this.baseURL}${endpoint}`;
    const cookieData = this.prepareCookieData(cookies);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      body: JSON.stringify(cookieData)
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending cookies:', error);
      throw error;
    }
  }

  /**
   * Send filtered cookies based on search criteria
   * @param {Array} allCookies - All available cookies
   * @param {string} searchQuery - Search query for filtering
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response from the server
   */
  async sendFilteredCookies(allCookies, searchQuery, endpoint = '/cookies/filtered') {
    const filteredCookies = this.filterCookies(allCookies, searchQuery);
    return this.sendCookies(filteredCookies, endpoint, {
      headers: {
        'X-Search-Query': searchQuery,
        'X-Filtered-Count': filteredCookies.length.toString()
      }
    });
  }

  /**
   * Filter cookies based on search query (reusing logic from popup.js)
   * @param {Array} cookies - Array of cookie objects
   * @param {string} query - Search query
   * @returns {Array} Filtered cookies
   */
  filterCookies(cookies, query) {
    if (!query.trim()) {
      return cookies;
    }

    const terms = query.split(',').map(term => term.trim()).filter(Boolean);
    let includeTerms = [];
    let excludeTerms = [];

    if (terms.length > 0 && terms[0].startsWith('!')) {
      excludeTerms = terms.map((term, i) => i === 0 ? term.slice(1) : term);
    } else {
      includeTerms = terms.filter(term => !term.startsWith('!'));
      excludeTerms = terms.filter(term => term.startsWith('!')).map(term => term.slice(1));
    }

    return cookies.filter(cookie => {
      const name = cookie.name.toLowerCase();
      if (excludeTerms.some(term => name.includes(term))) return false;
      if (includeTerms.length > 0) {
        return includeTerms.some(term => name.includes(term));
      }
      return true;
    });
  }

  /**
   * Send a single cookie
   * @param {Object} cookie - Single cookie object
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response from the server
   */
  async sendSingleCookie(cookie, endpoint = '/cookie') {
    return this.sendCookies([cookie], endpoint);
  }

  /**
   * Test the API connection
   * @param {string} endpoint - Health check endpoint
   * @returns {Promise} Response from the server
   */
  async testConnection(endpoint = '/health') {
    if (!this.baseURL) {
      throw new Error('Base URL not set. Call setBaseURL() first.');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  /**
   * Delete all stored cookies from the API
   * @returns {Promise} Response from the server
   */
  async deleteStoredCookies() {
    if (!this.baseURL) {
      throw new Error('Base URL not set. Call setBaseURL() first.');
    }

    const url = `${this.baseURL}/cookies`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.defaultHeaders
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting stored cookies:', error);
      throw error;
    }
  }

  /**
   * Get cookies and send them to API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise} Response from the server
   */
  async getAllAndSend(endpoint = '/cookies', options = {}) {
    return new Promise((resolve, reject) => {
      chrome.cookies.getAll({}, (cookies) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        this.sendCookies(cookies, endpoint, options)
          .then(resolve)
          .catch(reject);
      });
    });
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieAPI;
} 