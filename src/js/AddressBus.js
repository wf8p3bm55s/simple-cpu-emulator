var DeviceBehaviour = require("./Device").DeviceBehaviour;
var BusFactory = require("./Bus").BusFactory;

var AddressBusFactory = {};
DeviceBehaviour.extend(AddressBusFactory);

AddressBusFactory.produce = function() {

	BusFactory.setUid(AddressBusFactory.getUid());
	BusFactory.setMaxValue(Math.pow(2, 10) - 1);

	return BusFactory.produce();
}

module.exports.AddressBusFactory = AddressBusFactory;