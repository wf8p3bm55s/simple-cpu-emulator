
var ObserverPattern = {
    observable: {
        extend: function(extendable) {
            var _observers = {};

            extendable.addObserver = function(path, observerObj) {
                _observers[path] = observerObj;
            }

            extendable.deleteObserver = function(path) {
                delete _observers[path];
            }

            extendable.updateObservers = function(obj) {
                for(var path in _observers) {
                    _observers[path].update(path, obj);
                }
            }
        }
    },
    observer: {
        extend: function(extendable) {
            var _handlers = {};

            extendable.setUpdateHandler = function(path, func) {
                _handlers[path] = func;
            }

            extendable.update = function(path, obj) {
                // if(_handlers[path])
                _handlers[path](obj);
            }
        }
    }
};

module.exports.ObserverPattern = ObserverPattern;