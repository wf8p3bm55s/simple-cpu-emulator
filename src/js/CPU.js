
var DeviceBehaviour = require("./Device").DeviceBehaviour;
var _BusManagerBehaviour = require("./BusManager")._BusManagerBehaviour;
var ObserverPattern = require("./ObserverPattern").ObserverPattern;
var PortFactory = require("./Port").PortFactory;

var _CPUBehaviour = {
	extend: function(extendable) {
		var _port = null;

		extendable.setPort = function(port) {
			_port = port;
		}

		extendable.getPort = function() {
			return _port;
		}
	}
}

var CPUBehaviour = {
	extend: function(extendable) {
		// Registers
		var _CMD = 0; // 2 byte
		var _CARRY_BIT = false; // 1 bit

		var _A = 0; // 1 byte
		var _B = 0; // 1 byte

		var _R0 = 0; // 1 byte
		var _R1 = 0; // 1 byte

		var __TEMP = 0; // 1 byte

		var _STATES = {			
			"execCmd": 0,
			"setAddrBusToPc": 1,
			"setControlBusToReadRom": 2,
			"getDataFromDataBusToCmd": 3,
			"_movSetControlBusToReadRam": 4,
			"_movGetDataFromDataBusToA": 5,
			"_jsSetControlBusToReadRam": 6,
			"_xchSetControlBusToReadRam": 7,
			"_xchGetDataFromDataBus": 8,
			"_xchSetDataToDataBus": 9,
			"_xchSetControlBusToWriteRam": 10,
			"_addSetControlBusToReadRam": 11,
			"_addGetDataFromDataBus": 12,
			"_addcSetControlBusToReadRam": 13,
			"_addcGetDataFromDataBus": 14,
			"_subbSetControlBusToReadRam": 15,
			"_subbGetDataFromDataBus": 16,
			"_incSetControlBusToReadRam": 17,
			"_incGetDataFromDataBus": 18,
			"_incSetDataToDataBus": 19,
			"_incSetControlBusToWriteRam": 20,
			"_decSetControlBusToReadRam": 21,
			"_decGetDataFromDataBus": 22,
			"_decSetDataToDataBus": 23,
			"_decSetControlBusToWriteRam": 24,
			"_anlSetControlBusToReadRam": 25,
			"_anlGetDataFromDataBus": 26,
			"_orlSetControlBusToReadRam": 27,
			"_orlGetDataFromDataBus": 28,
			"_xrlSetControlBusToReadRam": 29,
			"_xrlGetDataFromDataBus": 30,
		};

		var _state = _STATES["setAddrBusToPc"];
		var _pc = 0; // programm counter

		var _getAddressBus = extendable.getAddressBus;
		var _getControlBus = extendable.getControlBus;
		var _getDataBus = extendable.getDataBus;

		var _getPort = extendable.getPort;

		var _updateObservers = extendable.updateObservers;

		var _exec = function(cmd) {
			console.log("CMD " + cmd);
			var instruction = (cmd & 0b1111000000000000) >> 12;
			var data = cmd & 0b0000111111111111;
			console.log(instruction);
			console.log(data);
			switch(instruction) {
				case 0: _mov(data);
						break;
				case 1: _jmp(data);	// jump to a rom adress
						break;
				case 2: _xch(data);
						break;
				case 3: _add(data);
						break;
				case 4: _addc(data);
						break;
				case 5: _subb(data);
						break;
				case 6: _inc(data);
						break;
				case 7: _dec(data);
						break;
				case 8: _mul();
						break;
				case 9: _div();
						break;
				case 10: _anl(data);
						break;
				case 11: _orl(data);
						break;
				case 12: _xrl(data);
						break;
				case 13: _clr();
						break;
				case 14: _cpl();
						break;
				case 15: _jnc(data); // 
						break;
			}
		}

		var _pc_next = function() {
			// Width of the address bus: 2 ^ 10 - 1
			if(_pc < 1022) {
				_pc+=2;
			} else {
				_pc = 0;
			}
		}

		var _mov = function(data) {
			/*
				to:
					000000 - A
				from:
					000000 - A
					010000 - Port
					100000 - Register R0
					100001 - Register R1
					11xxxx - Address RAM
				to:
					000000 - A
					010000 - Port
					100000 - Register R0
					100001 - Register R1
					11xxxx - Address RAM
				from:
					000000 - A
			*/

			if((((data & 0b110000000000) >> 10) == 0) && (((data & 0b000000110000) >> 4) == 0)) {
				_A = _A;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if((((data & 0b110000000000) >> 10) == 0) && (((data & 0b000000110000) >> 4) == 1)) {
				_A = _getPort().getValue();
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if((((data & 0b110000000000) >> 10) == 0) && (((data & 0b000000110000) >> 4) == 2)) {
				if((data & 0b000000000011) == 0) {
					_A = _R0;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _R1;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if((((data & 0b110000000000) >> 10) == 0) && (((data & 0b000000110000) >> 4) == 3)) {
				if(_state == _STATES["execCmd"]) {
					_getAddressBus().setValue(data & 0b000000001111);
					_state = _STATES["_movSetControlBusToReadRam"];
					console.log("execCmd" + _getAddressBus().getValue());
					return;
				}

				if(_state == _STATES["_movSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_movGetDataFromDataBusToA"];
					return;
				}

				if(_state == _STATES["_movGetDataFromDataBusToA"]) {
					_A = _getDataBus().getValue();
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if((((data & 0b110000000000) >> 10) == 0) && (((data & 0b000000110000) >> 4) == 0)) {
				_A = _A;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if((((data & 0b110000000000) >> 10) == 1) && (((data & 0b000000110000) >> 4) == 0)) {
				_getPort().setValue(_A);	
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if((((data & 0b110000000000) >> 10) == 2) && (((data & 0b000000110000) >> 4) == 0)) {
				if(((data & 0b000000110000) >> 4) == 0) {
					_R0 = _A;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if(((data & 0b000000110000) >> 4) == 1) {
					_R1 = _A;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if((((data & 0b110000000000) >> 10) == 3) && (((data & 0b000000110000) >> 4) == 0)) {
				if(_state == _STATES["execCmd"]) {
					_getAddressBus().setValue((data & 0b001111000000) >> 6);
					_state = _STATES["_movSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_movSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_movGetDataFromDataBusToA"];
					return;
				}

				if(_state == _STATES["_movGetDataFromDataBusToA"]) {
					_A = _getDataBus().getValue();
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

		}

		var _jmp = function(data) {
			_pc = data;
			_state = _STATES["setAddrBusToPc"];
			return;
		}

		var _xch = function(data) {
			/*
				exchange A to:
					000000000000 - Register R0
					010000000000 - Register R1
					10xxxxxxxxxx - Address RAM
			*/
			if(((data & 0b110000000000) >> 10) == 0) {
				__TEMP = _A;
				_A = _R0;
				_R0 = __TEMP;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				__TEMP = _A;
				_A = _R1;
				_R1 = __TEMP;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;	
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_xchSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_xchSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_xchGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_xchGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_state = _STATES["_xchSetDataToDataBus"];
					return;
				}

				if(_state == _STATES["_xchSetDataToDataBus"]) {
					_getDataBus().setValue(_A);
					_state = _STATES["_xchSetControlBusToWriteRam"];
					return;
				}

				if(_state == _STATES["_xchSetControlBusToWriteRam"]) {
					_getControlBus().setValue(_getControlBus().WRITE_RAM);
					_A = __TEMP;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}
		}

		/* a, b 1 bytes */
		var _safeAdd = function(a, b) {
			var result = a + b;
			
			if(result > 255) {
				_CARRY_BIT = true;
			} else {
				_CARRY_BIT = false;
			}

			return result % 256;
		}

		var _safeAddc = function(a, b, carry_bit) {
			var result = a + b;

			if(carry_bit) {
				result += 1;
			}
			
			if(result > 255) {
				_CARRY_BIT = true;
			} else {
				_CARRY_BIT = false;
			}

			return result % 256;
		}

		var _add = function(data) {
			/*
				add A to:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address RAM
					11xxxxxxxxxx - Data
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _safeAdd(_A, _A);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_A = _safeAdd(_A, _R0);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _safeAdd(_A, _R1);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_addSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_addSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_addGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_addGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_A = _safeAdd(_A, __TEMP);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 3) {
				_A = _safeAdd(_A, data & 0b001111111111);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}
		}

		var _addc = function(data) {
			/*
				add A and Carry bit to:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address RAM
					11xxxxxxxxxx - Data
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _safeAddc(_A, _A, _CARRY_BIT);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_A = _safeAddc(_A, _R0, _CARRY_BIT);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _safeAddc(_A, _R1, _CARRY_BIT);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_addcSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_addcSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_addcGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_addcGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_A = _safeAddc(_A, __TEMP, _CARRY_BIT);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 3) {
				_A = _safeAddc(_A, data & 0b001111111111, _CARRY_BIT);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}
		}

		/* a - b 1 bytes */
		var _safeSubb = function(a, b, carry_bit) {
			var result = 0;

			if(carry_bit) {
				carry_bit = 1;
			} else {
				carry_bit = 0;
			}

			if(a - b - carry_bit < 0) {
				a += 256;
				result = a - b - carry_bit;
				_CARRY_BIT = true;
			} else {
				result = a - b - carry_bit;
				_CARRY_BIT = false;
			}

			return result;
		}

		var _subb = function(data) {
			/*
				sub from A a Carry bit and:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address RAM
					11xxxxxxxxxx - Data
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _safeSubb(_A, _A, _CARRY_BIT);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_A = _safeSubb(_A, _R0, _CARRY_BIT);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _safeSubb(_A, _R1, _CARRY_BIT);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_subbSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_subbSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_subbGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_subbGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_A = _safeSubb(_A, __TEMP, _CARRY_BIT);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 3) {
				_A = _safeSubb(_A, data & 0b001111111111, _CARRY_BIT);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}
		}

		var _safeInc = function(a) {
			var result = a + 1;
			if(result > 255) {
				_CARRY_BIT = true;
			} else {
				_CARRY_BIT = false;
			}

			return result % 256;
		}

		var _inc = function(data) {
			/*
				Increment:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address RAM
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _safeInc(_A);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_R0 = _safeInc(_R0);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_R1 = _safeInc(_R1);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_incSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_incSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_incGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_incGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					__TEMP = _safeInc(__TEMP);
					_state = _STATES["_incSetDataToDataBus"];
					return;
				}

				if(_state == _STATES["_incSetDataToDataBus"]) {
					_getDataBus().setValue(__TEMP);
					_state = _STATES["_incSetControlBusToWriteRam"];
					return;
				}

				if(_state == _STATES["_incSetControlBusToWriteRam"]) {
					_getControlBus().setValue(_getControlBus().WRITE_RAM);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}
		}

		var _safeDec = function(a) {
			var result = a - 1;
			if(result < 0) {
				a += 256;
				_CARRY_BIT = true;
			} else {
				_CARRY_BIT = false;
			}

			return result;
		}

		var _dec = function(data) {
			/*
				Decrement:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address RAM
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _safeDec(_A);
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_R0 = _safeDec(_R0);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_R1 = _safeDec(_R1);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_decSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_decSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_decGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_decGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					__TEMP = _safeDec(__TEMP);
					_state = _STATES["_decSetDataToDataBus"];
					return;
				}

				if(_state == _STATES["_decSetDataToDataBus"]) {
					_getDataBus().setValue(__TEMP);
					_state = _STATES["_decSetControlBusToWriteRam"];
					return;
				}

				if(_state == _STATES["_decSetControlBusToWriteRam"]) {
					_getControlBus().setValue(_getControlBus().WRITE_RAM);
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}
		}

		var _mul = function() {
			/*
				Multiply A to B:
					000000000000
			*/

			var result = _A * _B;

			_A = result & 0b0000000011111111;
			_B = (result & 0b1111111100000000) >> 8;

			_state = _STATES["setAddrBusToPc"];
			_pc_next();
			return;
		}

		var _div = function() {
			/*
				Divide A to B:
					000000000000
			*/
			var a = _A;
			var b = _B;

			_A = (a - a % b) / b;
			_B = a % b;

			_state = _STATES["setAddrBusToPc"];
			_pc_next();
			return;
		}

		var _anl = function(data) {
			/*
				Logical AND of A and:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address ROM
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _A & _A;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_A = _A & _R0;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _A & _R1;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_anlSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_anlSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_anlGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_anlGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_A = _A & __TEMP;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}
		}

		var _orl = function(data) {
						/*
				Logical OR of A and:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address ROM
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _A | _A;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_A = _A | _R0;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _A | _R1;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_orlSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_orlSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_orlGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_orlGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_A = _A | __TEMP;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}
		}

		var _xrl = function(data) {
			/*
				Logical XOR of A and:
					000000000000 - A
					010000000000 - Register R0
					010000000001 - Register R1
					10xxxxxxxxxx - Address ROM
			*/

			if(((data & 0b110000000000) >> 10) == 0) {
				_A = _A ^ _A;
				_state = _STATES["setAddrBusToPc"];
				_pc_next();
				return;
			}

			if(((data & 0b110000000000) >> 10) == 1) {
				if((data & 0b000000000011) == 0) {
					_A = _A ^ _R0;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}

				if((data & 0b000000000011) == 1) {
					_A = _A ^ _R1;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}

			if(((data & 0b110000000000) >> 10) == 2) {
				if(_state == _STATES["execCmd"]) {
					var addr = data & 0b001111111111;
					_getAddressBus().setValue(addr);
					_state = _STATES["_xrlSetControlBusToReadRam"];
					return;
				}

				if(_state == _STATES["_xrlSetControlBusToReadRam"]) {
					_getControlBus().setValue(_getControlBus().READ_RAM);
					_state = _STATES["_xrlGetDataFromDataBus"];
					return;
				}

				if(_state == _STATES["_xrlGetDataFromDataBus"]) {
					__TEMP = _getDataBus().getValue();
					_A = _A ^ __TEMP;
					_state = _STATES["setAddrBusToPc"];
					_pc_next();
					return;
				}
			}
		}

		var _clr = function() {
			/*
				Clear A
			*/
			_A = 0;	
			_state = _STATES["setAddrBusToPc"];
			_pc_next();
			return;
		}

		var _cpl = function() {
			/*
				Invert A
			*/
			_A = ~_A & 0b11111111;
			_state = _STATES["setAddrBusToPc"];
			_pc_next();
			return;
		}

		var _jnc = function(data) {
			if(!_CARRY_BIT) {
				_pc = data;
			}

			_state = _STATES["setAddrBusToPc"];
			return;
		}

		var _oscillatorUpdate = function() {

			// conveyor ??
			if(_state == _STATES["setAddrBusToPc"]) {
				_getAddressBus().setValue(_pc);
				console.log("address bus value setted " + _getAddressBus().getValue());
				_state = _STATES["setControlBusToReadRom"];

				_updateObservers({
					CMD: _CMD,
					CARRY_BIT: _CARRY_BIT,
					A: _A,
					B: _B,
					R0: _R0,
					R1: _R1,
					TEMP: __TEMP,
					state: _state,
					pc: _pc,
					port: _getPort().getValue(),
				});
				return;
			}

			if(_state == _STATES["setControlBusToReadRom"]) {
				_getControlBus().setValue(_getControlBus().READ_ROM);
				console.log(_getControlBus());
				console.log("control bus value setted " + _getControlBus().getValue());
				_state = _STATES["getDataFromDataBusToCmd"];

				_updateObservers({
					CMD: _CMD,
					CARRY_BIT: _CARRY_BIT,
					A: _A,
					B: _B,
					R0: _R0,
					R1: _R1,
					TEMP: __TEMP,
					state: _state,
					pc: _pc,
					port: _getPort().getValue(),
				});
				return;
			}

			if(_state == _STATES["getDataFromDataBusToCmd"]) {

				_CMD = _getDataBus().getValue();
				_state = _STATES["execCmd"];

				_updateObservers({
					CMD: _CMD,
					CARRY_BIT: _CARRY_BIT,
					A: _A,
					B: _B,
					R0: _R0,
					R1: _R1,
					TEMP: __TEMP,
					state: _state,
					pc: _pc,
					port: _getPort().getValue(),
				});
				return;
			}

			if(	_state == _STATES["execCmd"] ||
				_state == _STATES["_movSetControlBusToReadRam"] ||
				_state == _STATES["_movGetDataFromDataBusToA"] ||
				_state == _STATES["_jsSetControlBusToReadRam"] ||
				_state == _STATES["_xchSetControlBusToReadRam"] ||
				_state == _STATES["_xchGetDataFromDataBus"] ||
				_state == _STATES["_xchSetDataToDataBus"] ||
				_state == _STATES["_xchSetControlBusToWriteRam"] ||
				_state == _STATES["_addSetControlBusToReadRam"] ||
				_state == _STATES["_addGetDataFromDataBus"] ||
				_state == _STATES["_addcSetControlBusToReadRam"] ||
				_state == _STATES["_addcGetDataFromDataBus"] ||
				_state == _STATES["_subbSetControlBusToReadRam"] ||
				_state == _STATES["_subbGetDataFromDataBus"] ||
				_state == _STATES["_incSetControlBusToReadRam"] ||
				_state == _STATES["_incGetDataFromDataBus"] ||
				_state == _STATES["_incSetDataToDataBus"] ||
				_state == _STATES["_incSetControlBusToWriteRam"] ||
				_state == _STATES["_decSetControlBusToReadRam"] ||
				_state == _STATES["_decGetDataFromDataBus"] ||
				_state == _STATES["_decSetDataToDataBus"] ||
				_state == _STATES["_decSetControlBusToWriteRam"] ||
				_state == _STATES["_anlSetControlBusToReadRam"] ||
				_state == _STATES["_anlGetDataFromDataBus"] ||
				_state == _STATES["_orlSetControlBusToReadRam"] ||
				_state == _STATES["_orlGetDataFromDataBus"] ||
				_state == _STATES["_xrlSetControlBusToReadRam"] ||
				_state == _STATES["_xrlGetDataFromDataBus"]) {

				_exec(_CMD);

				_updateObservers({
					CMD: _CMD,
					CARRY_BIT: _CARRY_BIT,
					A: _A,
					B: _B,
					R0: _R0,
					R1: _R1,
					TEMP: __TEMP,
					state: _state,
					pc: _pc,
					port: _getPort().getValue(),
				});

				return;
			}
		}

		extendable.getPort = function() {
			return _getPort();
		}

		extendable.reset = function() {
			console.log("reset");
			_CMD = 0;
			_CARRY_BIT = false;

			_A = 0;
			_B = 0;

			_R0 = 0;
			_R1 = 0;

			__TEMP = 0;

			_state = _STATES["setAddrBusToPc"];
			_pc = 0;
		}

		_init = function() {
			extendable.setUpdateHandler("cpu", _oscillatorUpdate);
		}

		_init();
	}
}

var CPUFactory = {};
_BusManagerBehaviour.extend(CPUFactory);
DeviceBehaviour.extend(CPUFactory);

CPUFactory.produce = function() {
	var produced = {};

	ObserverPattern.observer.extend(produced);
	ObserverPattern.observable.extend(produced);
	DeviceBehaviour.extend(produced);
	_BusManagerBehaviour.extend(produced);

	_CPUBehaviour.extend(produced);
	CPUBehaviour.extend(produced);

	produced.setUid(CPUFactory.getUid());
	produced.setAddressBus(CPUFactory.getAddressBus());
	produced.setControlBus(CPUFactory.getControlBus());
	produced.setDataBus(CPUFactory.getDataBus());

	produced.setPort(PortFactory.produce());
	
	delete produced.setUid;
	delete produced.setAddressBus;
	delete produced.setControlBus;
	delete produced.setDataBus;

	delete produced.getAddressBus;
	delete produced.getControlBus;
	delete produced.getDataBus;

	delete produced.setPort;
	delete produced.getPort;

	delete produced.setUpdateHandler;
	delete produced.updateObservers;

	return produced;
}

module.exports.CPUFactory = CPUFactory;