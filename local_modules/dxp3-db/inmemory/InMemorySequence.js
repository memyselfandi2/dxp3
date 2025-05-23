const IntegerColumn = require('../IntegerColumn');
const InMemoryTable = require('./InMemoryTable');
const Sequence = require('../Sequence');
const UUID = require('dxp3-uuid');

class InMemorySequence extends Sequence {

	constructor(_uuid, _name) {
		super(_uuid, _name);
		this._value = 0;
		let columns = [new IntegerColumn(UUID.newInstance(), 'number')];
        this._table = new InMemoryTable(UUID.newInstance(), _name, columns);
	}

	async init() {
	}

	async close() {
	}

	async desc() {
		return this._table.desc();
	}

	async nextValue() {
		return this._value++;
	}
}

module.exports = InMemorySequence;