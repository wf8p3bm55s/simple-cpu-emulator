
var AddressBusFactory = require("./js/AddressBus").AddressBusFactory;
var ControlBusFactory = require("./js/ControlBus").ControlBusFactory;
var DataBusFactory = require("./js/DataBus").DataBusFactory;

var RAMFactory = require("./js/RAM").RAMFactory;
var ROMFactory = require("./js/ROM").ROMFactory;

var CPUFactory = require("./js/CPU").CPUFactory;

var OscillatorFactory = require("./js/Oscillator").OscillatorFactory;

var MemoryControllerFactory = require("./js/MemoryController").MemoryControllerFactory;

AddressBusFactory.setUid(0);
ControlBusFactory.setUid(1);
DataBusFactory.setUid(2);

RAMFactory.setUid(3);
ROMFactory.setUid(4);

CPUFactory.setUid(5);

OscillatorFactory.setFrequency(1);

RAMFactory.setSize(256);
ROMFactory.setSize(256);

var ab = AddressBusFactory.produce();
var cb = ControlBusFactory.produce();
var db = DataBusFactory.produce();

RAMFactory.setAddressBus(ab);
RAMFactory.setControlBus(cb);
RAMFactory.setDataBus(db);

ROMFactory.setAddressBus(ab);
ROMFactory.setControlBus(cb);
ROMFactory.setDataBus(db);

CPUFactory.setAddressBus(ab);
CPUFactory.setControlBus(cb);
CPUFactory.setDataBus(db);

var ram = RAMFactory.produce();
var rom = ROMFactory.produce();

var cpu = CPUFactory.produce();

var oscillator = OscillatorFactory.produce();

oscillator.addObserver("cpu", cpu);

window.cpu = cpu;
window.oscillator = oscillator;
window.ram = ram;
window.rom = rom;