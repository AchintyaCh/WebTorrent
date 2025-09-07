import WebTorrent from "webtorrent";
import { Client as DHT } from "./dht-browser";

class DesktopWebTorrent extends WebTorrent {
  constructor(opts = {}) {
    const options = {
      ...opts,
      dht: false, // Disable built-in DHT
    };
    super(options);
    this._dht = null;
  }

  async init() {
    try {
      // Create and initialize DHT
      this._dht = new DHT();

      // Add DHT to client options
      this.client = {
        ...this.client,
        dht: this._dht,
      };

      // Initialize DHT
      await new Promise((resolve, reject) => {
        this._dht.listen(20000, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return this;
    } catch (err) {
      console.error("DHT initialization failed:", err);
      throw err;
    }
  }

  destroy(cb) {
    if (this._dht) {
      this._dht.destroy();
      this._dht = null;
    }
    super.destroy(cb);
  }
}

export default DesktopWebTorrent;
