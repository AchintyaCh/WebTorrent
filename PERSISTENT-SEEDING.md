# Persistent Seeding Feature

## Overview

The P2P Blockchain File Sharing app now supports **persistent seeding**, which means your shared files continue to be seeded (available for download by others) even after you close and reopen the application.

## How It Works

### When You Share a File

1. **Upload Process**: When you upload a file to the blockchain marketplace, the app creates a torrent and starts seeding it immediately.

2. **Persistence Storage**: The torrent information is automatically saved to a persistent storage file located at:
   - **Windows**: `C:\Users\[YourUsername]\.p2p-blockchain-app\persistent-torrents.json`
   - **macOS**: `/Users/[YourUsername]/.p2p-blockchain-app/persistent-torrents.json`
   - **Linux**: `/home/[YourUsername]/.p2p-blockchain-app/persistent-torrents.json`

3. **Seeding Notification**: You'll see a success message indicating that your file is now seeding and will continue seeding after app restart.

### When You Restart the App

1. **Automatic Restoration**: When you start the app, it automatically reads the persistent torrents file and restores all previously seeded files.

2. **Background Seeding**: Restored torrents begin seeding in the background, making your files available to the P2P network.

3. **Status Updates**: You'll see a notification showing how many files were restored from the previous session.

## Benefits

### For File Sharers
- **Reliability**: Your files remain available to others even if you restart your computer
- **Network Health**: Contributes to a more robust P2P network
- **Automatic Management**: No manual intervention required

### For File Downloaders
- **Better Availability**: Higher chance of finding seeders for files
- **Faster Downloads**: More seeders typically mean faster download speeds
- **Network Resilience**: Files don't disappear when original uploader goes offline temporarily

## Visual Indicators

### In the Torrents Tab
- **🌱 Seeding**: Green indicator for files you're actively seeding
- **⬇️ Downloading**: Orange indicator for files you're downloading
- **Seeding Stats**: Shows how many files you're currently seeding vs. total shared

### Status Messages
- **Upload Success**: "🌱 [filename] is now seeding and will continue seeding even after app restart!"
- **Restoration**: "🔄 Restoring X seeding files from previous session: [filenames]"

## Managing Seeded Files

### Viewing Active Seeds
1. Go to the **Torrents** tab
2. See all currently seeding files with their status
3. View upload speeds, peer connections, and file sizes

### Stopping Seeding
1. In the **Torrents** tab, find the file you want to stop seeding
2. Click the **"Stop Seeding"** button
3. The file will be removed from both active torrents and persistent storage

### Storage Location
The persistent torrents file contains:
- Torrent metadata (name, size, hash)
- Magnet links for restoration
- Timestamps for tracking
- File structure information

## Technical Details

### Persistence Mechanism
- **Storage Format**: JSON file with torrent metadata
- **Update Frequency**: Activity timestamps updated every minute
- **Restoration Process**: Automatic on app startup using magnet links
- **Cleanup**: Removed torrents are automatically cleaned from persistent storage

### Network Compatibility
- **Tracker Support**: Uses multiple reliable trackers for better connectivity
- **DHT Integration**: Distributed Hash Table for decentralized peer discovery
- **NAT Traversal**: Enhanced settings for cross-network connections

## Troubleshooting

### If Files Don't Restore
1. Check if the persistent torrents file exists in your user directory
2. Ensure the original files haven't been moved or deleted
3. Check network connectivity and firewall settings
4. Try restarting the app

### If Seeding Performance Is Poor
1. Check your internet connection and upload bandwidth
2. Ensure UPnP is enabled on your router
3. Consider port forwarding for better connectivity
4. Try connecting to the same network as downloaders when possible

## Privacy and Security

### Data Stored
- Only torrent metadata is stored persistently
- No personal information or file contents are saved
- Magnet links contain only cryptographic hashes

### Network Exposure
- Your IP address is visible to peers (standard P2P behavior)
- Consider using a VPN if privacy is a concern
- Files are shared using cryptographic verification

## Best Practices

1. **Keep Original Files**: Don't delete or move files you're seeding
2. **Stable Connection**: Maintain a reliable internet connection for best seeding performance
3. **Regular Monitoring**: Check the Torrents tab occasionally to monitor seeding status
4. **Network Optimization**: Enable UPnP on your router for better peer connectivity

## Future Enhancements

- **Bandwidth Limiting**: Control upload/download speeds
- **Scheduling**: Set specific times for seeding activity
- **Statistics**: Detailed analytics on seeding performance
- **Selective Seeding**: Choose which files to seed persistently