# Download Troubleshooting Guide

## Common Download Issues and Solutions

### 1. **Download Shows "Searching for peers..." Forever**

**Cause**: The seeding device is offline or not reachable via DHT.

**Solutions**:
- Ensure the device that uploaded the file is still running the app and seeding
- Check that both devices have internet connectivity
- Wait 2-3 minutes for DHT peer discovery to complete
- Try downloading from a different network (mobile hotspot)

### 2. **Download Shows "No peers found"**

**Cause**: The original seeder is no longer available.

**Solutions**:
- Contact the file uploader to ensure they're still seeding
- The uploader should keep their app running to seed the file
- Check if the file was recently uploaded (older files may not be seeded)

### 3. **Download Starts but Never Progresses**

**Cause**: NAT/Firewall blocking P2P connections.

**Solutions**:
- Try connecting both devices to the same WiFi network
- Disable firewall temporarily for testing
- Use mobile hotspot for one device
- Check router settings for P2P/BitTorrent blocking

### 4. **Very Slow Download Speeds**

**Cause**: Limited peer connections or network issues.

**Solutions**:
- Ensure good internet connection on both devices
- Try downloading during different times of day
- Check if other network-intensive apps are running

## Testing P2P Connectivity

### Same Network Test:
1. Connect both devices to the same WiFi
2. Upload a file from Device A
3. Try downloading on Device B
4. This should work fastest as devices are on same network

### Internet Test:
1. Device A on WiFi, Device B on mobile data (or vice versa)
2. Upload from Device A
3. Download on Device B
4. This tests true P2P over internet

## DHT Bootstrap Nodes

The app uses these DHT bootstrap nodes for peer discovery:
- `router.bittorrent.com:6881`
- `dht.transmissionbt.com:6881`
- `router.utorrent.com:6881`

If these are blocked by your network, P2P discovery won't work.

## Debug Information

Check the console logs for:
- "Connected to peer: [IP]" - Shows successful peer connections
- "No peers found after 30s" - Indicates peer discovery issues
- "DHT announce completed" - Shows DHT is working

## Network Requirements

**For Uploaders (Seeders)**:
- Must keep the app running to seed files
- Need stable internet connection
- Should allow P2P traffic through firewall

**For Downloaders**:
- Need internet connectivity for DHT lookup
- Must be able to connect to peer IP addresses
- May need to allow P2P traffic through firewall

## Best Practices

1. **Keep Seeding**: After uploading, keep the app running to seed your files
2. **Test Locally First**: Try same-network transfers before internet transfers
3. **Check Connectivity**: Ensure both devices have good internet
4. **Be Patient**: DHT peer discovery can take 1-3 minutes
5. **Monitor Logs**: Check console for connection status

## Still Having Issues?

If downloads still don't work:

1. Check that the contract is properly deployed on Sepolia
2. Verify both devices can access the blockchain
3. Test with small files first (< 10MB)
4. Try different networks (WiFi vs mobile data)
5. Ensure no VPN is blocking P2P traffic

The P2P system requires both the uploader and downloader to be online and reachable for transfers to work.