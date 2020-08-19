
var DeviceBehaviour = {
	extend: function(extendable) {
		var _uid = 0;

		extendable.getUid = function() {
			return _uid;
		}

		extendable.setUid = function(uid) {
			_uid = uid;
		}
	}
}

module.exports.DeviceBehaviour = DeviceBehaviour;