
var _BusManagerBehaviour = {
	extend: function(extendable) {		
		var _ab = null;
		var _cb = null;
		var _db = null;

		extendable.setAddressBus = function(ab) {
			_ab = ab;
		}

		extendable.setControlBus = function(cb) {
			_cb = cb;
		}

		extendable.setDataBus = function(db) {
			_db = db;
		}

		extendable.getAddressBus = function(ab) {
			return _ab;
		}

		extendable.getControlBus = function(cb) {
			return _cb;
		}

		extendable.getDataBus = function(db) {
			return _db;
		}
	}
}

module.exports._BusManagerBehaviour = _BusManagerBehaviour;