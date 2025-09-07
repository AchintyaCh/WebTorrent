import { EventEmitter } from "events";

export class Client extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.destroyed = false;
    this.listening = false;
    this.port = opts.port || 20000;
    this.setMaxListeners(100);
  }

  listen(port, callback) {
    if (this.listening) return;
    this.listening = true;
    this.port = port;
    process.nextTick(() => {
      this.emit("listening");
      if (callback) callback(null);
    });
  }

  destroy(cb) {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listening = false;
    process.nextTick(() => {
      this.emit("destroyed");
      if (cb) cb();
    });
  }

  lookup() {
    if (!this.listening) return;
    process.nextTick(() => this.emit("peer"));
  }

  announce() {
    if (!this.listening) return;
    process.nextTick(() => this.emit("announced"));
  }
}

export default { Client };
