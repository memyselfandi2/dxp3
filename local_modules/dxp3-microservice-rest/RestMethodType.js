const RestMethodType = {
	ARRAY_BOOLEAN: 'array<boolean>',
	ARRAY_NUMBER: 'array<number>',
	ARRAY_OBJECT: 'array<object>',
	ARRAY_STRING: 'array<string>',
	BOOLEAN: 'boolean',
	FILE: 'file',
	NUMBER: 'number',
	OBJECT: 'object',
	STRING: 'string',
	VOID: 'void',
	parse: function(restMethodTypeAsString) {
		if(restMethodTypeAsString === undefined || restMethodTypeAsString === null) {
			return RestMethodType.VOID;
		}
		restMethodTypeAsString = restMethodTypeAsString.trim().toLowerCase();
		switch(restMethodTypeAsString) {
			case 'array<bool>':
			case 'array<boolean>':
				return RestMethodType.ARRAY_BOOLEAN;
			case 'array<int>':
			case 'array<integer>':
			case 'array<number>':
				return RestMethodType.ARRAY_NUMBER;
			case 'array<json>':
			case 'array<object>':
				return RestMethodType.ARRAY_OBJECT;
			case 'array<string>':
			case 'array<text>':
			case 'array<txt>':
				return RestMethodType.ARRAY_STRING;
			case 'binary':
			case 'stream':
			case 'doc':
			case 'document':
			case 'file':
			case 'image':
			case 'photo':
			case 'video':
				return RestMethodType.FILE;
			case 'bool':
			case 'boolean':
				return RestMethodType.BOOLEAN;
			case 'int':
			case 'integer':
			case 'number':
				return RestMethodType.NUMBER;
			case 'object':
			case 'json':
				return RestMethodType.OBJECT;
			case 'string':
			case 'text':
			case 'txt':
				return RestMethodType.STRING;
			case 'undefined':
			case 'void':
			case 'none':
			case 'nothing':
			case 'null':
				return RestMethodType.VOID;
			default:
				return RestMethodType.VOID;
		}
	},
	toString: function(restMethodType) {
		return RestMethodType.parse(restMethodType);
	}
}

module.exports = RestMethodType;