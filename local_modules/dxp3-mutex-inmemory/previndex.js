class Lock {
	constructor() {
		this.readers = 0;
		this.queue = [];
	}
}

class Mutex {

	readLock(key, callback, options) {
		let lock;
		if (typeof key !== 'function') {
			lock = Mutex.locksByKey.get(key);
			if (lock === undefined || lock === null) {
				lock = new Lock();
				Mutex.locksByKey.set(key, lock);
			}
		} else {
			callback = arguments[0];
			options = arguments[1];
			lock = Mutex.defaultLock;
		}
		if (!options) {
			options = {};
		}
		let scope = null;
		if (options.hasOwnProperty('scope')) {
			scope = options.scope;
		}
		let release = (function () {
			let released = false;
			return function () {
				if (!released) {
					released = true;
					lock.readers--;
					if (lock.queue.length) {
						lock.queue[0]();
					}
				}
			};
		}());
		if ((lock.readers < 0) || lock.queue.length) {
			let terminated = false;
			lock.queue.push(function () {
				if (!terminated && (lock.readers >= 0)) {
					terminated = true;
					lock.queue.shift();
					lock.readers++;
					callback.call(scope, release);
					if (lock.queue.length) {
						lock.queue[0]();
					}
				}
			});
			if (options.hasOwnProperty('timeout')) {
				let timeoutCallback = null;
				if (options.hasOwnProperty('timeoutCallback')) {s
					timeoutCallback = options.timeoutCallback;
				}
				setTimeout(function () {
					if (!terminated) {
						terminated = true;
						lock.queue.shift();
						if (timeoutCallback) {
							timeoutCallback.call(options.scope);
						}
					}
				}, options.timeout);
			}
		} else {
			lock.readers++;
			callback.call(options.scope, release);
		}
	}

	writeLock(key, callback, options) {
		let lock;
		if (typeof key !== 'function') {
			lock = Mutex.locksByKey.get(key);
			if (lock === undefined || lock === null) {
				lock = new Lock();
				Mutex.locksByKey.set(key, lock);
			}
		} else {
			options = callback;
			callback = key;
			lock = defaultLock;
		}
		if (!options) {
			options = {};
		}
		let scope = null;
		if (options.hasOwnProperty('scope')) {
			scope = options.scope;
		}
		let release = (function () {
			let released = false;
			return function () {
				if (!released) {
					released = true;
					lock.readers = 0;
					if (lock.queue.length) {
						lock.queue[0]();
					}
				}
			};
		}());
		if (lock.readers || lock.queue.length) {
			let terminated = false;
			lock.queue.push(function () {
				if (!terminated && !lock.readers) {
					terminated = true;
					lock.queue.shift();
					lock.readers = -1;
					callback.call(options.scope, release);
				}
			});
			if (options.hasOwnProperty('timeout')) {
				let timeoutCallback = null;
				if (options.hasOwnProperty('timeoutCallback')) {
					timeoutCallback = options.timeoutCallback;
				}
				setTimeout(function () {
					if (!terminated) {
						terminated = true;
						lock.queue.shift();
						if (timeoutCallback) {
							timeoutCallback.call(scope);
						}
					}
				}, options.timeout);
			}
		} else {
			lock.readers = -1;
			callback.call(options.scope, release);
		}
	}
}
Mutex.defaultLock = new Lock();
Mutex.locksByKey = new Map();

module.exports = Mutex;