const DEFAULT_TIMEOUT = -1;
const DEFAULT_MAXIMUM_NUMBER_OF_LOCKS = 1024;

class DeferredPromise {
    constructor() {
        this.resolve = null;
        this.reject = null;

        this._promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        }).catch((_exception) => {
        });
        this._promise.resolve = this.resolve;
        this._promise.reject = this.reject;
        return this._promise;
    }
}

class ReadLock {
    constructor(_parent, _id) {
        this._promise = new DeferredPromise();
        this._parent = _parent;
        this._id = _id;
    }

    release() {
        this._promise.resolve();
        this._parent.readLockReleased(this._id);
    }

    timeout() {
        this._promise.reject('Timed out');
        this._parent.readLockReleased(this._id);
    }
}

class WriteLock {
    constructor(_parent, _id) {
        this._promise = new DeferredPromise();
        this._parent = _parent;
        this._id = _id;
    }

    release() {
        this._promise.resolve();
        this._parent.writeLockReleased(this._id);
    }

    timeout() {
        this._promise.reject('Timed out');
        this._parent.writeLockReleased(this._id);
    }
}

class Lock {
    constructor(_timeout, _maximumNumberOfLocks) {
        this._id = 0;
        this._timeout = _timeout;
        this._maximumNumberOfLocks = _maximumNumberOfLocks;
        this._readLocksMap = new Map();
        this._writeLocksMap = new Map();
        this._numberOfLocks = 0;
    }

    async read(_timeout) {
        if(this._numberOfLocks >= this._maximumNumberOfLocks) {
            throw new Error("Maximum number of locks reached.");
        }
        // Every new read lock needs to wait until every previous
        // write lock has been released.
        // We use Promise.allSettled(...) and supply an array of
        // write lock promises.
        let writeLocksArray = [];
        if(this._writeLocksMap.size > 0) {
            for(let [_id, writeLock] of this._writeLocksMap) {
                writeLocksArray.push(writeLock._promise);
            }
        }
        // Create the read lock.
        // It needs an ID so it can let us know when it has been released by
        // calling readLockReleased with the same ID.
        let readLockId = this._getLockId();
        let readLock = new ReadLock(this, readLockId);
        // Add it to our known list of read locks.
        this._readLocksMap.set(readLockId, readLock);
        this._numberOfLocks++;
        // Check if there is a need for a timeout.
        _timeout = _timeout || this._timeout;
        if(_timeout > 0) {
            try {
                let timeoutPromise = this._getTimeoutPromise(_timeout);
                await Promise.race([Promise.allSettled(writeLocksArray),timeoutPromise]);
                return readLock;
            } catch(_exception) {
                readLock.timeout();
                throw _exception;
            }
        } else {
            await Promise.allSettled(writeLocksArray);
            return readLock;
        }
    }

    async write(_timeout) {
        if(this._numberOfLocks >= this._maximumNumberOfLocks) {
            throw new Error("Maximum number of locks reached.");
        }
        // Every new write lock needs to wait until every previous
        // read and write lock has been released.
        // We use Promise.allSettled(...) and supply an array of
        // read and write lock promises.
        let locksArray = [];
        if((this._readLocksMap.size > 0) || (this._writeLocksMap.size > 0)) {
            for(let [_id, readLock] of this._readLocksMap) {
                locksArray.push(readLock._promise);
            }
            for(let [_id, writeLock] of this._writeLocksMap) {
                locksArray.push(writeLock._promise);
            }
        }
        // Create the write lock.
        // It needs an ID so it can let us know when it has been released by
        // calling writeLockReleased with the same ID.
        let writeLockId = this._getLockId();
        let writeLock = new WriteLock(this, writeLockId);
        this._writeLocksMap.set(writeLockId, writeLock);
        this._numberOfLocks++;
        // Check if there is a need for a timeout.
        _timeout = _timeout || this._timeout;
        if(_timeout > 0) {
            try {
                let timeoutPromise = this._getTimeoutPromise(_timeout);
                await Promise.race([Promise.allSettled(locksArray),timeoutPromise]);
                return writeLock;
            } catch(_exception) {
                writeLock.timeout();
                throw _exception;
            }
        } else {
            await Promise.allSettled(locksArray);
            return writeLock;
        }
    }

    readLockReleased(_id) {
        if(this._readLocksMap.delete(_id)) {
            this._numberOfLocks--;
        }
    }

    writeLockReleased(_id) {
        if(this._writeLocksMap.delete(_id)) {
            this._numberOfLocks--;
        }
    }

    _getLockId() {
        this._id++;
        // Lets start reusing the id when we've reached
        // a million lock requests.
        if(this._id > 1000000) {
            this._id = 0;
        }
        return this._id;
    }

    _getTimeoutPromise(_timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(()=>{reject(new Error('Timed out.'));},_timeout);
        });
    }
}

class ReadWriteLock {

    constructor(_options) {
        this._locksMap = new Map();
        this.setOptions(_options);
    }

    setOptions(_options) {
        this._options = _options || {};
        this._options.timeout = this._options.timeout || DEFAULT_TIMEOUT;
        this._options.maximumNumberOfLocks = this._options.maximumNumberOfLocks || DEFAULT_MAXIMUM_NUMBER_OF_LOCKS;
    }

    async readLock(_key, _options) {
        if(_key === undefined || _key === null) {
            _key = '';
        }
        _options = _options || {};
        let timeout = _options.timeout || this._options.timeout;
        let lock = this._locksMap.get(_key);
        if(lock === undefined || lock === null) {
            lock = new Lock(this._options.timeout, this._options.maximumNumberOfLocks);
            this._locksMap.set(_key, lock);
        }
        let result = await lock.read(timeout);
        return result;
    }

    async writeLock(_key, _options) {
        if(_key === undefined || _key === null) {
            _key = '';
        }
        _options = _options || {};
        let timeout = _options.timeout || this._options.timeout;
        let lock = this._locksMap.get(_key);
        if(lock === undefined || lock === null) {
            lock = new Lock(this._options.timeout, this._options.maximumNumberOfLocks);
            this._locksMap.set(_key, lock);
        }
        let result = await lock.write(timeout);
        return result;
    }
}

module.exports = ReadWriteLock;