var Cylon = require('cylon');
var imgur = require('./imgur');
var fs = require('fs');

var config = require("./config.json");


Cylon.api("http", {host: "0.0.0.0", ssl: false});

if (config.mqtt) {
  Cylon.api("mqtt", {
    broker: 'mqtt://test.mosquitto.org',
    prefix: 'drinkiebot', // Optional
  });
}

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
  devices.camera = {
    driver: "camera",
    camera: config.cameraId,
    haarcascade: "./haarcascade_frontalface_alt.xml",
    connection: "opencv"
  };
}

Cylon.robot({
  name: "drinkiebot",

  events: ['making_drink', 'cleaning_mode'],

  connections: connections,
  devices: devices,

  cameraReady: false,

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
    after((2).seconds(), function() {
      self.devices[t].digitalWrite(0);
    });
  },

  mixer: function(t) {
    var self = this;
    self.devices[t].digitalWrite(1);
    after((5).seconds(), function() {
      self.devices[t].digitalWrite(0);
      self.readyToPour();
    });
  },

  takePhoto: function() {
    var that = this;

    that.leds.setRGB("ffffff");
    if (config.camera && that.cameraReady) {
      that.camera.readFrame();
      that.camera.once("frameReady", function(err, im) {
        that.camera.detectFaces(im);
      });

      that.opencv.once('facesDetected', function(err, im, faces) {
        var biggest = 0,
            face = null;

        for (var i = 0; i < faces.length; i++) {
          var f = faces[i];
          if (f.width > biggest) {
            biggest = f.width;
            face = f;
          }
        }

        if (face !== null) {
          im.rectangle(
            [face.x, face.y],
            [face.x + face.width, face.y + face.height],
            [0, 255, 0],
            2
          );

          imgur.postImage(process.env.TOKEN, process.env.ALBUM, im.toBuffer(), 
            function(err, data) {
              if (err) {
                console.log(err);
                that.writeToScreen("Error uploading image!");
              } else {
                console.log(data);
                that.writeToScreen("Image saved!");
              }
            }
          );
        } else {
          that.writeToScreen("No face detected!");
        }
        that.leds.setRGB("000000");
      });
    }
  },

  attract: function() {
    var self = this;
    self.leds.setRGB("ffffff");
    after((2).seconds(), function() {
      self.leds.setRGB("00cc00");
    });
    after((4).seconds(), function() {
      self.leds.setRGB("00ff00");
    });
    after((6).seconds(), function() {
      self.leds.setRGB("00ffff");
    });
    after((8).seconds(), function() {
      self.leds.setRGB("ff0000");
    });
    after((10).seconds(), function() {
      self.leds.setRGB("000000");
    });
  },

  commands: function() {
    return {
      make_gin_tonic: this.makeGinTonic,
      make_vodka_tonic: this.makeVodkaTonic,
      make_moscow_mule: this.makeMoscowMule,
      make_gin_buck: this.makeGinBuck,
      make_ginger_ale: this.makeGingerAle,
      take_photo: this.takePhoto,
      attract: this.attract,
      clean: this.clean
    };
  },

  readyToPour: function() {
    this.writeToScreen("Drinkiebot Ready");
    this.leds.setRGB("000000");
  },


  work: function(my) {
    var that = this;
    if(config.camera) {
      my.camera.once("cameraReady", function() {
        that.cameraReady = true;
      });
    }
    that.readyToPour();
  }
}).start();

function pad(str, length) {
  return str.length < length ? pad(str + " ", length) : str;
};
