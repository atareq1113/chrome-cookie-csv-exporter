// Background script for managing content script injection

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Jancy extension installed/updated');
});

// Listen for tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only inject on complete page loads and for valid URLs
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    
    // Check if content script is already injected by trying to send a test message
    chrome.tabs.sendMessage(tabId, { action: 'ping' }).then(() => {
      console.log('Content script already exists on tab', tabId);
    }).catch(() => {
      // Content script doesn't exist, inject it
      console.log('Injecting content script on tab', tabId);
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['Jancy/content-script.js']
      }).catch(error => {
        console.log('Could not inject content script:', error.message);
      });
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectContentScript') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['Jancy/content-script.js']
        }).then(() => {
          sendResponse({ success: true });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab' });
      }
    });
    return true; // Keep message channel open
  }
}); 