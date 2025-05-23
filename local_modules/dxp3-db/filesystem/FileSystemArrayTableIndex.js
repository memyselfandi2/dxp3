/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * Database
 */
const path = require('path');
const packageName = 'dxp3-db';
const moduleName = 'filesystem' + path.sep + 'FileSystemArrayTableIndex';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/filesystem/FileSystemBPlusTreeIndex
 */
const ColumnType = require('../ColumnType');
const DatabaseError = require('../DatabaseError');
const FileSystemBPlusTreeTableIndex = require('./FileSystemBPlusTreeTableIndex');
// The recordfile contains the persisted b+tree index.
const RecordFile = require('./RecordFile');
const TableIndex = require('../TableIndex');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

// The number of bytes of each record in the index file.
const RECORD_LENGTH = 257;
// The number of values in each node of the b+tree index.
const B_TREE_ORDER = 3;

/**
 * @class FileSystemArrayTableIndex
 * @extends dxp3-db.FileSystemBPlusTreeTableIndex
 */
class FileSystemArrayTableIndex extends FileSystemBPlusTreeTableIndex {
    /**
     * @constructor
     * @param {string} _sourceFolder - The folder where the index file is/will be stored.
     * @param {string} _uuid - The unique identifier of this index.
     * @param {string} _name - The name of this index.
     * @param {Table} _table - The table that we are indexing.
     * @param {string} _columnUUID - The unique identifier of the column that we are indexing.
     * @param {RecordFile} _dataFile - The file that we are indexing.
     */
	constructor(_sourceFolder, _uuid, _name, _table, _columnUUID, _dataFile) {
		super(_sourceFolder, _uuid, _name, _table, _columnUUID, _dataFile);
        this.setType('array b+tree index');
		// Each array that is inserted ends up in multiple b+trees.
		// There is one b+tree that uses the serialized array as a key.
		this._arraysRootNodeAddress = null;
        // We treat null and undefined values differently.
        // They will have their own b+trees in our file.
        this._nullArrayRootNodeAddress = null;
        this._undefinedArrayRootNodeAddress = null;
    	// Based on the type of array we get the base column type.
    	// For a Array<String> the base column type is String.
    	// For a Array<Date> the base column type is Date.
    	this._baseColumnType = this._columnType.getBaseColumnType();
	}

    async _deleteNullArray(_dataFileRecordIndex) {
        logger.trace('_deleteNullArray(...): start.');
        let { node: addressesNode, nodeAddress: addressesNodeAddress } = await super._findLeafNode(this._nullArrayRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let addressIndex = addressesNode.values.indexOf(_dataFileRecordIndex);
        if(addressIndex < 0) {
            logger.trace('_deleteNullArray(...): end.');
            return;
        }
        addressesNode.values.splice(addressIndex, 1);
        addressesNode.addresses.splice(addressIndex, 1);
        if (addressesNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await super._redistributeOrMergeLeafNode(addressesNode, addressesNodeAddress);
        } else {
            await super._writeNode(addressesNode, addressesNodeAddress);
        }
        logger.trace('_deleteNullArray(...): end.');
    }

    async _deleteUndefinedArray(_dataFileRecordIndex) {
        logger.trace('_deleteUndefinedArray(...): start.');
        let { node: addressesNode, nodeAddress: addressesNodeAddress } = await super._findLeafNode(this._undefinedArrayRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let addressIndex = addressesNode.values.indexOf(_dataFileRecordIndex);
        if(addressIndex < 0) {
            logger.trace('_deleteUndefinedArray(...): end.');
            return;
        }
        addressesNode.values.splice(addressIndex, 1);
        addressesNode.addresses.splice(addressIndex, 1);
        if (addressesNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await super._redistributeOrMergeLeafNode(addressesNode, addressesNodeAddress);
        } else {
            await super._writeNode(addressesNode, addressesNodeAddress);
        }
        logger.trace('_deleteUndefinedArray(...): end.');
    }

    async _equalToNullArray() {
        logger.trace('_equalToNullArray(): start.');
        let result = [];
        let leafNode = await super._findLeftMostLeafNode(this._nullArrayRootNodeAddress);
        while(leafNode != null) {
            for(let addressIndex = 0;addressIndex < leafNode.addresses.length;addressIndex++) {
                const dataFileRecordIndex = leafNode.addresses[addressIndex];
                const record = await this._dataFile.readRecord(dataFileRecordIndex);
                result.push(record);
            }
            let leafNodeAddress = leafNode.nextLeaf;
            if(leafNodeAddress === undefined || leafNodeAddress === null) {
                leafNode = null;
            } else {
                leafNode = await this._readNode(leafNodeAddress);
            }
        }
        logger.trace('_equalToNullArray(): end.');
        return result;
    }

    async _unequalToNullArray() {
        logger.trace('_unequalToNullArray(): start.');
        let result = [];
        let currentNode = await this._findLeftMostLeafNode(this._arraysRootNodeAddress);
        while (currentNode) {
            for (let i = 0; i < currentNode.addresses.length; i++) {
                let addressesRootNodeAddress = currentNode.addresses[i];
                let leafNode = await this._findLeftMostLeafNode(addressesRootNodeAddress);
                while(leafNode != null) {
                    for(let addressIndex = 0;addressIndex < leafNode.addresses.length;addressIndex++) {
                        const dataFileRecordIndex = leafNode.addresses[addressIndex];
                        const record = await this._dataFile.readRecord(dataFileRecordIndex);
                        result.push(record);
                    }
                    let leafNodeAddress = leafNode.nextLeaf;
                    if(leafNodeAddress === undefined || leafNodeAddress === null) {
                        leafNode = null;
                    } else {
                        leafNode = await this._readNode(leafNodeAddress);
                    }
                }
            }
            let currentNodeAddress = currentNode.nextLeaf;
            if(currentNodeAddress === undefined || currentNodeAddress === null) {
                currentNode = null;
            } else {   
                currentNode = await this._readNode(currentNodeAddress);
            }
        }
        logger.trace('_unequalToNullArray(): end.');
        return result;
    }

    async _unequalToUndefinedArray() {
        logger.trace('_unequalToUndefinedArray(): start.');
        let result = [];
        // Get all the records that are null.
        const nullResult = await this._equalToNullArray();
        // Get all the other records that have a value.
        const valueResult = await this._unequalToNullArray();
        // Combine the results.
        result.push(...nullResult);
        result.push(...valueResult);
        logger.trace('_unequalToUndefined(): end.');
        return result;
    }

    async  _equalToUndefinedArray() {
        logger.trace('_equalToUndefinedArray(): start.');
        let result = [];
        let leafNode = await super._findLeftMostLeafNode(this._undefinedArrayRootNodeAddress);
        while(leafNode != null) {
            for(let addressIndex = 0;addressIndex < leafNode.addresses.length;addressIndex++) {
                const dataFileRecordIndex = leafNode.addresses[addressIndex];
                const record = await this._dataFile.readRecord(dataFileRecordIndex);
                result.push(record);
            }
            let leafNodeAddress = leafNode.nextLeaf;
            if(leafNodeAddress === undefined || leafNodeAddress === null) {
                leafNode = null;
            } else {
                leafNode = await this._readNode(leafNodeAddress);
            }
        }
        logger.trace('_equalToUndefinedArray(): end.');
        return result;
    }

    async _insertNullArray(_dataFileRecordIndex) {
        const {node: addressesNode, nodeAddress: addressesNodeAddress} = await super._findLeafNode(this._nullArrayRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let numberOfAddresses = addressesNode.values.length;
        let addressIndex = 0;
        // We iterate over all the values.
        while (addressIndex < numberOfAddresses) {
            let addressAtIndex = addressesNode.values[addressIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            if(_dataFileRecordIndex < addressAtIndex) {
                break;
            } else {
                addressIndex++;
            }
        }
        addressesNode.values.splice(addressIndex, 0, _dataFileRecordIndex);
        addressesNode.addresses.splice(addressIndex, 0, _dataFileRecordIndex);
        // Next we check if the node is full and needs to be split.
        if(addressesNode.values.length > B_TREE_ORDER) {
            await super._splitLeafNode(addressesNode, addressesNodeAddress, ColumnType.INTEGER)
        } else {
            await super._writeNode(addressesNode, addressesNodeAddress);
        }
    }

    async _insertUndefinedArray(_dataFileRecordIndex) {
        const {node: addressesNode, nodeAddress: addressesNodeAddress} = await super._findLeafNode(this._undefinedArrayRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let numberOfAddresses = addressesNode.values.length;
        let addressIndex = 0;
        // We iterate over all the values.
        while (addressIndex < numberOfAddresses) {
            let addressAtIndex = addressesNode.values[addressIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            if(_dataFileRecordIndex < addressAtIndex) {
                break;
            } else {
                addressIndex++;
            }
        }
        addressesNode.values.splice(addressIndex, 0, _dataFileRecordIndex);
        addressesNode.addresses.splice(addressIndex, 0, _dataFileRecordIndex);
        // Next we check if the node is full and needs to be split.
        if(addressesNode.values.length > B_TREE_ORDER) {
            await super._splitLeafNode(addressesNode, addressesNodeAddress, ColumnType.INTEGER)
        } else {
            await super._writeNode(addressesNode, addressesNodeAddress);
        }
    }

    async _refresh() {
		this._arraysRootNodeAddress = await super._createRootNode();
    	this._nullArrayRootNodeAddress = await super._createRootNode();
    	this._undefinedArrayRootNodeAddress = await super._createRootNode();
    	// Based on the type of array we get the base column type.
    	// For a Array<String> the base column type is String.
    	// For a Array<Date> the base column type is Date.
    	this._baseColumnType = this._columnType.getBaseColumnType();
    }

    _readFromHeader(_headerRecord) {
        this._arraysRootNodeAddress = _headerRecord.arraysRootNodeAddress;
        this._nullArrayRootNodeAddress = _headerRecord.nullArrayRootNodeAddress;
        this._undefinedArrayRootNodeAddress = _headerRecord.undefinedArrayRootNodeAddress;
    }

    _writeToHeader(_headerRecord) {
    	_headerRecord.arraysRootNodeAddress = this._arraysRootNodeAddress;
        _headerRecord.undefinedArrayRootNodeAddress = this._undefinedArrayRootNodeAddress;
        _headerRecord.nullArrayRootNodeAddress = this._nullArrayRootNodeAddress;
        return _headerRecord;
    }

    async delete(_value, _dataFileRecordIndex) {
        logger.trace('delete(): start.');
        if(_value === undefined) {
            await this._deleteUndefinedArray(_dataFileRecordIndex);
            logger.trace('delete(): end.');
            return;
        }
        if(_value === null) {
            await this._deleteNullArray(_dataFileRecordIndex);
            logger.trace('delete(): end.');
            return;
        }
        for(let i=0;i < _value.length;i++) {
        	let valueAtIndex = _value[i];
        	await super._delete(valueAtIndex, _dataFileRecordIndex, this._rootNodeAddress, this._baseColumnType);
        }
        let key = _value.join();
        await super._delete(key, _dataFileRecordIndex, this._arraysRootNodeAddress, ColumnType.STRING);
        logger.trace('delete(): end.');
	}

    async unequal(_value) {
        logger.trace('unequal(): start.');
        let result = [];
        if(_value === undefined) {
            result = await this._unequalToUndefinedArray();
            logger.trace('unequal(): end.');
            return result;
        }
        if(_value === null) {
            result = await this._unequalToNullArray();
            logger.trace('unequal(): end.');
            return result;
        }
        let key = _value.join();
        // Get all the records that are less than the value.
        const lessThanResult = await this._less(key, this._arraysRootNodeAddress, ColumnType.STRING);
        // Get all the records that are greater than the value.
        const greaterThanResult = await this._greater(key, this._arraysRootNodeAddress, ColumnType.STRING);
        // Combine the results.
        result.push(...lessThanResult);
        result.push(...greaterThanResult);
        logger.trace('unequal(): end.');
        return result;
    }

	async equal(_value) {
        logger.trace('equal(...): start.');
        let result = [];
        if(_value === undefined) {
            result = await this._equalToUndefinedArray();
            logger.trace('equal(...): end.');
            return result;
        }
        if(_value === null) {
            result = await this._equalToNullArray();
            logger.trace('equal(...): end.');
            return result;
        }
        let key = _value.join();
        result = await super._equal(key, this._arraysRootNodeAddress, ColumnType.STRING);
        logger.trace('equal(...): end.');
        return result;
    }

    async includes(_value) {
        logger.trace('includes(...): start.');
        logger.debug('includes(...): _value is \'' + _value + '\'.');
        let result = null;
        result = await super._equal(_value, this._rootNodeAddress, this._baseColumnType);
        logger.trace('includes(...): end.');
        return result;        
    }

	async insert(_value, _dataFileRecordIndex) {
        logger.trace('insert(): start.');
        if(_value === undefined) {
            await this._insertUndefinedArray(_dataFileRecordIndex);
            logger.trace('insert(): end.');
            return;
        }
        if(_value === null) {
            await this._insertNullArray(_dataFileRecordIndex);
            logger.trace('insert(): end.');
            return;
        }
        for(let i=0;i < _value.length;i++) {
        	let valueAtIndex = _value[i];
        	await super._insert(valueAtIndex, _dataFileRecordIndex, this._rootNodeAddress, this._baseColumnType);
        }
        let key = _value.join();
		await super._insert(key, _dataFileRecordIndex, this._arraysRootNodeAddress, ColumnType.STRING);
	}
}
module.exports = FileSystemArrayTableIndex;