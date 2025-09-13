# Downloads Folder

This folder contains the WebTorrent application files for different operating systems:

## File Structure
- `WebTorrent-Setup.exe` - Windows installer (Windows 10/11)
- `WebTorrent.dmg` - macOS disk image (macOS 10.15+)
- `webtorrent.deb` - Ubuntu/Debian package (Ubuntu 18.04+, Debian 10+)

## Instructions
1. Add your compiled application files to this folder
2. Ensure the filenames match exactly what's defined in the DownloadPage component
3. The download page will automatically serve these files based on user's OS detection

## File Naming Convention
- Windows: `WebTorrent-Setup.exe`
- macOS: `WebTorrent.dmg`
- Linux: `webtorrent.deb`

## Notes
- Files should be properly signed for their respective platforms
- Consider adding version numbers to filenames if needed
- Update the DownloadPage component if you change filenames