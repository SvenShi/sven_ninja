const __cache = new Map();

const cache = {
  set(key, value) {
    __cache.set(key, value)
  },
  delete(key) {
    __cache.delete(key)
  },
  setExpire(key, value, time) {
    let that = this
    this.set(key, value)
    setTimeout(() => {
      that.delete(key)
    }, time)
  },
  hasKey(key) {
    return __cache.has(key)
  },
  get(key) {
    return __cache.get(key)
  }
}

module.exports = cache
