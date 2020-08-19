
var _BusManagerBehaviour = require("./BusManager")._BusManagerBehaviour;

var _MemoryControllerBehaviour = {
	extend: function(extendable) {
		var _memory = null;
		var _memoryType = null;

		extendable.setMemory = function(memory) {
			_memory = memory;
		}

		extendable.getMemory = function(memory) {
			return _memory;
		}

		extendable.setMemoryType = function(type) {
			_memoryType = type;
		}

		extendable.getMemoryType = function() {
			return _memoryType;
		}
	}
}

var MemoryControllerBehaviour = {
	extend: function(extendable) {
		var _getMemory = extendable.getMemory;
		var _getMemoryType = extendable.getMemoryType;

		var _getAddressBus = extendable.getAddressBus;
		var _getControlBus = extendable.getControlBus;
		var _getDataBus = extendable.getDataBus;

		var _read_ram = function() {
			var offset = _getAddressBus().getValue();
			// Hardware word width
			var data = _getMemory().readBytes(offset, 2);
			console.log("Memory controller: " + data);
			_getDataBus().setValue(data[0] * 256 + data[1]);
		}

		var _read_rom = _read_ram;

		var _write_ram = function() {
			if(_getMemory().writeBytes) {
				var offset = _getAddressBus().getValue();
				var data = _getDataBus().getValue();
				
				_getMemory().writeBytes(offset, [(data - data % 256) / 256, data % 256]);
			}
		}

		var _controlBusUpdate = function(path, value) {
			var cb = _getControlBus();
			console.log("Mmory update: " + value);
			switch(_getMemoryType()) {
				case 0:
					if(value == cb.READ_RAM) {
						console.log("read ram ");
						_read_ram();
					}
					if(value == cb.WRITE_RAM) {
						console.log("write ram ");
						_write_ram();
					}
					break;
				case 1:
					if(value == cb.READ_ROM) {
						console.log("read rom ");
						_read_rom();
					}
					break;
			}
		}

		var _init = function() {
			_getControlBus().addObserver("memoryController", {
				update: _controlBusUpdate
			});
			// extendable.setUpdateHandler("controlBus", _controlBusUpdate);
		}

		_init();
	}
}

module.exports._MemoryControllerBehaviour = _MemoryControllerBehaviour;
module.exports.MemoryControllerBehaviour = MemoryControllerBehaviour;