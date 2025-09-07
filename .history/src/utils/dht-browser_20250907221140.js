import { EventEmitter } from "events";

export class Client extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.destroyed = false;
    this.setMaxListeners(100);
  }

  destroy(cb) {
    if (this.destroyed) return;
    this.destroyed = true;
    if (cb) process.nextTick(cb);
    this.emit("destroyed");
  }

  lookup() {
    // Stub implementation
    process.nextTick(() => this.emit("peer"));
  }

  announce() {
    // Stub implementation
    process.nextTick(() => this.emit("announce"));
  }
}

export default { Client };
