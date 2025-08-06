// Jancy functionality for displaying profiles in a dialog box
// Prevent class re-declaration
if (typeof window.JancyManager === 'undefined') {
  class JancyManager {
    constructor() {
      this.dialog = null;
      this.init();
    }

    init() {
      // Initialize Jancy functionality
      console.log('Jancy Manager initialized');
    }

    // Create and show the dialog box
    showProfilesDialog() {
      // Remove existing dialog if present
      if (this.dialog) {
        document.body.removeChild(this.dialog);
      }

      // Create dialog container
      this.dialog = document.createElement('div');
      this.dialog.id = 'jancy-dialog';
      this.dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;

      // Create dialog content
      const dialogContent = document.createElement('div');
      dialogContent.style.cssText = `
        background-color: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        position: relative;
      `;

      // Add header
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      `;
      
      const title = document.createElement('h2');
      title.textContent = 'Jancy Profiles';
      title.style.margin = '0';
      
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
      `;
      closeButton.onmouseover = () => closeButton.style.backgroundColor = '#f0f0f0';
      closeButton.onmouseout = () => closeButton.style.backgroundColor = 'transparent';
      closeButton.onclick = () => this.hideDialog();

      header.appendChild(title);
      header.appendChild(closeButton);

      // Add content area
      const content = document.createElement('div');
      content.id = 'jancy-content';
      content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">👤</div>
          <h3 style="margin: 0 0 10px 0; color: #333;">Jancy Profiles</h3>
          <p style="margin: 0; color: #666;">Loading profile information...</p>
          <div style="margin-top: 20px;">
            <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
        </div>
      `;

      // Add styles for loading animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;

      dialogContent.appendChild(style);
      dialogContent.appendChild(header);
      dialogContent.appendChild(content);
      this.dialog.appendChild(dialogContent);

      // Add click outside to close
      this.dialog.addEventListener('click', (e) => {
        if (e.target === this.dialog) {
          this.hideDialog();
        }
      });

      // Add to page
      document.body.appendChild(this.dialog);

      // Load profile data
      this.loadProfiles();
    }

    // Hide the dialog
    hideDialog() {
      if (this.dialog) {
        document.body.removeChild(this.dialog);
        this.dialog = null;
      }
    }

    // Load profiles from API (placeholder for now)
    async loadProfiles() {
      try {
        // TODO: Replace with actual API call
        // For now, we'll simulate loading with sample data
        await this.simulateApiCall();
        
        const content = document.getElementById('jancy-content');
        if (content) {
          content.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <h3 style="margin: 0 0 20px 0; color: #333;">Sample Profiles</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <strong>Profile 1:</strong> John Doe - Developer
              </div>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <strong>Profile 2:</strong> Jane Smith - Designer
              </div>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                <strong>Profile 3:</strong> Bob Johnson - Manager
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                API integration coming soon...
              </p>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error loading profiles:', error);
        const content = document.getElementById('jancy-content');
        if (content) {
          content.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c;">
              <h3>Error Loading Profiles</h3>
              <p>Unable to load profile information at this time.</p>
            </div>
          `;
        }
      }
    }

    // Simulate API call (placeholder)
    simulateApiCall() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1500); // Simulate 1.5 second delay
      });
    }
  }

  // Export for use in other files
  window.JancyManager = JancyManager;
} else {
  console.log('Jancy: JancyManager class already exists, skipping re-declaration');
} 