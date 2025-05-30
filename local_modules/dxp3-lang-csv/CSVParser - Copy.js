const stream = require('stream');

const CSVDocument = require('./CSVDocument');
const CSVRow = require('./CSVRow');

const [cr] = Buffer.from('\r')
const [nl] = Buffer.from('\n')
const defaults = {
  escape: '"',
  headers: null,
  mapHeaders: ({ header }) => header,
  mapValues: ({ value }) => value,
  newline: '\n',
  quote: '"',
  raw: false,
  separator: ',',
  skipComments: false,
  skipLines: null,
  maxRowBytes: Number.MAX_SAFE_INTEGER,
  strict: false
}

class CSVParser extends stream.Transform {

  constructor (_options) {
    _options = CSVParserOptions.parse(_options);
  	let transformOptions = {
  		objectMode: true,
  		highWaterMark: _options.highWaterMark
  	}
    super(tranformOptions);
    this._options = _options;

    if (Array.isArray(_options)) _options = { headers: _options }

    const options = Object.assign({}, defaults, _options)

    options.customNewline = options.newline !== defaults.newline

    for (const key of ['newline', 'quote', 'separator']) {
      if (typeof options[key] !== 'undefined') {
        ([options[key]] = Buffer.from(options[key]))
      }
    }

    // if escape is not defined on the passed options, use the end value of quote
    options.escape = (_options || {}).escape ? Buffer.from(options.escape)[0] : options.quote

    this.state = {
      empty: options.raw ? Buffer.alloc(0) : '',
      escaped: false,
      first: true,
      lineNumber: 0,
      previousEnd: 0,
      rowLength: 0,
      quoted: false
    }

    this._prev = null

    if (options.headers === false) {
      // enforce, as the column length check will fail if headers:false
      options.strict = false
    }

    if (options.headers || options.headers === false) {
      this.state.first = false
    }

    this.options = options
    this.headers = options.headers
  }

  parseCell (buffer, start, end) {
    const { escape, quote } = this.options
    // remove quotes from quoted cells
    if (buffer[start] === quote && buffer[end - 1] === quote) {
      start++
      end--
    }

    let y = start

    for (let i = start; i < end; i++) {
      // check for escape characters and skip them
      if (buffer[i] === escape && i + 1 < end && buffer[i + 1] === quote) {
        i++
      }

      if (y !== i) {
        buffer[y] = buffer[i]
      }
      y++
    }

    return this.parseValue(buffer, start, y)
  }

  parseLine (buffer, start, end) {
    const { customNewline, escape, mapHeaders, mapValues, quote, separator, skipComments, skipLines } = this.options

    end-- // trim newline
    if (!customNewline && buffer.length && buffer[end - 1] === cr) {
      end--
    }

    const comma = separator
    const cells = []
    let isQuoted = false
    let offset = start

    if (skipComments) {
      const char = typeof skipComments === 'string' ? skipComments : '#'
      if (buffer[start] === Buffer.from(char)[0]) {
        return
      }
    }

    const mapValue = (value) => {
      if (this.state.first) {
        return value
      }

      const index = cells.length
      const header = this.headers[index]

      return mapValues({ header, index, value })
    }

    for (let i = start; i < end; i++) {
      const isStartingQuote = !isQuoted && buffer[i] === quote
      const isEndingQuote = isQuoted && buffer[i] === quote && i + 1 <= end && buffer[i + 1] === comma
      const isEscape = isQuoted && buffer[i] === escape && i + 1 < end && buffer[i + 1] === quote

      if (isStartingQuote || isEndingQuote) {
        isQuoted = !isQuoted
        continue
      } else if (isEscape) {
        i++
        continue
      }

      if (buffer[i] === comma && !isQuoted) {
        let value = this.parseCell(buffer, offset, i)
        value = mapValue(value)
        cells.push(value)
        offset = i + 1
      }
    }

    if (offset < end) {
      let value = this.parseCell(buffer, offset, end)
      value = mapValue(value)
      cells.push(value)
    }

    if (buffer[end - 1] === comma) {
      cells.push(mapValue(this.state.empty))
    }

    const skip = skipLines && skipLines > this.state.lineNumber
    this.state.lineNumber++

    if (this.state.first && !skip) {
      this.state.first = false
      this.headers = cells.map((header, index) => mapHeaders({ header, index }))

      this.emit('headers', this.headers)
      return
    }

    if (!skip && this.options.strict && cells.length !== this.headers.length) {
      const e = new RangeError('Row length does not match headers')
      this.emit('error', e)
    } else {
      if (!skip) this.writeRow(cells)
    }
  }

  parseValue (buffer, start, end) {
    if (this.options.raw) {
      return buffer.slice(start, end)
    }

    return buffer.toString('utf-8', start, end)
  }

  writeRow (cells) {
    const headers = (this.headers === false) ? cells.map((value, index) => index) : this.headers

    const row = cells.reduce((o, cell, index) => {
    	o.addValue(cell);
      // const header = headers[index]
      // if (header === null) return o // skip columns
      // if (header !== undefined) {
      //   o[header] = cell
      // } else {
      //   o[`_${index}`] = cell
      // }
      return o
    }, new CSVRow)


    this.push(row)
  }

  _flush (cb) {
    if (this.state.escaped || !this._prev) return cb()
    this.parseLine(this._prev, this.state.previousEnd, this._prev.length + 1) // plus since online -1s
    cb()
  }

	_transform(_data, enc, cb) {
		// Make sure the supplied data is
		// always a buffer.
		if (typeof _data === 'string') {
			_data = Buffer.from(_data)
		}
		let buffer = _data;
		// Actually, there may be some left over data from the previous
		// call. That was stored in a private property.
		// Lets concatenate it with the new data
		if(this._previousData != null) {
			buffer = Buffer.concat([this._previousData, _data]);
		}
		
	const { escape, quote } = this.options
	let start = 0
	let buffer = data

	if (this._prev) {
	  start = this._prev.length
	  buffer = Buffer.concat([this._prev, data])
	  this._prev = null
	}

	const bufferLength = buffer.length

	for (let i = start; i < bufferLength; i++) {
	  const chr = buffer[i]
	  const nextChr = i + 1 < bufferLength ? buffer[i + 1] : null

	  this.state.rowLength++
	  if (this.state.rowLength > this.options.maxRowBytes) {
	    return cb(new Error('Row exceeds the maximum size'))
	  }

	  if (!this.state.escaped && chr === escape && nextChr === quote && i !== start) {
	    this.state.escaped = true
	    continue
	  } else if (chr === quote) {
	    if (this.state.escaped) {
	      this.state.escaped = false
	      // non-escaped quote (quoting the cell)
	    } else {
	      this.state.quoted = !this.state.quoted
	    }
	    continue
	  }

	  if (!this.state.quoted) {
	    if (this.state.first && !this.options.customNewline) {
	      if (chr === nl) {
	        this.options.newline = nl
	      } else if (chr === cr) {
	        if (nextChr !== nl) {
	          this.options.newline = cr
	        }
	      }
	    }

	    if (chr === this.options.newline) {
	      this.parseLine(buffer, this.state.previousEnd, i + 1)
	      this.state.previousEnd = i + 1
	      this.state.rowLength = 0
	    }
	  }
	}

	if (this.state.previousEnd === bufferLength) {
	  this.state.previousEnd = 0
	  return cb()
	}

	if (bufferLength - this.state.previousEnd < data.length) {
	  this._prev = data
	  this.state.previousEnd -= (bufferLength - data.length)
	  return cb()
	}

	this._prev = buffer
	cb()
	}
}

const fs = require('fs')
const csvDocument = new CSVDocument();

const CSVParser = new CSVParser();

fs.createReadStream('./data.csv')
  .pipe(new CSVParser())
  .on('headers', (_headers) => csvDocument.setHeaders(_headers))
  .on('data', (_csvRow) => csvDocument.addCSVRow(_csvRow))
  .on('end', () => {
    console.log(csvDocument.toString());
    // [
    //   { NAME: 'Daffy Duck', AGE: '24' },
    //   { NAME: 'Bugs Bunny', AGE: '22' }
    // ]
  });
module.exports = CSVParser;