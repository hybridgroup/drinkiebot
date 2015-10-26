var Cylon = require('cylon');
var fs = require('fs');
var tmp = require('tmp');
var imgur = require('./imgur');

var config = require("./config.json");

Cylon.api("http", {host: "0.0.0.0", ssl: false});

if (config.mqtt) {
  Cylon.api("mqtt", {
    broker: config.mqttBroker,
    prefix: 'drinkiebot', // Optional
  });
}

var connections = {
  edison: { adaptor: 'intel-iot' }
};

var devices = {
  leds: { driver: 'rgb-led', redPin: 3, greenPin: 5, bluePin: 6, connection: 'edison' },
  display: { driver: 'upm-jhd1313m1', connection: 'edison'}
};

var pumps = require("./" + config.pumps).pumps;
var totals = {};
for (pump in pumps) {
  devices[pump] = pumps[pump];
  totals[pumps[pump].data] = 0;
}

var drinks = require("./" + config.drinks);

if (fs.existsSync("totals.json")) {
  totals = JSON.parse(fs.readFileSync("totals.json", { encoding: 'utf8' }));
}

if (config.pebble) {
  connections.pebble = { adaptor: "pebble" };
  devices.pebble = {
    driver: "pebble",
    connection: "pebble"
  };
}

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
  pouring: false,
  cmds: {},

  writeToScreen: function(message) {
    this.display.setCursor(0,0);
    this.display.write(pad(message, 16));
    if (config.pebble) {
      this.pebble.send_notification(message);
    }
  },

  clean: function() {
    this.leds.setRGB("ffffff");
    this.writeToScreen("Cleaning...");
    for (pump in pumps) {
      this.mixer(pump);
    }

    this.readyToPour();
    return "ok";
  },

  writeTotals: function() {
    fs.writeFileSync("totals.json", JSON.stringify(totals));
  },

  makeDrink: function(d) {
    var self = this;
    this.leds.setRGB(d.color);
    this.writeToScreen(d.message);

    this.mixer(d.mixer);

    if (d.shot) {
      this.shot(d.shot);
    }

    after((10).seconds(), function(){
      self.readyToPour();
    });
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
    after((8).seconds(), function() {
      self.devices[t].digitalWrite(0);
    });
  },

  takePhoto: function() {
    var that = this;

    if (config.camera && that.cameraReady) {
      that.leds.setRGB("ffffff");
      that.camera.readFrame();
    }
    return "ok";
  },

  postImage: function(im) {
    if (!config.imgurToken || !config.imgurAlbum) {return;}

    var self = this;
    self.writeToScreen("Saving image...");
    var name = tmp.tmpNameSync({ template: '/tmp/tmp-XXXXXX.jpg' });
    im.save(name);

    imgur.postImage(config.imgurToken, config.imgurAlbum, name,
      function(err, data) {
        if (err) {
          console.log(err);
          self.writeToScreen("Error uploading image!");
        } else {
          console.log(data);
          self.writeToScreen("Image saved!");
        }
      }
    );
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
    this.cmds["take_photo"] = this.takePhoto;
    this.cmds["attract"] = this.attract;
    this.cmds["shot"] = this.shot;
    this.cmds["mixer"] = this.takePhoto;
    this.cmds["clean"] = this.clean;

    return this.cmds;
  },

  readyToPour: function() {
    this.pouring = false;
    this.writeToScreen("Drinkiebot Ready");
    this.leds.setRGB("000000");
  },

  work: function(my) {
    var that = this;
    var recipes = drinks.recipes;
    var f;

    for (var recipe in recipes) {
      f = makeRecipe(that,recipes[recipe]);

      that[recipe] = f;
      that.cmds[recipes[recipe].command] = f;
    }

    if(config.camera) {
      my.camera.once("cameraReady", function() {
        that.cameraReady = true;
      });

      my.camera.on("frameReady", function(err, im) {
        if (config.trackFaces) {
          my.camera.detectFaces(im);
        } else {
          my.postImage(im);
          my.leds.setRGB("000000");
        }
      });

      my.camera.on("facesDetected", function(err, im, faces) {
        var biggest = 0,
            face = null;

        for (var i = 0; i < faces.length; i++) {
          face = faces[i];
          if (config.trackFaces) {
            im.rectangle(
              [face.x, face.y],
              [face.x + face.width, face.y + face.height],
              [0, 255, 0],
              2
            );
          }
        }

        if (face !== null) {
          my.writeToScreen("Face detected!");
          my.postImage(im);
        } else {
          my.writeToScreen("No face detected!");
        }
        my.leds.setRGB("000000");
      });
    }

    that.readyToPour();

    every(1000, function() {
      my.writeTotals();
    });
  }
}).start();

function pad(str, length) {
  return str.length < length ? pad(str + " ", length) : str;
};

function makeRecipe(self, r) {
  return function() {
    if (!self.pouring) {
      self.pouring = true;
      self.emit('making_drink', { data: r.data});
      var mix = {color: r.color, message: r.message};
      if (r.mixer) {
        mix.mixer = r.mixer;
      }
      if (r.shot) {
        mix.shot = r.shot;
      }

      self.makeDrink(mix);
      totals[r.data] += 1;
      return "ok";
    }
    return "busy";
  };
}
