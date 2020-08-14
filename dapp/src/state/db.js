import { readable, writable } from "svelte/store";

class DB {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  get(key, fallback) {
    const value = this.storage.getItem(key);
    // getItem returns null if the key doesn't exist.
    return value === null ? fallback : JSON.parse(value);
  }

  set(key, valueOrFunction, fallback) {
    let value;
    if (valueOrFunction instanceof Function) {
      const prev = this.get(key, fallback);
      value = valueOrFunction(prev);
    } else {
      value = valueOrFunction;
    }
    this.storage.setItem(key, JSON.stringify(value));
    return value;
  }

  remove(key) {
    this.storage.removeItem(key);
  }

  clear(key) {
    this.storage.clear();
  }

  has(key) {
    return this.storage[key] !== undefined;
  }

  getsert(key, valueOrFunction) {
    if (!this.has(key)) {
      this.set(key, valueOrFunction);
    }
    return this.get(key);
  }

  writable(key, valueOrFunction) {
    const value = writable(this.getsert(key, valueOrFunction));
    value.subscribe(current => {
      this.set(key, current);
    });
    return value;
  }
}

export default new DB();
