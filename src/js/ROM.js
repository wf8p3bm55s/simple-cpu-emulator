
var	ObserverPattern = require("./ObserverPattern").ObserverPattern;

var _BusManagerBehaviour = require("./BusManager")._BusManagerBehaviour;
var DeviceBehaviour = require("./Device").DeviceBehaviour;

var MemoryFactory = require("./Memory").MemoryFactory;
var _MemoryBehaviour = require("./Memory")._MemoryBehaviour;

var _MemoryControllerBehaviour = require("./MemoryController")._MemoryControllerBehaviour;
var MemoryControllerBehaviour = require("./MemoryController").MemoryControllerBehaviour;

var ROMBehaviour = {
	extend: function(extendable) {
		var _writeBytes = extendable.writeBytes;

		extendable.flash = function(bytes) {
			var size = extendable.getSize();

			if(bytes.length > size) {
				return false;
			}

			_writeBytes(0, bytes)
			_writeBytes(bytes.length, size);

			return true;
		}
	}
}

var ROMFactory = {};
DeviceBehaviour.extend(ROMFactory);
_BusManagerBehaviour.extend(ROMFactory);
_MemoryBehaviour.extend(ROMFactory);
_MemoryControllerBehaviour.extend(ROMFactory);

ROMFactory.produce = function() {
	var produced = {};

	MemoryFactory.setSize(ROMFactory.getSize());
	produced = MemoryFactory.produce();
	ROMBehaviour.extend(produced);

	ObserverPattern.observer.extend(produced);

	DeviceBehaviour.extend(produced);
	produced.setUid(ROMFactory.getUid());

	_BusManagerBehaviour.extend(produced);
	produced.setAddressBus(ROMFactory.getAddressBus());
	produced.setControlBus(ROMFactory.getControlBus());
	produced.setDataBus(ROMFactory.getDataBus());

	_MemoryControllerBehaviour.extend(produced);
	produced.setMemory(produced);
	produced.setMemoryType(1);
	MemoryControllerBehaviour.extend(produced);

	delete produced.setUid;

	delete produced.setAddressBus;
	delete produced.setControlBus;
	delete produced.setDataBus;

	delete produced.getAddressBus;
	delete produced.getControlBus;
	delete produced.getDataBus;	

	delete produced.writeByte;
	delete produced.writeBytes;

	delete produced.setMemory;
	delete produced.getMemory;

	delete produced.setMemoryType;
	delete produced.getMemoryType;

	delete produced.setUpdateHandler;
	delete produced.update;

	return produced;
}

module.exports.ROMFactory = ROMFactory;
