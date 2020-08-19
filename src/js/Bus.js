
var DeviceBehaviour = require("./Device").DeviceBehaviour;
var ObserverPattern = require("./ObserverPattern").ObserverPattern;

var _BusBehaviour = {
	extend: function(extendable) {
		var _maxValue = 255; // width bus
		
		extendable.setMaxValue = function(value) {
			if(value > 0) {
				_maxValue = value;
				return true;
			} else {
				return false;
			}
		}

		extendable.getMaxValue = function() {
			return _maxValue;
		}
	}
}

var BusBehaviour = {
	extend: function(extendable) {
		var _value = 0;

		var _getMaxValue = extendable.getMaxValue;
		var _updateObservers = extendable.updateObservers;

		extendable.setValue = function(value) {
			console.log("Max bus value is: " + _getMaxValue() + " try to set value: " + value);
			if(_getMaxValue() >= value && value >= 0) {
				_value = value;
				console.log("Update memory obs: " + value);
				_updateObservers(value);
				return true;
			} else {
				return false;
			}
		}

		extendable.getValue = function() {
			return _value;
		}
	}
}

var BusFactory = {};
DeviceBehaviour.extend(BusFactory);
_BusBehaviour.extend(BusFactory);

BusFactory.produce = function() {
	var produced = {};

	ObserverPattern.observable.extend(produced);
	DeviceBehaviour.extend(produced);
	_BusBehaviour.extend(produced);	
	BusBehaviour.extend(produced);

	produced.setUid(BusFactory.getUid());
	produced.setMaxValue(BusFactory.getMaxValue());

	delete produced.updateObservers;
	delete produced.setUid;
	delete produced.setMaxValue;
	delete produced.getMaxValue;

	return produced;
}

module.exports.BusFactory = BusFactory;