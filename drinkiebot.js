var Cylon = require('cylon');

Cylon.api("http", {host: "0.0.0.0", ssl: false});

Cylon.robot({
  name: "drinkiebot",
  connections: {
    edison: { adaptor: 'intel-iot' }
  },

  devices: {
    leds: { driver: 'rgb-led', redPin: 3, greenPin: 5, bluePin: 6 },
    gin: { driver: 'direct-pin', pin: 8 },
    vodka: { driver: 'direct-pin', pin: 9 },
    tonic: { driver: 'direct-pin', pin: 10 },
    ginger: { driver: 'direct-pin', pin: 11 },
    display: { driver: 'upm-jhd1313m1'}
  },

  writeToScreen: function(message) {
    this.display.setCursor(0,0);
    this.display.write(message);
  },

  clean: function() {
    this.writeToScreen("Cleaning mode ON");
  },

  makeGinTonic: function() {
    this.writeToScreen("Pouring Gin + Tonic");
    shot('gin');
    mixer('tonic');
  },

  makeVodkaTonic: function() {
    this.writeToScreen("Pouring Vodka + Tonic");
    shot('vodka');
    mixer('tonic');
  },

  makeMoscowMule: function() {
    this.writeToScreen("Pouring Moscow Mule");
    shot('vodka');
    mixer('ginger');
  },

  makeGinBuck: function() {
    this.writeToScreen("Pouring Gin Buck");
    shot('gin');
    mixer('ginger');
  },

  makeGingerAle: function() {
    this.writeToScreen("Pouring Ginger Ale");
    mixer('ginger');
  },

  shot: function(t) {
    this.devices[t].digitalWrite(1);
    after((1).seconds(), function() {
      this.devices[t].digitalWrite(0);
    });
  },

  mixer: function(t) {
    this.devices[t].digitalWrite(1);
    after((5).seconds(), function() {
      this.devices[t].digitalWrite(0);
    });
  },

  commands: function() {
    return {
      make_gin_tonic: this.makeGinTonic,
      make_vodka_tonic: this.makeVodkaTonic,
      make_moscow_mule: this.makeMoscowMule,
      make_gin_buck: this.makeGinBuck,
      make_ginger_ale: this.makeGingerAle,                  
      clean: this.clean
    };
  },

  work: function(my) {
    this.writeToScreen("Ready.");
    this.leds.setRGB(0x000000);
  }
}).start();
