# Save Tab Cookies as CSV - Chrome Extension

## Overview
This Chrome extension allows you to view, search, filter, and download cookies from your browser in CSV format. You can:
- View all cookies in a sortable, filterable table (powered by [Tabulator](http://tabulator.info/)).
- Search for cookies by name (supports multiple names and exclusions).
- Download all visible (filtered) cookies as a CSV file.

## Features
- **Table View:** All cookies are displayed in a table with columns for name, value, domain, path, secure, HTTP only, expiration date, and same site.
- **Search & Filter:**
  - Type in the search box to filter cookies by name (case-insensitive, partial match).
  - Use multiple comma-separated terms to match any (e.g., `foo,bar` matches cookies with `foo` or `bar` in the name).
  - Use `!` at the start to exclude cookies (e.g., `!foo,bar` excludes cookies with `foo` or `bar` in the name).
  - Mix include and exclude (e.g., `foo,!bar` includes cookies with `foo` but not `bar`).
- **Download:**
  - The main "Save Cookies as CSV" button downloads only the cookies currently visible in the table (after filtering).

## Installation
1. Download or clone this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the extension folder.
5. The extension icon will appear in your toolbar.

## Usage
1. Click the extension icon to open the popup.
2. Use the search box to filter cookies by name. Use commas to separate multiple terms. Use `!` at the start to exclude terms.
   - Examples:
     - `session` — shows cookies with `session` in the name.
     - `foo,bar` — shows cookies with `foo` or `bar` in the name.
     - `!foo,bar` — excludes cookies with `foo` or `bar` in the name.
     - `foo,!bar` — includes cookies with `foo` but not `bar`.
3. Click **Save Cookies as CSV** to download all currently visible cookies as a CSV file.

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

## Credits
- Table UI powered by [Tabulator](http://tabulator.info/).

## Notes
- The extension can only access cookies your browser allows for extensions (some may be restricted for security/privacy).
- Filtering and download features work entirely client-side; no data is sent anywhere.
