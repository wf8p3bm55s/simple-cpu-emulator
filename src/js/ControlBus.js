
var DeviceBehaviour = require("./Device").DeviceBehaviour;
var BusFactory = require("./Bus").BusFactory;

/* 
	Move this behaviour to _ControlBusBehaviour and
	extend them a factory
*/
var ControlBusBehaviour = {
	extend: function(extendable) {
		extendable.WRITE_PORT = 0;
		extendable.READ_RAM = 1;
		extendable.WRITE_RAM = 2;
		extendable.READ_ROM = 3;
	}
}

var ControlBusFactory = {};
DeviceBehaviour.extend(ControlBusFactory);

ControlBusFactory.produce = function() {
	var produced = {};

	BusFactory.setUid(ControlBusFactory.getUid());
	BusFactory.setMaxValue(Math.pow(2, 2) - 1);

	produced = BusFactory.produce();
	ControlBusBehaviour.extend(produced);

	return produced;
}

module.exports.ControlBusFactory = ControlBusFactory;