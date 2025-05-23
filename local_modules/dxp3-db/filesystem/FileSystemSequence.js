const RecordFile = require('./RecordFile');
const Sequence = require('../Sequence');
const mutex = require('dxp3-mutex-inmemory');

const DATA_RECORD_LENGTH = 257;

class FileSystemSequence extends Sequence {
	constructor(_sourceFolder, _uuid, _name) {
		super(_uuid, _name);
		this._sourceFolder = _sourceFolder;
        this._dataFilePath = this._sourceFolder + this._uuid + '.def';
        this._dataFile = new RecordFile(this._dataFilePath, DATA_RECORD_LENGTH);
        this._readWriteLock = new mutex.ReadWriteLock({timeout:5000});
	}

	async init() {
		let exists = await this._dataFile.exists();
		await this._dataFile.open();
		if(!exists) {
			let record = {
				value:0
			}
			await this._dataFile.appendRecord(record);
		}
	}

	async close() {
		await this._dataFile.close();
	}

    async desc() {
        let result = '--- ' + this._name + ' ---\n';
        return result;
    }

    async nextValue() {
    	try {
	    	let writeLock = await this._readWriteLock.writeLock('key');
			let record = await this._dataFile.readRecord(0);
			record.value++;
			await this._dataFile.updateRecord(0, record);
			writeLock.release();
			let result = record.value;
	// console.log('result: ' + result);
			return result;
		} catch(_exception) {
			throw _exception;
		}

// 		}).then((result) => {
// console.log('arrived here: ' + result);
// 			return result;
// 		}).catch((_exception) => {
// console.log('error getting write lock');
// 			console.log(_exception);
// 		});
    }
}

module.exports = FileSystemSequence;