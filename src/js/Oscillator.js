
var ObserverPattern = require("./ObserverPattern").ObserverPattern;

var _OscillatorBehaviour = {
	extend: function(extendable) {
		var _frequency = 1000; // per sec

		extendable.setFrequency = function(frequency) {
			_frequency = frequency;
		}		

		extendable.getFrequency = function() {
			return _frequency;
		}
	}
}

var OscillatorBehaviour = {
	extend: function(extendable) {
		var _timer = null;

		var _updateObservers = extendable.updateObservers;
		var _getFrequency = extendable.getFrequency;

		extendable.on = function() {
			if(!_timer) {
				_timer = setInterval(_updateObservers, 1000/_getFrequency());
			}
		}

		extendable.off = function() {
			if(_timer) {
				clearInterval(_timer);
				_timer = null;	
			}
		}
	}
}

var OscillatorFactory = {};
_OscillatorBehaviour.extend(OscillatorFactory);

OscillatorFactory.produce = function() {
	var produced = {};

	ObserverPattern.observable.extend(produced);
	_OscillatorBehaviour.extend(produced);
	OscillatorBehaviour.extend(produced);

	produced.setFrequency(OscillatorFactory.getFrequency());

	delete produced.updateObservers;
	delete produced.getFrequency;
	delete produced.setFrequency;

	return produced;
}

module.exports.OscillatorFactory = OscillatorFactory;