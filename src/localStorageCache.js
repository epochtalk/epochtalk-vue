function toBinary(string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}

function fromBinary(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

class LocalStorageCache {
  constructor (ttl) {
    this.STORAGE_KEY = 'swrv'
    if (ttl === void 0) { ttl = 0 }
    this.ttl = ttl
  }

  encode (storage) { return btoa(toBinary(JSON.stringify(storage))) }
  decode (storage) { return JSON.parse(fromBinary(atob(storage))) }

  get (k) {
    const item = localStorage.getItem(this.STORAGE_KEY)
    if (item) {
      return JSON.parse(fromBinary(atob(item)))[k]
    }
  }

  set (k, v, ttl) {
    let timeToLive = ttl || this.ttl
    let now = Date.now()
    let payload = {
      [k]: {
        data: v,
        createdAt: now,
        expiresAt: timeToLive ? now + timeToLive : Infinity
      }
    }
    timeToLive && setTimeout(function() {
      let current = Date.now()
      let hasExpired = current >= payload[k].expiresAt;
      if (hasExpired) { this.delete(k) }
    }, timeToLive)
    localStorage.setItem(this.STORAGE_KEY, this.encode(payload))
  }

  delete (k) {
    localStorage.removeItem(k);
  }
}

export default new LocalStorageCache();
