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
  constructor () {
    this.STORAGE_KEY = 'swrv'
  }

  encode (storage) { return btoa(toBinary(JSON.stringify(storage))) }
  decode (storage) { return JSON.parse(fromBinary(atob(storage))) }

  get (k) {
    const item = localStorage.getItem(this.STORAGE_KEY)
    if (item) {
      return JSON.parse(fromBinary(atob(item)))[k]
    }
  }

  set (k, v) {
    let payload = {}
    const storage = localStorage.getItem(this.STORAGE_KEY)
    if (storage) {
      payload = this.decode(storage)
      payload[k] = { data: v, ttl: Date.now() }
    } else {
      payload = { [k]: { data: v, ttl: Date.now() } }
    }

    localStorage.setItem(this.STORAGE_KEY, this.encode(payload))
  }
}

export default new LocalStorageCache();
