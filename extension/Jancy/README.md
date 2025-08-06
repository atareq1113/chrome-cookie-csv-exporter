# Jancy Profiles - Chrome Extension Feature

## Overview
The Jancy feature adds the ability to view profile information from external APIs in a modal dialog box within web pages.

## Features
- **Modal Dialog**: Displays profile information in a clean, modern dialog box
- **API Integration Ready**: Framework prepared for external API integration
- **Responsive Design**: Dialog adapts to different screen sizes
- **Loading States**: Shows loading animation while fetching data
- **Error Handling**: Graceful error handling for failed API calls

## Files
- `jancy.js` - Main Jancy functionality and dialog management
- `content-script.js` - Content script for injecting Jancy into web pages
- `README.md` - This documentation file

## Usage
1. Click the extension icon to open the popup
2. Click "View Jancy Profiles" button
3. The dialog will appear on the current web page
4. Click outside the dialog or the × button to close

## Technical Details
- Uses Chrome Extension Manifest V3
- Content script injection for web page integration
- Message passing between popup and content script
- Modular design for easy API integration

## Future Enhancements
- Real API integration for profile data
- Profile search and filtering
- Profile editing capabilities
- Export profile data
- Customizable dialog themes

## API Integration
To integrate with a real API, modify the `loadProfiles()` method in `jancy.js`:

```javascript
async loadProfiles() {
  try {
    const response = await fetch('YOUR_API_ENDPOINT');
    const profiles = await response.json();
    // Update the dialog content with real data
  } catch (error) {
    // Handle error
  }
}
``` 