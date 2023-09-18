class EventEmitter {
  #listeners;

  constructor() {
    this.#listeners = {};
  }

  on(eventName, listener) {
    this.#listeners[eventName] = listener;
  }

  emit(eventName, ...args) {
    const listener = this.#listeners[eventName];
    if (listener) listener(...args);
  }
}
