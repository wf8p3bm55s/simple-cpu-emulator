
var	ObserverPattern = require("./ObserverPattern").ObserverPattern;

var _BusManagerBehaviour = require("./BusManager")._BusManagerBehaviour;
var DeviceBehaviour = require("./Device").DeviceBehaviour;

var MemoryFactory = require("./Memory").MemoryFactory;
var _MemoryBehaviour = require("./Memory")._MemoryBehaviour;

var _MemoryControllerBehaviour = require("./MemoryController")._MemoryControllerBehaviour;
var MemoryControllerBehaviour = require("./MemoryController").MemoryControllerBehaviour;

var RAMFactory = {};

DeviceBehaviour.extend(RAMFactory);
_BusManagerBehaviour.extend(RAMFactory);
_MemoryBehaviour.extend(RAMFactory);
_MemoryControllerBehaviour.extend(RAMFactory);

RAMFactory.produce = function() {
	var produced = {};

	MemoryFactory.setSize(RAMFactory.getSize());
	produced = MemoryFactory.produce();

	ObserverPattern.observer.extend(produced);

	DeviceBehaviour.extend(produced);
	produced.setUid(RAMFactory.getUid());

	_BusManagerBehaviour.extend(produced);
	produced.setAddressBus(RAMFactory.getAddressBus());
	produced.setControlBus(RAMFactory.getControlBus());
	produced.setDataBus(RAMFactory.getDataBus());

	_MemoryControllerBehaviour.extend(produced);
	produced.setMemory(produced);
	produced.setMemoryType(0);
	MemoryControllerBehaviour.extend(produced);

	delete produced.setUid;

	delete produced.setAddressBus;
	delete produced.setControlBus;
	delete produced.setDataBus;

	delete produced.getAddressBus;
	delete produced.getControlBus;
	delete produced.getDataBus;	

	delete produced.setMemory;
	delete produced.getMemory;

	delete produced.setMemoryType;
	delete produced.getMemoryType;

	delete produced.setUpdateHandler;
	delete produced.update;

	return produced;
}

module.exports.RAMFactory = RAMFactory;
