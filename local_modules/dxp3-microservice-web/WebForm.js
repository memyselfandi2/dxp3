const net = require('dxp3-net');

const HTTPForm = net.HTTPForm;

class WebForm extends HTTPForm {
	constructor(args) {
		super(args);
	}
}

module.exports = WebForm;