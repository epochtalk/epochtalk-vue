const toBinary = string => {
  const codeUnits = new Uint16Array(string.length)
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i)
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer))
}

const fromBinary = binary => {
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer))
}

class LocalStorageCache {
  constructor (ttl, storageKey) {
    this.STORAGE_KEY = storageKey || 'app'
    if (ttl === void 0) { ttl = 0 }
    this.ttl = ttl
  }

  encode (storage) { return btoa(toBinary(JSON.stringify(storage))) }
  decode (storage) { return JSON.parse(fromBinary(atob(storage))) }

  get (k) {
    const encodedStore = localStorage.getItem(this.STORAGE_KEY)
    if (encodedStore) {
      let store = JSON.parse(fromBinary(atob(encodedStore)))
      if (k) return store[k]
      else return store
    }
  }


  set (k, v, ttl) {
    let timeToLive = ttl || this.ttl
    let now = Date.now()
    let store = this.get()
    let updatedStore = {
      ...store,
      [k]: {
        data: v,
        createdAt: now,
        expiresAt: timeToLive ? now + timeToLive : Infinity
      }
    }
    timeToLive && setTimeout(() => {
      let current = Date.now()
      let hasExpired = current >= updatedStore[k].expiresAt
      if (hasExpired) { this.delete(k) }
    }, timeToLive)
    localStorage.setItem(this.STORAGE_KEY, this.encode(updatedStore))
  }

  delete (k) {
    let store = this.get()
    delete store[k]
    localStorage.setItem(this.STORAGE_KEY, this.encode(store))
  }
}

export default (ttl, storageKey) => new LocalStorageCache(ttl, storageKey)
