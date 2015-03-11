var Cylon = require('cylon');

var config = require("./config.json");

Cylon.api("http", {host: "0.0.0.0", ssl: false});

var connections = {
  edison: { adaptor: 'intel-iot' }
};

var devices = {
  leds: { driver: 'rgb-led', redPin: 3, greenPin: 5, bluePin: 6 },
  gin: { driver: 'direct-pin', pin: 8 },
  vodka: { driver: 'direct-pin', pin: 9 },
  tonic: { driver: 'direct-pin', pin: 10 },
  ginger: { driver: 'direct-pin', pin: 11 },
  display: { driver: 'upm-jhd1313m1'}
};

if (config.camera) {
  connections.opencv = { adaptor: "opencv" };
  devices.camera = { driver: "camera", camera: 1 };
}

Cylon.robot({
  name: "drinkiebot",

  events: ['making_drink', 'cleaning_mode'],

  connections: connections,
  devices: devices,

  writeToScreen: function(message) {
    this.display.setCursor(0,0);
    this.display.write(pad(message, 16));
  },

  clean: function() {
    this.writeToScreen("Cleaning mode ON");
  },

  makeGinTonic: function() {
    this.emit('making_drink', { data: 'gin-tonic'});
    this.leds.setRGB("00ffff");
    this.writeToScreen("Gin + Tonic");
    this.shot('gin');
    this.mixer('tonic');
    return "ok";
  },

  makeVodkaTonic: function() {
    this.emit('making_drink', { data: 'vodka-tonic'});
    this.leds.setRGB("ff8000");
    this.writeToScreen("Vodka + Tonic");
    this.shot('vodka');
    this.mixer('tonic');
    return "ok";
  },

  makeMoscowMule: function() {
    this.emit('making_drink', { data: 'moscow-mule'});
    this.leds.setRGB("ff0000");
    this.writeToScreen("Moscow Mule");
    this.shot('vodka');
    this.mixer('ginger');
    return "ok";
  },

  makeGinBuck: function() {
    this.emit('making_drink', { data: 'gin-buck'});
    this.leds.setRGB("00ff00");
    this.writeToScreen("Gin Buck");
    this.shot('gin');
    this.mixer('ginger');
    return "ok";
  },

  makeGingerAle: function() {
    this.emit('making_drink', { data: 'ginger-ale'});
    this.leds.setRGB("00cc00");
    this.writeToScreen("Ginger Ale");
    this.mixer('ginger');
    return "ok";
  },

  shot: function(t) {
    var self = this;
    self.devices[t].digitalWrite(1);
    after((3).seconds(), function() {
      self.devices[t].digitalWrite(0);
    });
  },

  mixer: function(t) {
    var self = this;
    self.devices[t].digitalWrite(1);
    after((15).seconds(), function() {
      self.devices[t].digitalWrite(0);
      self.readyToPour();
    });
  },

  takePhoto: function() {
    this.leds.setRGB("ffffff");
    if (config.camera) {
      // take photo here

      // then tweet it
    }
    this.leds.setRGB("000000");
  },

  commands: function() {
    return {
      make_gin_tonic: this.makeGinTonic,
      make_vodka_tonic: this.makeVodkaTonic,
      make_moscow_mule: this.makeMoscowMule,
      make_gin_buck: this.makeGinBuck,
      make_ginger_ale: this.makeGingerAle,
      take_photo: this.takePhoto,
      clean: this.clean
    };
  },

  readyToPour: function() {
    this.writeToScreen("Drinkiebot Ready");
    this.leds.setRGB("000000");
  },

  work: function(my) {
    this.readyToPour();
  }
}).start();

function pad(str, length) {
  return str.length < length ? pad(str + " ", length) : str;
};
