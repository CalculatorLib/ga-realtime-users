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

### Install from Chrome Web Store (Recommended)

[![Available in the Chrome Web Store](/assets/images/ChromeWebStore_BadgeWBorder_v2_340x96.png)](https://chrome.google.com/webstore/detail/ga-realtime-users/fkmcjfffffjdihogfglmhappkejkccnc)

You can also use this direct link: [GA Realtime Users](https://chrome.google.com/webstore/detail/ga-realtime-users/fkmcjfffffjdihogfglmhappkejkccnc)

### Manual Installation
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

# Load unpacked extension in Chrome for testing
```

### Icon Generation
If you're modifying the extension icon, you can generate all required sizes from the SVG file using ImageMagick:

```bash
# Install ImageMagick (if not installed)
# On Ubuntu/Debian
sudo apt-get install imagemagick

# On macOS using Homebrew
brew install imagemagick

# On Windows using Chocolatey
choco install imagemagick

# Generate icons
for size in 16 32 48 128; do
  convert -background none icon.svg -resize ${size}x${size} icon${size}.png
done
```

This will generate the following files:
- `icon16.png` - For extension favicon and small icons
- `icon32.png` - For slightly larger icons
- `icon48.png` - For the extensions management page
- `icon128.png` - For the Chrome Web Store and installation

### Project Structure
```
ga-realtime-users/
├── manifest.json        # Extension configuration
├── popup.html          # Main extension interface
├── popup.js            # Popup functionality
├── background.js       # Background service worker
├── styles/            
│   └── popup.css       # Styles for popup
├── icons/
│   ├── icon.svg        # Source SVG icon
│   ├── icon16.png      # Generated icons
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── assets/
    └── images/         # Other images
```

### Icon Requirements
- Format: SVG (source) and PNG (generated)
- Dimensions: 16x16, 32x32, 48x48, and 128x128 pixels
- Background: Transparent
- Style: Simple and recognizable at small sizes

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