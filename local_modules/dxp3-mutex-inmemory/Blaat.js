DEFAULT_TIMEOUT = -1;

class Mutex {

    constructor(_timeout) {
        this._timeout = _timeout || DEFAULT_TIMEOUT;
        this.currentPromise = Promise.resolve();
        this._readers = 0;
        this.isReading = true;
    }

    get readers() {
        return this._readers;
    }

    set readers(_readers) {
        this._readers = _readers;
        console.log('Number of readers: ' + this._readers);
    }

    readLock() {
        // Keep handing out read locks until someone wants to write.
        if(this.isReading) {
            let nextPromiseResolve;
            let nextPromise = new Promise(resolve => {
                nextPromiseResolve = () => {
                    this.readers--;
                    resolve();
                }
            });
            this.readers++;
            return nextPromiseResolve;
        }
        // Apparently someone wants to write.
        // We need to queue up our read locks until the write lock resolves.
        let nextPromiseResolve;
        let nextPromise = new Promise(resolve => {
            nextPromiseResolve = () => resolve();
        });
        // Caller gets a promise that resolves when the current outstanding
        // lock resolves
        let successCallback = () => {return nextPromiseResolve};
        let currentPromiseResolve = this.currentPromise.then(successCallback);
        // Don't allow the next request until the new promise is done
        this.currentPromise = nextPromise;
        // Return the new promise
        if(this._timeout > 0) {
            let timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(()=>{reject(new Error('Timed out.'));},this._timeout);
            });
            currentPromiseResolve = Promise.race([currentPromiseResolve,timeoutPromise]);
        }
        return currentPromiseResolve;
    }

    writeLock() {
        let nextPromiseResolve;
        let nextPromiseReject;
        let nextPromise = new Promise(resolve => {
            nextPromiseResolve = () => resolve();
        }, reject => {
            nextPromiseReject = (_error) => reject(_error);
        }
        );
        let blaat = function() {
            nextPromiseReject(new Error('Timed out.'));
        }
        setTimeout(blaat,this._timeout);

        // Caller gets a promise that resolves when the current outstanding
        // lock resolves
        let successCallback = () => {return nextPromiseResolve};
        let currentPromiseResolve = this.currentPromise.then(successCallback);
        // Don't allow the next request until the new promise is done
        this.currentPromise = nextPromise;
        // Return the new promise
        // if(this._timeout > 0) {
        //     let timeoutPromise = new Promise((resolve, reject) => {
        //         setTimeout(()=>{reject(new Error('Timed out.'));},this._timeout);
        //     });
        //     currentPromiseResolve = Promise.race([currentPromiseResolve,timeoutPromise]);
        // }
        return currentPromiseResolve;
    };
}

class ReadWriteLock {
    constructor(_timeout) {
        this._timeout = _timeout || DEFAULT_TIMEOUT;
        this.locks = new Map();
    }

    async readLock(_key) {
        let mutex = this.locks.get(_key);
        if(mutex === undefined || mutex === null) {
            mutex = new Mutex(this._timeout);
            this.locks.set(_key, mutex);
        }
        return mutex.readLock();
    }

    async writeLock(_key) {
        let mutex = this.locks.get(_key);
        if(mutex === undefined || mutex === null) {
            mutex = new Mutex(this._timeout);
            this.locks.set(_key, mutex);
        }
        return mutex.writeLock();
    }
}
const rand = max => Math.floor(Math.random() * max);

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve, ms, value));

const readWriteLock = new ReadWriteLock(500);

function go(name) {
    (async () => {
        console.log(name + " random initial delay");
        await delay(rand(1000));
        try {
            console.log(name + " requesting lock");
            const release = await readWriteLock.writeLock('henk');
            console.log(name + " got lock");
            await delay(rand(1000));
            console.log(name + " releasing lock");
            release();
        } catch(_exception) {
            console.log(name + ' maybe a timeout:' + _exception);
        }
    })();
}
go("A");
go("B");
go("C");
go("D");