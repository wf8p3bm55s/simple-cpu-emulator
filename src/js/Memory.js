
var _MemoryBehaviour = {
	extend: function(extendable) {
		var _size = 0;

		/*
			size: number, // in bytes
		*/
		extendable.setSize = function(size) {
			_size = size;
		}

		extendable.getSize = function() {
			return _size;
		}
	}
}

var MemoryBehaviour = {
	extend: function(extendable) {
		var _data = [];

		var _getSize = extendable.getSize;
		var _writeByte = null;
		var _readByte = null;

		/*
			offset: number // number of byte
		*/
		extendable.readByte = function(offset) {
			if(_getSize() > offset && offset >= 0) {
				return _data[offset];
			} else {
				return null;
			}
		}

		/*
			offset: number, // number of byte
			count: number, // bytes count
		*/
		extendable.readBytes = function(offset, count) {
			var result = [];
			for(var i = 0; i < count; i++) {
				result.push(_readByte(offset + i));
			}

			return result;
		}

		extendable.writeByte = function(offset, byte) {
			if(_getSize() > offset && offset >= 0) {
				_data[offset] = byte;
				return true;
			} else {
				return false;
			}	
		}

		extendable.writeBytes = function(offset, bytes) {
			for(var i = 0; i < bytes.length; i++) {
				if(!_writeByte(offset + i, bytes[i])) {
					return false;
				}
			}

			return true;
		}

		var _init = function() {
			var size = _getSize();
			for(var i = 0; i < size; i++) {
				_data[i] = 0;
			}

			_writeByte = extendable.writeByte;
			_readByte = extendable.readByte;
		}

		_init();
	}
}

MemoryFactory = {};

_MemoryBehaviour.extend(MemoryFactory);

MemoryFactory.produce = function() {
	var produced = {};

	_MemoryBehaviour.extend(produced);
	produced.setSize(MemoryFactory.getSize());
	MemoryBehaviour.extend(produced);

	delete produced.setSize;

	return produced;
}

module.exports._MemoryBehaviour = _MemoryBehaviour;
module.exports.MemoryFactory = MemoryFactory;