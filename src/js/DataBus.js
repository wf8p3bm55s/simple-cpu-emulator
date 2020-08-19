
var DeviceBehaviour = require("./Device").DeviceBehaviour;
var BusFactory = require("./Bus").BusFactory;

var DataBusFactory = {};
DeviceBehaviour.extend(DataBusFactory);

DataBusFactory.produce = function() {

	BusFactory.setUid(DataBusFactory.getUid());
	BusFactory.setMaxValue(Math.pow(2, 16) - 1);

	return BusFactory.produce();
}

module.exports.DataBusFactory = DataBusFactory;