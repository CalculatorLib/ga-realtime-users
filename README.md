# GA Realtime Users

A Chrome extension that helps you monitor multiple Google Analytics properties in real-time. Keep track of active users directly from your Chrome toolbar with live badge updates - no need to open Google Analytics!

![GA Realtime Users Badge](/screenshots/badge-preview.png)

## 🌟 Key Features

### Live Badge Counter
- **👀 Instant Visibility**: See total active users directly on the Chrome toolbar
- **🔄 Auto-Updates**: Badge refreshes every 10 seconds
- **🎯 At-a-Glance Monitoring**: No need to open tabs or dashboards
- **🔢 Aggregated Count**: Shows combined active users across all properties

### Additional Features
- 📊 Monitor multiple GA properties simultaneously
- 🔐 Secure Google OAuth authentication
- ⚡ Quick property addition and removal
- 📱 Clean, intuitive interface
- 🎨 Color-coded status indicators

![GA Realtime Users Screenshot](/screenshots/preview.png)

## How It Works

1. **Badge Updates**:
   - Extension icon shows the total number of active users
   - Updates automatically every 10 seconds
   - Blue badge indicates active monitoring
   - Red badge indicates connection issues

2. **Detailed View**:
   - Click the extension icon to see breakdown by property
   - Each property shows individual active user count
   - Easy toggle for properties you want to monitor

## Installation

1. Install from Chrome Web Store:
   - Visit [Chrome Web Store](https://chrome.google.com/webstore/category/extensions)
   - Search for "GA Realtime Users"
   - Click "Add to Chrome"

2. Manual Installation:
   ```bash
   # Clone this repository
   git clone https://github.com/calculatorlib/ga-realtime-users.git

   # Open Chrome
   # Go to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked"
   # Select the cloned directory
   ```

## Usage

1. Click the extension icon in your Chrome toolbar
2. Sign in with your Google account
3. Add your GA properties:
   - Enter property name (for your reference)
   - Enter GA property ID (format: 123456789)
4. Watch the badge update with your total active users!

## DISCLAIMER

By using this extension, you acknowledge that:

- This is an unofficial tool not affiliated with, endorsed, or sponsored by Google
- This Chrome extension is designed to monitor Google Analytics properties in real-time
- Data accuracy and availability depend on Google Analytics API status and your access permissions
- Users must comply with Google Analytics Terms of Service and applicable data protection regulations
- We do not store or process any analytics data; all data is fetched directly from Google Analytics API
- This extension requires Google Authentication solely for accessing your Google Analytics properties
- Service interruptions may occur due to API limitations or changes

## Privacy & Security

- 🔒 No analytics data is stored by the extension
- 🔑 Authentication handled securely through Google OAuth
- 👤 Only requests necessary Google Analytics access scopes
- 📡 No personal data collection or transmission
- 🕒 Real-time data fetched directly from GA API

## Development

```bash
# Clone repository
git clone https://github.com/calculatorlib/ga-realtime-users.git

# Install dependencies (if any)
npm install

# Build extension
npm run build

# Load unpacked extension in Chrome for testing
```

### Project Structure

```
ga-realtime-users/
├── manifest.json        # Extension configuration
├── popup.html          # Main extension interface
├── popup.js            # Popup functionality
├── background.js       # Background service worker
├── styles/            
│   └── popup.css       # Styles for popup
└── assets/
    └── icons/          # Extension icons
```

## Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## Support

- Report bugs by creating an issue
- Request features through issues
- Email support: support@calculatorlib.com

## License

This project is licensed under the MIT License.

## Authors

- **CalculatorLib** - *Initial work* - [CalculatorLib](https://calculatorlib.com)

## Acknowledgments

- Google Analytics API
- Chrome Extension developers
- All contributors

## Related

- [CalculatorLib Website](https://calculatorlib.com)

---
Made with ❤️ by [CalculatorLib](https://calculatorlib.com)