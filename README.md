# WebTorrent P2P Share App

A React-based Electron application for peer-to-peer file sharing using WebTorrent.

## Features

- Peer-to-peer file sharing
- WebRTC support
- Cross-platform (Windows, macOS, Linux)
- Modern React UI
- Electron desktop app

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd WebTorrent
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Production Mode
To run the app in production mode (built version):
```bash
npm start
```

### Development Mode
To run the app in development mode with hot reload:
```bash
npm run electron-dev
```

### Build Only
To build the React app:
```bash
npm run build
```

### Run Electron Only
To run Electron with the built app:
```bash
npm run electron
```

## Available Scripts

- `npm start` - Build and run the app in production mode
- `npm run dev` - Start Vite development server
- `npm run build` - Build the React app for production
- `npm run electron` - Run Electron with the built app
- `npm run electron-dev` - Run in development mode with hot reload
- `npm run electron-build` - Build the Electron app for distribution
- `npm run dist` - Create distributable packages

## Project Structure

```
WebTorrent/
├── electron/           # Electron main process files
│   ├── main.js        # Main Electron process
│   └── preload.js     # Preload script
├── src/               # React application source
│   ├── components/    # React components
│   ├── utils/         # Utility functions
│   └── ...
├── public/            # Static assets
├── dist/              # Built React app
└── package.json       # Project configuration
```

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed: `npm install`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check that you're in the correct directory (WebTorrent folder)
4. Ensure Node.js version is 16 or higher

## License

ISC
