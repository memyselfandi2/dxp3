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
const moduleName = 'filesystem' + path.sep + 'FileSystemBPlusTreeTableIndex';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/filesystem/FileSystemBPlusTreeIndex
 */
const ColumnType = require('../ColumnType');
const DatabaseError = require('../DatabaseError');
// The recordfile contains the persisted b+tree index.
const RecordFile = require('./RecordFile');
const TableIndex = require('../TableIndex');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

// The number of bytes of each record in the index file.
const RECORD_LENGTH = 512;
// The number of values in each node of the b+tree index.
const B_TREE_ORDER = 3;

/**
 * @class FileSystemBPlusTreeIndex
 * @extends sql.SQLTableIndex
 */
class FileSystemBPlusTreeTableIndex extends TableIndex {

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
		super(_uuid, _name, _table.getUUID(), _columnUUID, 'b+tree index');
        this._sourceFolder = _sourceFolder;
        if(!this._sourceFolder.endsWith(path.sep)) {
            this._sourceFolder += path.sep;
        }
        // The folder and file name (path) of the b+tree index file.
        this._dataIndexPath = this._sourceFolder + this._uuid + '.ndx';
        // The persisted b+tree index file.
        this._dataIndexFile = new RecordFile(this._dataIndexPath, RECORD_LENGTH);
        // Which table are we indexing?
        this._table = _table;
        // Which column are we indexing?
        let column = this._table.getColumnByUUID(this._columnUUID);
        // What is the date type of the column?
        // This is an instance of dxp3-db/ColumnType.
        // This is used to compare values.
        // A dxp3-db/ColumnType has a compare(value1, value2) method.
        this._columnType = column.getType();
        this._columnName = column.getName();
		// The file that we are indexing.
        // Each leafnode in this B+Tree will contain the column value
        // and the index/address of the actual record persisted in this data file.
        this._dataFile = _dataFile;
		// The address of the root node/root record.
        this._rootNodeAddress = null;
        // We treat null and undefined values differently.
        // They will have their own b+trees in our file.
        this._nullRootNodeAddress = null;
        this._undefinedRootNodeAddress = null;
	}

    async _deleteNull(_dataFileRecordIndex) {
        logger.trace('_deleteNull(...): start.');
        let { node: addressesNode, nodeAddress: addressesNodeAddress } = await this._findLeafNode(this._nullRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let addressIndex = addressesNode.values.indexOf(_dataFileRecordIndex);
        if(addressIndex < 0) {
            logger.trace('_deleteNull(...): end.');
            return;
        }
        addressesNode.values.splice(addressIndex, 1);
        addressesNode.addresses.splice(addressIndex, 1);
        if (addressesNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await this._redistributeOrMergeLeafNode(addressesNode, addressesNodeAddress);
        } else {
            await this._writeNode(addressesNode, addressesNodeAddress);
        }
        logger.trace('_deleteNull(...): end.');
    }

    async _deleteUndefined(_dataFileRecordIndex) {
        logger.trace('_deleteUndefined(...): start.');
        let { node: addressesNode, nodeAddress: addressesNodeAddress } = await this._findLeafNode(this._undefinedRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let addressIndex = addressesNode.values.indexOf(_dataFileRecordIndex);
        if(addressIndex < 0) {
            logger.trace('_deleteUndefined(...): end.');
            return;
        }
        addressesNode.values.splice(addressIndex, 1);
        addressesNode.addresses.splice(addressIndex, 1);
        if (addressesNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await this._redistributeOrMergeLeafNode(addressesNode, addressesNodeAddress);
        } else {
            await this._writeNode(addressesNode, addressesNodeAddress);
        }
        logger.trace('_deleteUndefined(...): end.');
    }

    async _equalToNull() {
        logger.trace('_equalToNull(): start.');
        let result = [];
        let leafNode = await this._findLeftMostLeafNode(this._nullRootNodeAddress);
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
        logger.trace('_equalToNull(): end.');
        return result;
    }

    async  _equalToUndefined() {
        logger.trace('_equalToUndefined(): start.');
        let result = [];
        let leafNode = await this._findLeftMostLeafNode(this._undefinedRootNodeAddress);
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
        logger.trace('_equalToUndefined(): end.');
        return result;
    }

    async _insertNull(_dataFileRecordIndex) {
        const {node: addressesNode, nodeAddress: addressesNodeAddress} = await this._findLeafNode(this._nullRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
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
            await this._splitLeafNode(addressesNode, addressesNodeAddress, ColumnType.INTEGER)
        } else {
            await this._writeNode(addressesNode, addressesNodeAddress);
        }
    }

    async _insertUndefined(_dataFileRecordIndex) {
        const {node: addressesNode, nodeAddress: addressesNodeAddress} = await this._findLeafNode(this._undefinedRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
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
            await this._splitLeafNode(addressesNode, addressesNodeAddress, ColumnType.INTEGER)
        } else {
            await this._writeNode(addressesNode, addressesNodeAddress);
        }
    }

    async _unequalToNull() {
        logger.trace('_unequalToNull(): start.');
        let result = [];
        let currentNode = await this._findLeftMostLeafNode(this._rootNodeAddress);
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
        logger.trace('_unequalToNull(): end.');
        return result;
    }

    async _unequalToUndefined() {
        logger.trace('_unequalToUndefined(): start.');
        let result = [];
        // Get all the records that are null.
        const nullResult = await this._equalToNull();
        // Get all the other records that have a value.
        const valueResult = await this._unequalToNull();
        // Combine the results.
        result.push(...nullResult);
        result.push(...valueResult);
        logger.trace('_unequalToUndefined(): end.');
        return result;
    }

	async init() {
        logger.trace('init(): start.');
		// Before we call open we check if the file exists.
        logger.debug('init(): Check if index file \'' + this._dataIndexPath + '\' exists.');
		let exists = await this._dataIndexFile.exists();
		// Calling open will create the file if it does not exist.
		await this._dataIndexFile.open();
		// If the file did NOT exist before we opened it, we need to refresh the index.
		if(!exists) {
            logger.debug('init(): Index file \'' + this._dataIndexPath + '\' does NOT exist.');
            // Truncate the file, create a root node and write the header record.
			await this.refresh();
		} else {
            logger.debug('init(): Index file \'' + this._dataIndexPath + '\' exists.');
			// read the header and get the addresses of all the different roots.
            // This can go wrong, so lets catch any errors.
            try {
                await this._readHeader();
            } catch(_exception) {
                logger.error('init(): Error while reading the header: ' + _exception);
            }
		}
        logger.trace('init(): end.');
    }

    async close() {
        logger.trace('close(): start.');
        await this._dataIndexFile.close();
        logger.trace('close(): end.');
    }

	async _readHeader() {
        logger.trace('_readHeader(): start.');
		// The header is the first record in the index file.
        let headerRecord = await this._dataIndexFile.readRecord(0);
		if(headerRecord === undefined || headerRecord === null) {
			// This should not happen...log an error.
			logger.error('_readHeader(): headerRecord is undefined or null.');
            logger.trace('_readHeader(): end.');
            throw Error('Header record is undefined or null.');
		}
        this._rootNodeAddress = headerRecord.rootNodeAddress;
        this._nullRootNodeAddress = headerRecord.nullRootNodeAddress;
        this._undefinedRootNodeAddress = headerRecord.undefinedRootNodeAddress;
        this._readFromHeader(headerRecord);
        logger.trace('_readHeader(): end.');
    }

    _readFromHeader(_headerRecord) {
    }

    async _writeHeader() {
        let headerRecord = {
            tableUUID: this._tableUUID,
            columnUUID: this._columnUUID,
            rootNodeAddress: this._rootNodeAddress,
            undefinedRootNodeAddress: this._undefinedRootNodeAddress,
            nullRootNodeAddress: this._nullRootNodeAddress
        };
        headerRecord = this._writeToHeader(headerRecord);
        await this._dataIndexFile.updateRecord(0, headerRecord);
    }

    _writeToHeader(_headerRecord) {
        return _headerRecord;
    }

	async equal(_value) {
        logger.trace('equal(): start.');
        logger.debug('equal(...): _value is \'' + _value + '\'.');
        let result = [];
        if(_value === undefined) {
            result = await this._equalToUndefined();
            logger.trace('equal(): end.');
            return result;
        }
        if(_value === null) {
            result = await this._equalToNull();
            logger.trace('equal(): end.');
            return result;
        }
        result = await this._equal(_value, this._rootNodeAddress, this._columnType);
        return result;
    }

    async _equal(_value, _rootNodeAddress, _columnType) {
        const result = [];
        let {node: currentNode} = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let numberOfValues = currentNode.values.length;
        let valueIndex = 0;
        // We iterate over all the values.
        while (valueIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[valueIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = _columnType.compare(valueAtIndex, _value);
            if(comparison < 0) {
                valueIndex++;
            } else if(comparison === 0) {
                let addressesRootNodeAddress = currentNode.addresses[valueIndex];
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
                break;
            } else {
                break;
            }
        }
        logger.trace('equal(): end.');
        return result;
    }

	async equalColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async greater(_value) {
        logger.trace('greater(...): start.');
        let result = [];
        result = await this._greater(_value, this._rootNodeAddress, this._columnType);
        logger.trace('greater(...): end.');
        return result;
    }

    async _greater(_value, _rootNodeAddress, _columnType) {        
        const result = [];
        let leafNodeDetails = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let currentNode = leafNodeDetails.node;
        let numberOfValues = currentNode.values.length;
        let startIndex = 0;
        // We iterate over all the values.
        while (startIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[startIndex];
            // We stop when we find the one that is greater than the given value.
            let comparison = _columnType.compare(valueAtIndex, _value);
            if(comparison <= 0) {
                startIndex++;
            } else {
                break;
            }
        }
        while (currentNode) {
            for (let i = startIndex; i < currentNode.addresses.length; i++) {
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
            currentNode = await this._readNode(currentNode.nextLeaf);
            if(currentNode != null) {
                startIndex = 0; // Reset the start index for next node.
            }
        }
        return result;
    }
    
	async greaterColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async greaterOrEqual(_value) {
        logger.trace('greaterOrEqual(...): start.');
        let result = [];
        result = await this._greaterOrEqual(_value, this._rootNodeAddress, this._columnType);
        logger.trace('greaterOrEqual(...): end.');
        return result;
    }

    async _greaterOrEqual(_value, _rootNodeAddress, _columnType) {
        const result = [];
        let leafNodeDetails = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let currentNode = leafNodeDetails.node;
        let numberOfValues = currentNode.values.length;
        let startIndex = 0;
        // We iterate over all the values.
        while (startIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[startIndex];
            // We stop when we find the one that is greater than the given value.
            let comparison = _columnType.compare(valueAtIndex, _value);
            if(comparison < 0) {
                startIndex++;
            } else {
                break;
            }
        }
        while (currentNode) {
            for (let i = startIndex; i < currentNode.addresses.length; i++) {
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
            currentNode = await this._readNode(currentNode.nextLeaf);
            if(currentNode != null) {
                startIndex = 0; // Reset the start index for next node.
            }
        }
        logger.trace('greaterOrEqual(): end.');
        return result;
    }

	async greaterOrEqualColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async in(_values) {
        logger.trace('in(): start.');
        const result = [];
        for(let i = 0; i < _values.length;i++){
            result.push(...await this.equal(_values[i]));
        }
        logger.trace('in(): end.');
        return result;
    }

    async contains(_value) {
        return this.includes(_value);
    }

    async has(_value) {
        return this.includes(_value);
    }

    async includes(_value) {
        logger.trace('includes(): start.');
        let result = [];
        if(_value === undefined) {
            result = await this._equalToUndefined();
            logger.trace('includes(): end.');
            return result;
        }
        if(_value === null) {
            result = await this._equalToNull();
            logger.trace('includes(): end.');
            return result;
        }
        let {node: currentNode} = await this._findLeafNode(this._rootNodeAddress, _value, this._columnType);
        let numberOfValues = currentNode.values.length;
        let valueIndex = 0;
        // We iterate over all the values.
        while (valueIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[valueIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = this._columnType.compare(valueAtIndex, _value);
            if(comparison < 0) {
                valueIndex++;
            } else if(comparison === 0) {
                let addressesRootNodeAddress = currentNode.addresses[valueIndex];
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
                break;
            } else {
                break;
            }
        }
        logger.trace('includes(): end.');
        return result;        
    }

    async between(_value1, _value2) {
        logger.trace('between(...): start.');
        let result = [];
        result = await this._between(_value1, _value2, this._rootNodeAddress, this._columnType);
        logger.trace('between(...): end.');
        return result;
    }

    async _between(_value1, _value2, _rootNodeAddress, _columnType) {
        const result = [];
        const startLeafDetails = await this._findLeafNode(_rootNodeAddress, _value1, _columnType);
        const endLeafDetails = await this._findLeafNode(_rootNodeAddress, _value2, _columnType);
        let startNode = startLeafDetails.node;
        let endNode = endLeafDetails.node;
        let numberOfStartNodeValues = startNode.values.length;
        let startIndex = 0;
        // We iterate over all the start node values.
        while (startIndex < numberOfStartNodeValues) {
            let valueAtIndex = startNode.values[startIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = _columnType.compare(valueAtIndex, _value1);
            if(comparison < 0) {
                startIndex++;
            } else {
                break;
            }
        }
        let numberOfEndNodeValues = endNode.values.length;
        let endIndex = 0;
        // We iterate over all the end node values.
        while (endIndex < numberOfEndNodeValues) {
            let valueAtIndex = endNode.values[endIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = _columnType.compare(valueAtIndex, _value2);
            if(comparison <= 0) {
                endIndex++;
            } else {
                break;
            }
        }
        let start = 0;
        let end = 0;
        let currentNode = startNode;
        let done = false;
        while (currentNode && !done) {
            if(currentNode._index === startNode._index) {
                start = startIndex;
            } else {
                start = 0;
            }
            if(currentNode._index === endNode._index) {
                end = endIndex;
                done = true;
            } else {
                end = currentNode.values.length;
            }
            for (let i = start; i < end; i++) {
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
            currentNode = await this._readNode(currentNode.nextLeaf);
        }
        logger.trace('between(): end.');
        return result;
    }

	async less(_value) {
        logger.trace('less(): start.');
        let result = null;
        result = await this._less(_value, this._rootNodeAddress, this._columnType);
        logger.trace('less(...): end.');
        return result;
    }

    async _less(_value, _rootNodeAddress, _columnType) {
        const result = [];
        let leafNodeDetails = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let currentNode = leafNodeDetails.node;
        let numberOfValues = currentNode.values.length;
        let endIndex = 0;
        // We iterate over all the values.
        while (endIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[endIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = _columnType.compare(valueAtIndex, _value);
            if(comparison < 0) {
                endIndex++;
            } else {
                break;
            }
        }
        while (currentNode) {
            for (let i = 0; i < endIndex; i++) {
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
            currentNode = await this._readNode(currentNode.previousLeaf);
            if(currentNode != null) {
                endIndex = currentNode.values.length; // Reset the start index for next node.
            }
        }
        logger.trace('less(): end.');
        return result;
    }

	async lessColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async lessOrEqual(_value) {
        logger.trace('lessOrEqual(): start.');
        let result = null;
        result = await this._lessOrEqual(_value, this._rootNodeAddress, this._columnType);
        logger.trace('lessOrEqual(...): end.');
        return result;
    }

    async _lessOrEqual(_value, _rootNodeAddress, _columnType) {
        const result = [];
        let leafNodeDetails = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let currentNode = leafNodeDetails.node;
        let numberOfValues = currentNode.values.length;
        let endIndex = 0;
        // We iterate over all the values.
        while (endIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[endIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = _columnType.compare(valueAtIndex, _value);
            if(comparison <= 0) {
                endIndex++;
            } else {
                break;
            }
        }
        while (currentNode) {
            for (let i = 0; i < endIndex; i++) {
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
            currentNode = await this._readNode(currentNode.previousLeaf);
            if(currentNode != null) {
                endIndex = currentNode.values.length; // Reset the start index for next node.
            }
        }
        logger.trace('lessOrEqual(): end.');
        return result;
    }

	async lessOrEqualColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async like(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async delete(_value, _dataFileRecordIndex) {
        logger.trace('delete(...): start.');
        if(_value === undefined) {
            await this._deleteUndefined(_dataFileRecordIndex);
            logger.trace('delete(...): end.');
            return;
        }
        if(_value === null) {
            await this._deleteNull(_dataFileRecordIndex);
            logger.trace('delete(...): end.');
            return;
        }
        await this._delete(_value, _dataFileRecordIndex, this._rootNodeAddress, this._columnType);
    }

    async _delete(_value, _dataFileRecordIndex, _rootNodeAddress, _columnType) {
        let { node: currentNode, nodeAddress: currentNodeAddress } = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let deletionIndex = currentNode.values.indexOf(_value);
        if (deletionIndex < 0) {
            logger.trace('delete(...): end.');
            return;
        }
        let addressesRootNodeAddress = currentNode.addresses[deletionIndex];
        let { node: addressesNode, nodeAddress: addressesNodeAddress } = await this._findLeafNode(addressesRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
        let addressIndex = addressesNode.values.indexOf(_dataFileRecordIndex);
        if(addressIndex < 0) {
            logger.trace('delete(...): end.');
            return;
        }
        addressesNode.values.splice(addressIndex, 1);
        addressesNode.addresses.splice(addressIndex, 1);
        if (addressesNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await this._redistributeOrMergeLeafNode(addressesNode, addressesNodeAddress);
        } else {
            await this._writeNode(addressesNode, addressesNodeAddress);
        }
        // Next check if we have any records left with this value.
        let rootNode = await this._readNode(addressesRootNodeAddress);
        let rootNodeFirstNode = await this._readNode(rootNode.firstNode);
        if(rootNodeFirstNode.values.length <= 0) {
            await this._deleteRootNode(addressesRootNodeAddress);
            currentNode.values.splice(deletionIndex, 1);
            currentNode.addresses.splice(deletionIndex, 1);            
        }
        if (currentNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await this._redistributeOrMergeLeafNode(currentNode, currentNodeAddress);
        } else {
            await this._writeNode(currentNode, currentNodeAddress);
        }
        logger.trace('delete(...): end.');
    }

    async _redistributeOrMergeInternalNode(node, nodeAddress) {
        logger.trace('_redistributeOrMergeInternalNode(...): start.');
        // Case 1: Node is the root of the B+Tree's internal structure
        // The node has no parent, which means this is the root, and no redistribution or merging is needed.
        if (node.parent === undefined || node.parent === null) {
            // If the root has only one child left after a merge, this child becomes the new root of the internal structure.
            if (node.values.length === 0 && node.children.length === 1) {
                const rootNodeAddress = node.root;
                const rootNode = await this._readNode(rootNodeAddress);
                const newInternalRootAddress = node.children[0];
                const newInternalRoot = await this._readNode(newInternalRootAddress);
                // Update the new internal root's parent to null
                newInternalRoot.parent = null;
                await this._writeNode(newInternalRoot, newInternalRootAddress);
                // Update the main tree root record to point to the new internal root
                rootNode.firstNode = newInternalRootAddress;
                await this._writeNode(rootNode, rootNodeAddress);
                // Delete the old, now empty, internal root node record
                await this._dataIndexFile.deleteRecord(nodeAddress);
            }
            // Otherwise (root has enough keys or is the only node), no action needed for the root itself.
            logger.trace('_redistributeOrMergeInternalNode(...): end (node is root).');
            return;
        }

        // Case 2: Node is not the root, proceed with redistribution or merge
        const parentNodeAddress = node.parent;
        const parentNode = await this._readNode(parentNodeAddress);
        // Check if we have siblings
        if (parentNode.children.length <= 1) {
            // This would be strange as a b+tree node must have at least 2 children.
            logger.warn('_redistributeOrMergeInternalNode(...): Parent node has less than 2 children. This should not happen.');
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeInternalNode(...): end.');
            return;
        }
        const childIndexInParent = parentNode.children.indexOf(nodeAddress);
        const valueIndexInParent = childIndexInParent - 1;
        if (childIndexInParent < 0) {
            // This would be strange as a node must be a child of its parent. How else did we end up in this method.
            logger.warn('_redistributeOrMergeInternalNode(...): Node not found as a child in its parent node. This should not happen.');
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeInternalNode(...): end.');
            return;
        }
        // Get our left sibling unless we are ourselves the left most one.
        const siblingChildIndexInParent = childIndexInParent === 0 ? 1 : childIndexInParent - 1;
        const siblingValueIndexInParent = siblingChildIndexInParent - 1;
        const siblingAddress = parentNode.children[siblingChildIndexInParent];
        // check if sibling is empty, then no merging or redistributing.
        if(siblingAddress === undefined || siblingAddress === null) {
            logger.warn('_redistributeOrMergeInternalNode(...): Node has an missing sibling address. This should not happen.');
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeInternalNode(): end.');
            return;
        }
        const sibling = await this._readNode(siblingAddress);
        // If the sibling has enough elements we attempt redistribution by
        // taking some elements from the sibling.
        if (sibling.values.length > Math.floor(B_TREE_ORDER / 2)) {
            if (childIndexInParent === 0) { 
                // Borrow from right sibling
                const separatorIndex = 0; // Separator key between node and right sibling
                const separatorKey = parentNode.values[separatorIndex];
                const borrowedKey = sibling.values.shift(); // First key from sibling
                const borrowedChildAddress = sibling.children.shift(); // First child from sibling
                // Move separator from parent to node
                node.values.push(separatorKey);
                // Move borrowed child to node
                node.children.push(borrowedChildAddress);
                // Update parent's separator key
                parentNode.values[separatorIndex] = borrowedKey;
                // Update borrowed child's parent
                const borrowedChild = await this._readNode(borrowedChildAddress);
                borrowedChild.parent = nodeAddress;
                await this._writeNode(borrowedChild, borrowedChildAddress);
            } else {
                // Borrow from left sibling
                const separatorIndex = childIndexInParent - 1; // Separator key between left sibling and node
                const separatorKey = parentNode.values[separatorIndex];
                const borrowedKey = sibling.values.pop(); // Last key from sibling
                const borrowedChildAddress = sibling.children.pop(); // Last child from sibling
                // Move separator from parent to node
                node.values.unshift(separatorKey);
                // Move borrowed child to node
                node.children.unshift(borrowedChildAddress);
                // Update parent's separator key
                parentNode.values[separatorIndex] = borrowedKey;
                // Update borrowed child's parent pointer
                const borrowedChild = await this._readNode(borrowedChildAddress);
                borrowedChild.parent = nodeAddress;
                await this._writeNode(borrowedChild, borrowedChildAddress);
            }
            await this._writeNode(parentNode, parentNodeAddress);
            await this._writeNode(node, nodeAddress);
            await this._writeNode(sibling, siblingAddress);
            logger.trace('_redistributeOrMergeInternalNode(): end.');
            return;
        }
        // Our sibling did not have enough elements. Next we attempt a merge.
        if (childIndexInParent === 0) {
            // Merge node into its right sibling
            // The separatorkey is the first key in the parent node.
            const separatorKey = parentNode.values.shift();
            // Prepend separator and node's keys/children to sibling
            sibling.values.unshift(separatorKey, ...node.values);
            sibling.children.unshift(...node.children);
            // Update parent pointers of moved children
            for (const childNodeAddress of node.children) {
                const childNode = await this._readNode(childNodeAddress);
                childNode.parent = siblingAddress;
                await this._writeNode(childNode, childNodeAddress);
            }
            // Remove node pointer from parent
            parentNode.children.splice(childIndexInParent, 1);
            // Write changes
            await this._writeNode(sibling, siblingAddress);
            await this._writeNode(parentNode, parentNodeAddress);
            await this._dataIndexFile.deleteRecord(nodeAddress); 
        } else {
            // Merge node into its left sibling
            const separatorIndex = childIndexInParent - 1;
            const separatorKey = parentNode.values.splice(separatorIndex, 1)[0];
            // Append separator and node's keys/children to sibling
            sibling.values.push(separatorKey, ...node.values);
            sibling.children.push(...node.children);
            // Update parent pointers of moved children
            for (const childNodeAddress of node.children) {
                const childNode = await this._readNode(childNodeAddress);
                childNode.parent = siblingAddress;
                await this._writeNode(childNode, childNodeAddress);
            }
            // Remove node pointer from parent
            parentNode.children.splice(childIndexInParent, 1);
            // Write changes
            await this._writeNode(sibling, siblingAddress);
            await this._writeNode(parentNode, parentNodeAddress);
            await this._dataIndexFile.deleteRecord(nodeAddress);
        }
        // Next we recursively check if our parent needs rebalancing.
        if (parentNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await this._redistributeOrMergeInternalNode(parentNode, parentNodeAddress);
        }
        logger.trace('_redistributeOrMergeInternalNode(): end.');
    }


    async _redistributeOrMergeLeafNode(node, nodeAddress) {
        logger.trace('_redistributeOrMergeLeafNode(...): start.');
        // The node has no parent, which means this is the root, and no redistribution or merging is needed.
        if (node.parent === undefined || node.parent === null) {
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeLeafNode(...): end.');
            return;
        }
        // To be able to redistribute or merge we need to find this node's siblings.
        // We get the siblings by asking the node's parent.
        const parentNodeAddress = node.parent;
        const parentNode = await this._readNode(parentNodeAddress);
        // Check if we have siblings
        if (parentNode.children.length <= 1) {
            // This would be strange as a b+tree node must have at least 2 children.
            logger.warn('_redistributeOrMergeLeafNode(...): Parent node has less than 2 children. This should not happen.');
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeLeafNode(...): end.');
            return;
        }
        const childIndexInParent = parentNode.children.indexOf(nodeAddress);
        const valueIndexInParent = childIndexInParent - 1;
        if (childIndexInParent < 0) {
            // This would be strange as a node must be a child of its parent. How else did we end up in this method.
            logger.warn('_redistributeOrMergeLeafNode(...): Node not found as a child in its parent node. This should not happen.');
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeLeafNode(...): end.');
            return;
        }
        // Get our left sibling unless we are ourselves the left most one.
        const siblingChildIndexInParent = childIndexInParent === 0 ? 1 : childIndexInParent - 1;
        const siblingValueIndexInParent = siblingChildIndexInParent - 1;
        const siblingAddress = parentNode.children[siblingChildIndexInParent];
        // check if sibling is empty, then no merging or redistributing.
        if(siblingAddress === undefined || siblingAddress === null) {
            logger.warn('_redistributeOrMergeLeafNode(...): Node has an missing sibling address. This should not happen.');
            await this._writeNode(node, nodeAddress);
            logger.trace('_redistributeOrMergeLeafNode(): end.');
            return;
        }
        const sibling = await this._readNode(siblingAddress);
        // If the sibling has enough elements we attempt redistribution by
        // taking some elements from the sibling.
        if (sibling.values.length > Math.floor(B_TREE_ORDER / 2)) {
            if (childIndexInParent === 0) { 
                // We take from our right sibling.
                // Move the smallest key-value pair from the sibling to the current node.
                node.values.push(sibling.values.shift());
                node.addresses.push(sibling.addresses.shift());
                // update the sibling value in parent
                parentNode.values[siblingValueIndexInParent] = sibling.values[0];
            } else {
                // We take from our left sibling.
                // Move the largest key-value pair from the sibling to the current node.
                node.values.unshift(sibling.values.pop());
                node.addresses.unshift(sibling.addresses.pop());
                // update key in parent
                parentNode.values[valueIndexInParent] = node.values[0];
            }
            await this._writeNode(parentNode, parentNodeAddress);
            await this._writeNode(node, nodeAddress);
            await this._writeNode(sibling, siblingAddress);
            logger.trace('_redistributeOrMergeLeafNode(): end.');
            return;
        }
        // Our sibling did not have enough elements. Next we attempt a merge.
        if (childIndexInParent === 0) {
            // Merge with our right sibling.
            // Add our values and children in front of our sibling's values and children.
            sibling.values.unshift(...node.values);
            sibling.addresses.unshift(...node.addresses);
            // Update link
            sibling.previousLeaf = node.previousLeaf;
            if(node.previousLeaf != null) {
                let previousNode = await this._readNode(node.previousLeaf);
                previousNode.nextLeaf = siblingAddress;
                await this._writeNode(previousNode,node.previousLeaf);
            }
            await this._dataIndexFile.deleteRecord(nodeAddress);
            await this._writeNode(sibling, siblingAddress);
            // Because we have moved everything to our right sibling we can remove
            // ourselves as a child from our parent.
            parentNode.children.shift();
            // Our sibling is now the left most child, we can remove it's key from our parent.
            parentNode.values.shift();
            await this._writeNode(parentNode, parentNodeAddress);
        } else {
            // Merge with left sibling.
            // Add our values and children to the end of our sibling's values and children.
            sibling.values.push(...node.values);
            sibling.addresses.push(...node.addresses);
            // Update link
            sibling.nextLeaf = node.nextLeaf;
            if(node.nextLeaf != null) {
                let nextNode = await this._readNode(node.nextLeaf);
                nextNode.previousLeaf = siblingAddress;
                await this._writeNode(nextNode,node.nextLeaf);
            }
            await this._dataIndexFile.deleteRecord(nodeAddress);
            await this._writeNode(sibling, siblingAddress);
            // Because we have moved everything to our left sibling we can remove
            // ourselves as a child from our parent.
            parentNode.children.splice(childIndexInParent,1);
            // Our sibling now contains our values. We can remove our key from our parent.
            parentNode.values.splice(valueIndexInParent, 1);
            await this._writeNode(parentNode, parentNodeAddress);
        }
        // Next we recursively check if our parent needs rebalancing.
        if (parentNode.values.length < Math.floor(B_TREE_ORDER / 2)) {
            await this._redistributeOrMergeInternalNode(parentNode, parentNodeAddress);
        }
        logger.trace('_redistributeOrMergeLeafNode(): end.');
    }

    async refresh() {
        logger.trace('refresh(): start.');
        let column = this._table.getColumnByUUID(this._columnUUID);
        this._columnType = column.getType();
        this._columnName = column.getName();
		// truncate (empty) the index file.
        await this._dataIndexFile.clear();
		// First record will be our header record.
		const headerRecord = {
            tableUUID: this._tableUUID,
            columnUUID: this._columnUUID,
			rootNodeAddress: -1,
            undefinedRootNodeAddress: -1,
            nullRootNodeAddress: -1
		};
		await this._dataIndexFile.appendRecord(headerRecord);
        // Next we create our root node.
        // This will be a leaf without any values (for now).
        // The createLeafNode expects a parent node address. Because this
        // is the root it does not have a parent.
        this._rootNodeAddress = await this._createRootNode();
        // Our undefined and null values have their own b+tree.
        this._undefinedRootNodeAddress = await this._createRootNode();
        this._nullRootNodeAddress = await this._createRootNode();
        await this._refresh();
		// Now that we have all our roots, we can update the header.
        await this._writeHeader();
        // Get all the records from the underlying table and
		// add them to the index.
        let numberOfRecords = await this._dataFile.getNumberOfRecords();
        let numberOfDeletedRecords = await this._dataFile.getNumberOfDeletedRecords();
        let totalNumberOfRecords = numberOfRecords + numberOfDeletedRecords;
        for(let i=0;i < totalNumberOfRecords;i++) {
            let record = await this._dataFile.readRecord(i);
            if(record === undefined || record === null) {
                continue;
            }
			let value = record[this._columnName];
            // We also insert null and undefined.
            // That way we can query for the absence of a property.
            await this.insert(value, record._index);
        }
        logger.trace('refresh(): end.');
    }

    async _refresh() {
    }

	async unequal(_value) {
        logger.trace('unequal(): start.');
        let result = [];
        if(_value === undefined) {
            result = await this._unequalToUndefined();
            logger.trace('unequal(): end.');
            return result;
        }
        if(_value === null) {
            result = await this._unequalToNull();
            logger.trace('unequal(): end.');
            return result;
        }
        // Get all the records that are less than the value.
        const lessThanResult = await this.less(_value);
        // Get all the records that are greater than the value.
        const greaterThanResult = await this.greater(_value);
        // Combine the results.
        result.push(...lessThanResult);
        result.push(...greaterThanResult);
        logger.trace('unequal(): end.');
        return result;
    }

	async unequalColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async clear() {
        await this.refresh();
    }

	async insert(_value, _dataFileRecordIndex) {
        logger.trace('insert(...): start.');
        await this._insert(_value, _dataFileRecordIndex, this._rootNodeAddress, this._columnType);
        logger.trace('insert(...): end.');
    }

    async _insert(_value, _dataFileRecordIndex, _rootNodeAddress, _columnType) {
        logger.trace('_insert(...): start.');
        if(_value === undefined) {
            await this._insertUndefined(_dataFileRecordIndex);
            logger.trace('insert(...): end.');
            return;
        }
        if(_value === null) {
            await this._insertNull(_dataFileRecordIndex);
            logger.trace('insert(...): end.');
            return;
        }
        // Find the leaf that should contain the value.
        let {node: currentNode, nodeAddress: currentNodeAddress} = await this._findLeafNode(_rootNodeAddress, _value, _columnType);
        let numberOfValues = currentNode.values.length;
        let valueIndex = 0;
        let isDuplicate = false;
        // We iterate over all the values.
        while (valueIndex < numberOfValues) {
            let valueAtIndex = currentNode.values[valueIndex];
            // We stop when we find the one that is greater than or equal to the given value.
            let comparison = _columnType.compare(_value, valueAtIndex);
            if(comparison < 0) {
                break;
            } else if(comparison === 0) {
                // This is a special case. It means the values are not unique.
                isDuplicate = true;
                break;
            } else {
                valueIndex++;
            }
        }
        if(isDuplicate) {
            // Addresses are stored in their own b+tree to allow for duplicates and for quick access.
            const addressesRootNodeAddress = currentNode.addresses[valueIndex];
            const {node: addressesNode, nodeAddress: addressesNodeAddress} = await this._findLeafNode(addressesRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
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
                await this._splitLeafNode(addressesNode, addressesNodeAddress, ColumnType.INTEGER)
            } else {
                await this._writeNode(addressesNode, addressesNodeAddress);
            }
        } else {
            // Addresses are stored in their own b+tree to allow for duplicates and for quick access.
            const addressesRootNodeAddress = await this._createRootNode();
            const {node: addressesNode, nodeAddress: addressesNodeAddress} = await this._findLeafNode(addressesRootNodeAddress, _dataFileRecordIndex, ColumnType.INTEGER);
            // This is the first one, so lets just add it.
            addressesNode.values.push(_dataFileRecordIndex);
            addressesNode.addresses.push(_dataFileRecordIndex);
            await this._writeNode(addressesNode, addressesNodeAddress);
            currentNode.values.splice(valueIndex, 0, _value);
            currentNode.addresses.splice(valueIndex, 0, addressesRootNodeAddress);
            // Next we check if the node is full and needs to be split.
            if (currentNode.values.length > B_TREE_ORDER) {
                await this._splitLeafNode(currentNode, currentNodeAddress, _columnType);
            } else {
                await this._writeNode(currentNode, currentNodeAddress);
            }
        }
        logger.trace('_insert(...): end.');
    }

	async _findLeafNode(_rootNodeAddress, _value, _columnType) {
        logger.trace('_findLeafNode(): start.');
		// Start at the supplied root node.
        let rootNode = await this._readNode(_rootNodeAddress);
        let currentNodeAddress = rootNode.firstNode;
        let currentNode = await this._readNode(currentNodeAddress);
        // Keep going until we reach a leaf node.
        // When a tree is created its root node is a leaf.
        while (!currentNode.isLeaf) {
            let numberOfValues = currentNode.values.length;
            let valueIndex = 0;
            let nodeChildIndex = 0;
            // We iterate over all the values.
            while (valueIndex < numberOfValues) {
                let valueAtIndex = currentNode.values[valueIndex];
                // We stop when we find the one that is greater than or equal to the given value.
                let comparison = _columnType.compare(_value, valueAtIndex);
                if(comparison < 0) {
                    break;
                } else if(comparison === 0) {
                    nodeChildIndex++;
                    break;
                } else {
                    valueIndex++;
                    nodeChildIndex++;
                }
            }
            currentNodeAddress = currentNode.children[nodeChildIndex];
            currentNode = await this._readNode(currentNodeAddress);
        }
        logger.trace('_findLeafNode(): end.');
        return { node: currentNode, nodeAddress: currentNodeAddress };
    }

    async _findLeftMostLeafNode(_rootNodeAddress) {
        logger.trace('_findLeftMostLeafNode(): start.');
        // Start at the supplied root node.
        let rootNode = await this._readNode(_rootNodeAddress);
        let currentNodeAddress = rootNode.firstNode;
        let currentNode = await this._readNode(currentNodeAddress);
        // Keep going until we reach a leaf node.
        // When a tree is created its root node is a leaf.
        while (!currentNode.isLeaf) {
            currentNodeAddress = currentNode.children[0];
            currentNode = await this._readNode(currentNodeAddress);
        }
        logger.trace('_findLeftMostLeafNode(): end.');
        return currentNode;
    }

    async _findRightMostLeafNode(_rootNodeAddress) {
        logger.trace('_findRightMostLeafNode(): start.');
        // Start at the supplied root node.
        let rootNode = await this._readNode(_rootNodeAddress);
        let currentNodeAddress = rootNode.firstNode;
        let currentNode = await this._readNode(currentNodeAddress);
        // Keep going until we reach a leaf node.
        // When a tree is created its root node is a leaf.
        while (!currentNode.isLeaf) {
            let numberOfChildren = currentNode.children.length;
            currentNodeAddress = currentNode.children[numberOfChildren - 1];
            currentNode = await this._readNode(currentNodeAddress);
        }
        logger.trace('_findRightMostLeafNode(): end.');
        return currentNode;
    }

    async _readNode(_nodeAddress) {
        logger.trace('_readNode(): start.');
        logger.debug('readNode(...): _nodeAddress is \'' + _nodeAddress + '\'.');
		// Defensive programming...check input...
        if (_nodeAddress === undefined || _nodeAddress === null) {
            logger.debug('_readNode(...): _nodeAddress is undefined or null.');
            logger.trace('_readNode(): end.');
            return null;
        }
        const node = await this._dataIndexFile.readRecord(_nodeAddress);
        logger.debug('_readNode(): node = ' + JSON.stringify(node));
        logger.trace('_readNode(): end.');
        return node;
    }

    async _writeNode(node, nodeAddress) {
        logger.trace('_writeNode(): start.');

        await this._dataIndexFile.updateRecord(nodeAddress, node);
        logger.trace('_writeNode(): end.');
    }

    /**
     * A root is a place in the file where a b+tree starts.
     * The file contains multiple b+trees because database table rows may
     * contain the same value. This means we have to store multiple addresses
     * for the same value. Each address is unique but over time the number 
     * of rows with the same value can grow large.
     * For example: LastName = "Smith" could result in thousands of addresses.
     * For quick retrieval the addresses are stored in their own b+tree.
     */
    async _createRootNode() {
        logger.trace('_createRootNode(): start.');
        const rootNode = {
            isRoot: true,
            firstNode: null
        }
        const rootNodeAddress = await this._dataIndexFile.appendRecord(rootNode);
        const leafNodeAddress = await this._createLeafNode(rootNodeAddress, null);
        rootNode.firstNode = leafNodeAddress;
        await this._writeNode(rootNode, rootNodeAddress);
        logger.trace('_createRootNode(): end.');
        return rootNodeAddress;
    }

    async _deleteRootNode(_rootNodeAddress) {
        // top to bottom
        let rootNode = await this._readNode(_rootNodeAddress);
        let firstNode = await this._readNode(rootNode.firstNode);
        let queue = [];
        if(!firstNode.isLeaf) {
           queue.push(...firstNode.children)
        }
        while(queue.length > 0) {
            node = queue.pop();
            queue.push(...node.children);
            this._dataIndexFile.deleteRecord(node._index);
        }
        await this._dataIndexFile.deleteRecord(firstNode._index);
        await this._dataIndexFile.deleteRecord(rootNode._index);
    }

    async _createLeafNode(_rootNodeAddress, _parentNodeAddress) {
        logger.trace('_createLeafNode(): start.');
        const node = {
            root: _rootNodeAddress,
            parent: _parentNodeAddress,
            isLeaf: true,
            values: [],   
            addresses: [], 
            nextLeaf: null, 
            previousLeaf: null 
        };
        const nodeAddress = await this._dataIndexFile.appendRecord(node);
        logger.trace('_createLeafNode(): end.');
        return nodeAddress;
    }

    async _createInternalNode(_rootNodeAddress, _parentNodeAddress) {
        logger.trace('_createInternalNode(): start.');
        const node = {
            root: _rootNodeAddress,
            parent: _parentNodeAddress,
            isLeaf: false,
            values: [],
            children: []
        };
        const nodeAddress = await this._dataIndexFile.appendRecord(node);
        logger.trace('_createInternalNode(): end.');
        return nodeAddress;
    }

    async _splitLeafNode(node, nodeAddress, _columnType) {
        logger.trace('_splitLeafNode(): start.');
        const mid = Math.ceil(B_TREE_ORDER / 2);
        const newLeafNodeAddress = await this._createLeafNode(node.root, node.parent);
        const newLeafNode = await this._readNode(newLeafNodeAddress);

        // Move the upper half of keys and values to the new leaf node.
        newLeafNode.values = node.values.splice(mid);
        newLeafNode.addresses = node.addresses.splice(mid);

        // Link the new node in the leaf chain.
        newLeafNode.nextLeaf = node.nextLeaf;
        newLeafNode.previousLeaf = nodeAddress;

        if (node.nextLeaf !== null) {
            const nextLeafNode = await this._readNode(node.nextLeaf);
            nextLeafNode.previousLeaf = newLeafNodeAddress;
            await this._writeNode(nextLeafNode, node.nextLeaf);
        }

        node.nextLeaf = newLeafNodeAddress;

        await this._writeNode(node, nodeAddress);
        await this._writeNode(newLeafNode, newLeafNodeAddress);
        
        await this._promoteKey(node.root, node.parent, newLeafNode.values[0], nodeAddress, newLeafNodeAddress, _columnType); // Promote the smallest key of the new node.
        logger.trace('_splitLeafNode(): end.');
    }

    async _promoteKey(rootNodeAddress, parentNodeAddress, _value, leftChildAddress, rightChildAddress, _columnType) {

        logger.trace('_promoteKey(): start.');
        if (parentNodeAddress === undefined || parentNodeAddress === null) {
            let newRootAddress = await this._createInternalNode(rootNodeAddress, null);
            let newRoot = await this._readNode(newRootAddress);
            newRoot.values = [_value];
            newRoot.children = [leftChildAddress, rightChildAddress];
            await this._writeNode(newRoot, newRootAddress);

            let rootNode = await this._readNode(rootNodeAddress);
            rootNode.firstNode = newRootAddress;
            await this._writeNode(rootNode, rootNodeAddress);

            // update the children with the parent node
            let leftChild = await this._readNode(leftChildAddress);
            leftChild.parent = newRootAddress;
            let rightChild = await this._readNode(rightChildAddress);
            rightChild.parent = newRootAddress;
            await this._writeNode(leftChild, leftChildAddress);
            await this._writeNode(rightChild, rightChildAddress);
        } else {
            let parentNode = await this._readNode(parentNodeAddress);
            //find position to insert key
            let i = 0;
            let numberOfValues = parentNode.values.length;
            while (i < numberOfValues && _columnType.compare(_value, parentNode.values[i]) > 0) {
                i++;
            }
            // Insert key at the found position.
            parentNode.values.splice(i, 0, _value);
            // Insert right child at index+1.
            parentNode.children.splice(i + 1, 0, rightChildAddress);
            await this._writeNode(parentNode, parentNodeAddress);
            // Check if node needs to be split.
            if (parentNode.values.length > B_TREE_ORDER) {
                await this._splitInternalNode(parentNode, parentNodeAddress, _columnType);
            }
        }
        logger.trace('_promoteKey(): end.');
    }

    async _splitInternalNode(node, nodeAddress, _columnType) {
        logger.trace('_splitInternalNode(): start.');
        const mid = Math.ceil(B_TREE_ORDER / 2);

        const newInternalNodeAddress = await this._createInternalNode(node.root, node.parent);
        const newInternalNode = await this._readNode(newInternalNodeAddress);

        // Move upper half to new internal node.
        newInternalNode.children = node.children.splice(mid + 1);
        newInternalNode.values = node.values.splice(mid);

        // Update parent of children
        for (let i = 0; i < newInternalNode.children.length; i++) { 
            const child = await this._readNode(newInternalNode.children[i]);
            child.parent = newInternalNodeAddress;
            await this._writeNode(child, newInternalNode.children[i]);
        }
        // Promote key
        const promotedKey = newInternalNode.values.shift();
        await this._writeNode(node, nodeAddress);
        await this._writeNode(newInternalNode, newInternalNodeAddress);
        await this._promoteKey(node.root, node.parent, promotedKey, nodeAddress, newInternalNodeAddress, _columnType);
        logger.trace('_splitInternalNode(): end.');
    }

    async toString() {
        logger.trace('toString(): start.');
        let result = "";
        if (this._rootNodeAddress === null) {
            result = "Empty B+Tree";
            logger.trace('toString(): end.');
            return result;
        }

        const root = await this._readNode(this._rootNodeAddress);
        const queue = [root.firstNode];
        const visited = new Set();

        while (queue.length > 0) {
            const currentAddress = queue.shift();
            if (visited.has(currentAddress)) {
                continue; // Avoid infinite loops if there are cycles (shouldn't be in a B+Tree)
            }
            visited.add(currentAddress);
            const node = await this._readNode(currentAddress);
            if (node === null) {
                continue;
            }

            result += `Node ${currentAddress}: `;
            if (node.isLeaf) {
                result += `[Leaf] parent: ${node.parent}, Values: ${node.values.join(', ')}, Addresses: ${node.addresses.join(', ')}, PreviousLeaf: ${node.previousLeaf}, NextLeaf: ${node.nextLeaf}\n`;
            } else {
                result += `[Internal] parent: ${node.parent}, Values: ${node.values.join(', ')}, Children: ${node.children.join(', ')}\n`;
                queue.push(...node.children.filter(child => child != null));
            }
        }
        logger.trace('toString(): end.');
        return result;
    }
}

module.exports = FileSystemBPlusTreeTableIndex;