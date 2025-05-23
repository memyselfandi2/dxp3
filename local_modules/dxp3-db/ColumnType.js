/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * ColumnType
 */
const packageName = 'dxp3-db';
const moduleName = 'ColumnType';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/ColumnType
 */
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');

class ColumnType {
   /*********************************************
    * CONSTRUCTOR
    ********************************************/

    /**
     * @param {Number} _code
     * @param {String} _name
     */
	constructor(_code, _name) {
		this._code = _code;
		this._name = _name;
	}

   /*********************************************
    * PUBLIC METHODS
    ********************************************/

	equals(_otherColumnType) {
		return (this._code === _otherColumnType.code);
	}

	/**
	* @function
	* @param {String} columnTypeAsString - The column type given as a string to be transformed to a value of the ColumnType enumeration.
	* @returns {ColumnType}
	*/
	static parse(columnTypeAsString) {
		if(columnTypeAsString === undefined || columnTypeAsString === null) {
			throw sql.SQLError.ILLEGAL_ARGUMENT;
		}
		if(typeof columnTypeAsString != 'string') {
			throw sql.SQLError.ILLEGAL_ARGUMENT;
		}
		columnTypeAsString = columnTypeAsString.trim();
		if(columnTypeAsString.length <= 0) {
			throw sql.SQLError.ILLEGAL_ARGUMENT;
		}
		columnTypeAsString = columnTypeAsString.toUpperCase();
		switch(columnTypeAsString) {
			case "BOOLEAN":
				return ColumnType.BOOLEAN;
			case "ARRAY<BOOLEAN>":
			case "BOOLEAN[]":
				return ColumnType.BOOLEAN_ARRAY;
			case "DATE":
				return ColumnType.DATE;
			case "ARRAY<DATE>":
			case "DATE[]":
				return ColumnType.DATE_ARRAY;
			case "DOUBLE":
				return ColumnType.DOUBLE;
			case "ARRAY<DOUBLE>":
			case "DOUBLE[]":
				return ColumnType.DOUBLE_ARRAY;
			case "FLOAT":
				return ColumnType.FLOAT;
			case "ARRAY<FLOAT>":
			case "FLOAT[]":
				return ColumnType.FLOAT_ARRAY;
			case "INT":
			case "INTEGER":
			case "NUMBER":
				return ColumnType.INTEGER;
			case "ARRAY<INT>":
			case "ARRAY<INTEGER>":
			case "ARRAY<NUMBER>":
			case "INT[]":
			case "INTEGER[]":
			case "NUMBER[]":
				return ColumnType.INTEGER_ARRAY;
			case "STRING":
			case "TEXT":
			case "TXT":
			case "VARCHAR":
			case "VARCHARS":
				return ColumnType.STRING;
			case "ARRAY<STRING>":
			case "ARRAY<TEXT>":
			case "ARRAY<TXT>":
			case "ARRAY<VARCHAR>":
			case "ARRAY<VARCHARS>":
			case "STRING[]":
			case "TEXT[]":
			case "TXT[]":
			case "VARCHAR[]":
			case "VARCHARS[]":
				return ColumnType.STRING_ARRAY;
			default:
				throw sql.SQLError.ILLEGAL_ARGUMENT;
		}
	}

    toString() {
    	return this._name;
    }

   /*********************************************
    * GETTERS
    ********************************************/

	get code() {
		return this.getCode();
	}

	getCode() {
		return this._code;
	}

	get name() {
		return this.getName();
	}

	getName() {
		return this._name;
	}
}
ColumnType.BOOLEAN = new ColumnType(10, 'BOOLEAN');
ColumnType.BOOLEAN.compare = function(_object1, _object2) {
	if(_object1 === _object2) {
		return 0;
	}
	if(_object1 === true) {
		return 1;
	}
	return -1;
}
ColumnType.BOOLEAN_ARRAY = new ColumnType(15, 'BOOLEAN[]');
ColumnType.BOOLEAN_ARRAY.getBaseColumnType = function() {
	return ColumnType.BOOLEAN;
}
ColumnType.BOOLEAN_ARRAY.compare = function(_array1, _array2) {
	// If the arrays are of different lengths we need to still compare the arrays
	// to see which one comes first.
	if (_array1.length != _array2.length) {
		// If array1 has no elements it will come first.
		if(_array1.length <= 0) {
			return -1;
		}
		// If array2 is the one without elements it comes first.
		if(_array2.length <= 0) {
			return 1;
		}
		// Next we do a deep comparison.
		for (let i = 0; i < _array1.length; i++) {
			const object1 = _array1[i];
			const object2 = _array2[i];
		   if (object1 == object2) {
		       continue;
		   }
		   if(object1 === true) {
		   	return 1;
		   }
		   return -1;
		}
		// When we arrive here it means array1 was the shorter one and array2 contains the
		// exact same values at the start. Let array1 come first.
		return -1;
   }
   // Arrays are of the same length. Lets do a deep comparison.
	for (let i = 0; i < _array1.length; i++) {
		const object1 = _array1[i];
		const object2 = _array2[i];
	   if (object1 == object2) {
	       continue;
	   }
	   if(object1 === true) {
	   	return 1;
	   }
	   return -1;
	}
	return 0;
}
ColumnType.DATE = new ColumnType(20, 'DATE');
ColumnType.DATE.compare = function(_object1, _object2) {
	if(_object1 < _object2) {
		return -1;
	}
	if(_object1 === _object2) {
		return 0;
	}
	return 1;
}
ColumnType.DATE_ARRAY = new ColumnType(25, 'BOOLEAN[]');
ColumnType.DATE_ARRAY.getBaseColumnType = function() {
	return ColumnType.DATE;
}
ColumnType.DATE_ARRAY.compare = function(_array1, _array2) {
	// If the arrays are of different lengths we need to still compare the arrays
	// to see which one comes first.
	if (_array1.length != _array2.length) {
		// If array1 has no elements it will come first.
		if(_array1.length <= 0) {
			return -1;
		}
		// If array2 is the one that is shorter it comes first.
		if(_array2.length <= 0) {
			return 1;
		}
		// Next we do a deep comparison
		for (let i = 0; i < _array1.length; i++) {
			const object1 = _array1[i];
			const object2 = _array2[i];
			if(object1 === object2) {
				continue;
			}
			if(object1 < object2) {
				return -1;
			}
		   return 1;
		}
		// When we arrive here it means array1 was the shorter one and array2 contains the
		// exact same values at the start. Let array1 come first.
		return -1;
   }
   // Arrays are of the same length. Lets do a deep comparison.
	for (let i = 0; i < _array1.length; i++) {
		const object1 = _array1[i];
		const object2 = _array2[i];
		if(object1 === object2) {
			continue;
		}
		if(object1 < object2) {
			return -1;
		}
	   return 1;
	}
	return 0;
}
ColumnType.DOUBLE = new ColumnType(30, 'DOUBLE');
ColumnType.DOUBLE.compare = function(_object1, _object2) {
	if(_object1 < _object2) {
		return -1;
	}
	if(_object1 === _object2) {
		return 0;
	}
	return 1;
}
ColumnType.DOUBLE_ARRAY = new ColumnType(35, 'DOUBLE[]');
ColumnType.DOUBLE_ARRAY.getBaseColumnType = function() {
	return ColumnType.DOUBLE;
}
ColumnType.DOUBLE_ARRAY.compare = function(_array1, _array2) {
	// If the arrays are of different lengths we need to still compare the arrays
	// to see which one comes first.
	if (_array1.length != _array2.length) {
		// If array1 has no elements it will come first.
		if(_array1.length <= 0) {
			return -1;
		}
		// If array2 is the one without elements it comes first.
		if(_array2.length <= 0) {
			return 1;
		}
		// Next we do a deep comparison
		for (let i = 0; i < _array1.length; i++) {
			const object1 = _array1[i];
			const object2 = _array2[i];
			if(object1 === object2) {
				continue;
			}
			if(object1 < object2) {
				return -1;
			}
		   return 1;
		}
		// When we arrive here it means array1 was the shorter one and array2 contains the
		// exact same values at the start. Let array1 come first.
		return -1;
   }
   // Arrays are of the same length. Lets do a deep comparison.
	for (let i = 0; i < _array1.length; i++) {
		const object1 = _array1[i];
		const object2 = _array2[i];
		if(object1 === object2) {
			continue;
		}
		if(object1 < object2) {
			return -1;
		}
	   return 1;
	}
	return 0;
}
ColumnType.FLOAT = new ColumnType(40, 'FLOAT');
ColumnType.FLOAT.compare = function(_object1, _object2) {
	if(_object1 < _object2) {
		return -1;
	}
	if(_object1 === _object2) {
		return 0;
	}
	return 1;
}
ColumnType.FLOAT_ARRAY = new ColumnType(45, 'FLOAT[]');
ColumnType.FLOAT_ARRAY.getBaseColumnType = function() {
	return ColumnType.FLOAT;
}
ColumnType.FLOAT_ARRAY.compare = function(_array1, _array2) {
	// If the arrays are of different lengths we need to still compare the arrays
	// to see which one comes first.
	if (_array1.length != _array2.length) {
		// If array1 has no elements it will come first.
		if(_array1.length <= 0) {
			return -1;
		}
		// If array2 is the one without elements it comes first.
		if(_array2.length <= 0) {
			return 1;
		}
		// Next we do a deep comparison
		for (let i = 0; i < _array1.length; i++) {
			const object1 = _array1[i];
			const object2 = _array2[i];
			if(object1 === object2) {
				continue;
			}
			if(object1 < object2) {
				return -1;
			}
		   return 1;
		}
		// When we arrive here it means array1 was the shorter one and array2 contains the
		// exact same values at the start. Let array1 come first.
		return -1;
   }
   // Arrays are of the same length. Lets do a deep comparison.
	for (let i = 0; i < _array1.length; i++) {
		const object1 = _array1[i];
		const object2 = _array2[i];
		if(object1 === object2) {
			continue;
		}
		if(object1 < object2) {
			return -1;
		}
	   return 1;
	}
	return 0;
}
ColumnType.INTEGER = new ColumnType(50, 'INTEGER');
ColumnType.INTEGER.compare = function(_object1, _object2) {
	if(_object1 < _object2) {
		return -1;
	}
	if(_object1 === _object2) {
		return 0;
	}
	return 1;
}
ColumnType.INTEGER_ARRAY = new ColumnType(55, 'INTEGER[]');
ColumnType.INTEGER_ARRAY.getBaseColumnType = function() {
	return ColumnType.INTEGER;
}
ColumnType.INTEGER_ARRAY.compare = function(_array1, _array2) {
	// If the arrays are of different lengths we need to still compare the arrays
	// to see which one comes first.
	if (_array1.length != _array2.length) {
		// If array1 has no elements it will come first.
		if(_array1.length <= 0) {
			return -1;
		}
		// If array2 is the one without elements it comes first.
		if(_array2.length <= 0) {
			return 1;
		}
		// Next we do a deep comparison.
		for (let i = 0; i < _array1.length; i++) {
			const object1 = _array1[i];
			const object2 = _array2[i];
			if(object1 === object2) {
				continue;
			}
			if(object1 < object2) {
				return -1;
			}
		   return 1;
		}
		// When we arrive here it means array1 was the shorter one and array2 contains the
		// exact same values at the start. Let array1 come first.
		return -1;
   }
   // Arrays are of the same length. Lets do a deep comparison.
	for (let i = 0; i < _array1.length; i++) {
		const object1 = _array1[i];
		const object2 = _array2[i];
		if(object1 === object2) {
			continue;
		}
		if(object1 < object2) {
			return -1;
		}
	   return 1;
	}
	return 0;
}
ColumnType.STRING = new ColumnType(60, 'STRING');
ColumnType.STRING.compare = function(_object1, _object2) {
	return _object1.localeCompare(_object2);
}
ColumnType.STRING_ARRAY = new ColumnType(65, 'STRING[]');
ColumnType.STRING_ARRAY.getBaseColumnType = function() {
	return ColumnType.STRING;
}
ColumnType.STRING_ARRAY.compare = function(_array1, _array2) {
	// If the arrays are of different lengths we need to still compare the arrays
	// to see which one comes first.
	if (_array1.length != _array2.length) {
		// If array1 has no elements it will come first.
		if(_array1.length <= 0) {
			return -1;
		}
		// If array2 is the one without elements it comes first.
		if(_array2.length <= 0) {
			return 1;
		}
		// Next we do a deep comparison.
		for (let i = 0; i < _array1.length; i++) {
			const object1 = _array1[i];
			const object2 = _array2[i];
			if(object1 === object2) {
				continue;
			}
			if(object1 < object2) {
				return -1;
			}
		   return 1;
		}
		// When we arrive here it means array1 was the shorter one and array2 contains the
		// exact same values at the start. Let array1 come first.
		return -1;
   }
   // Arrays are of the same length. Lets do a deep comparison.
	for (let i = 0; i < _array1.length; i++) {
		const object1 = _array1[i];
		const object2 = _array2[i];
		if(object1 === object2) {
			continue;
		}
		if(object1 < object2) {
			return -1;
		}
	   return 1;
	}
	return 0;
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(ColumnType);
   return;
}
module.exports = ColumnType;