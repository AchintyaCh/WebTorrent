# P2P File Share - React WebTorrent Application

A modern React application for peer-to-peer file sharing using WebTorrent technology. This application allows users to share files across firewalls and NATs using the standard torrent protocol.

## Features

- 🌊 **WebTorrent Mode**: Cross-firewall P2P file sharing
- 📁 **File Sharing**: Create and share torrents from local files
- 🔗 **Magnet Links**: Join existing torrents using magnet links
- 📊 **Real-time Stats**: Monitor download/upload speeds and peer connections
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Modern UI**: Beautiful gradient design with smooth animations.

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **WebTorrent** - JavaScript torrent client
- **React Router** - Client-side routing
- **CSS3** - Modern styling with gradients and animations

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd p2p-react-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Home Page
- Navigate to the home page to see available sharing modes
- Click on "WebTorrent Mode" to start file sharing

### WebTorrent Page:

#### Sharing Files
1. Click "Choose Files" to select files from your computer
2. Click "Create & Share Torrent" to generate a magnet link
3. Share the magnet link with others to allow them to download your files

#### Joining Torrents
1. Paste a magnet link in the input field
2. Click "Add Torrent" to start downloading
3. Monitor progress in the "Downloading Torrents" section
4. Files will automatically download when the torrent completes

#### Network Statistics
- **Connected Peers**: Number of active peer connections
- **Download Speed**: Current download speed
- **Upload Speed**: Current upload speed
- **Active Torrents**: Number of torrents being managed

## File Structure

```
src/
├── components/
│   ├── HomePage.jsx          # Landing page with mode selection
│   ├── HomePage.css          # Styles for home page
│   ├── WebTorrentPage.jsx    # Main WebTorrent functionality
│   └── WebTorrentPage.css    # Styles for WebTorrent page
├── App.jsx                   # Main app component with routing
├── App.css                   # Global styles
└── main.jsx                  # Application entry point
```

## Key Features

### WebTorrent Integration
- Full WebTorrent client functionality
- Automatic file downloading when torrents complete
- Real-time progress tracking
- Peer connection management

### User Interface
- Modern gradient design
- Responsive layout for all devices
- Real-time notifications
- Progress bars and statistics

### File Management
- Multiple file selection
- Automatic torrent creation
- Magnet link generation
- File download management

## Browser Compatibility

This application works in modern browsers that support:
- ES6+ JavaScript
- WebRTC (for peer connections)
- File API
- Blob URLs

## Security Notes

- Files are shared directly between peers using WebRTC
- No files are stored on any server
- All communication is peer-to-peer
- Magnet links contain file hashes for verification

## Troubleshooting

### Common Issues

1. **Torrent not connecting**: Check if your firewall is blocking WebRTC connections
2. **Slow download speeds**: This depends on the number of available peers
3. **Files not downloading**: Ensure the torrent has completed downloading

### Browser Support
- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Limited support (may have issues with WebRTC)
- Edge: Full support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
