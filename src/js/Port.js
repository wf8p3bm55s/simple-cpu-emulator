
var BusFactory = require("./Bus").BusFactory;

var PortFactory = {};

PortFactory.produce = function() {
	var produced = {};

	BusFactory.setUid(-1);
	BusFactory.setMaxValue(2 ^ 8 - 1);

	return BusFactory.produce();
}

module.exports.PortFactory = PortFactory;