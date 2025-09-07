// Simple DHT stub for browser environment
export class Client {
  constructor() {
    this.destroyed = false;
  }

  destroy(cb) {
    this.destroyed = true;
    if (cb) cb();
  }

  on() {}
  once() {}
  removeListener() {}
  lookup() {}
  announce() {}
}

export default { Client };
