// Content script for Jancy functionality
// This script will be injected into web pages to handle the dialog display

// Prevent multiple injections by checking if variables already exist
if (typeof window.jancyContentScriptInitialized === 'undefined') {
  window.jancyContentScriptInitialized = true;
  
  let jancyManager = null;
  let scriptInjected = false;
  let isInitialized = false;

  // Initialize Jancy functionality when the script loads
  function initJancy() {
    // Only initialize once
    if (isInitialized) return;
    
    // Check if we're on a valid page
    if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:' || window.location.protocol === 'file:') {
      console.log('Jancy: Cannot initialize on this page type');
      return;
    }
    
    try {
      // Check if JancyManager already exists
      if (window.JancyManager) {
        console.log('Jancy: JancyManager already exists, initializing directly');
        jancyManager = new window.JancyManager();
        isInitialized = true;
        return;
      }
      
      // Prevent multiple script injections
      if (scriptInjected) {
        console.log('Jancy: Script already injected, waiting for initialization');
        return;
      }
      
      scriptInjected = true;
      
      // Create and inject the Jancy script
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('Jancy/jancy.js');
      script.onload = () => {
        try {
          // Initialize the Jancy manager
          if (window.JancyManager) {
            jancyManager = new window.JancyManager();
            isInitialized = true;
            console.log('Jancy content script initialized');
          } else {
            console.error('Jancy: JancyManager class not found');
            scriptInjected = false; // Reset flag if failed
          }
        } catch (error) {
          console.error('Jancy: Error initializing JancyManager:', error);
          scriptInjected = false; // Reset flag if failed
        }
      };
      script.onerror = () => {
        console.error('Jancy: Failed to load jancy.js');
        scriptInjected = false; // Reset flag if failed
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Jancy: Error setting up script injection:', error);
      scriptInjected = false; // Reset flag if failed
    }
  }

  // Listen for messages from the popup or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Jancy: Received message:', request);
    
    if (request.action === 'ping') {
      // Respond to ping to confirm content script is loaded
      sendResponse({ success: true, message: 'Jancy content script is ready' });
      return;
    }
    
    if (request.action === 'showJancyProfiles') {
      try {
        if (jancyManager && isInitialized) {
          jancyManager.showProfilesDialog();
          sendResponse({ success: true });
        } else {
          // Try to initialize if not already done
          initJancy();
          
          // Wait a bit and try again
          setTimeout(() => {
            if (jancyManager && isInitialized) {
              jancyManager.showProfilesDialog();
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: 'Jancy manager not initialized' });
            }
          }, 500);
        }
      } catch (error) {
        console.error('Jancy: Error showing profiles dialog:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Keep the message channel open for async response
    }
  });

  // Initialize when the page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJancy);
  } else {
    initJancy();
  }

  // Also initialize immediately for faster response
  initJancy();
  
  console.log('Jancy: Content script loaded successfully');
} else {
  console.log('Jancy: Content script already initialized, skipping');
} 