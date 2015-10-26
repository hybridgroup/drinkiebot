# Drinkiebot

A drink-making robot based on Cylon.js (http://cylonjs.com) that can be built for less than $200

Features:

	* Multi-pump system
	* REST API
	* Solid PVC construction
	* RGB LEDs
	* Optional OpenCV computer vision support
	* Optional Imgur album uploading
	* Recipe file in JSON

Drinkiebot requires a single board Linux SoC such as the Intel Edison that provides:

	* 4 GPIO digital outputs
	* 3 PWM outputss
	* 1 i2c port

## Frame

	* 15 T-s
	* 8 corners
	* 2 extenders
	* 6 - 15 inch tubes
	* 10 - 4 3/4 inch tubes
	* 3 - 3 1/2 inch tubes
	* 2 - 3 inch tubes
	* 9 - 9 1/2 inch tubes
	* 4 - 2 inch tubes


## Circuitry
The basic circuit uses one Darlington TP120 transistor to control each 12V pumps. A rectifing diode is added to protect the Linux computer from voltage spikes when the pump is shut off.

Three Darlington TP120 transistors are used to control the RGB LED strip, once each for red, green, and blue are attached to the PWM outputs.

The i2c output is connected to a `jhd1313m1` backlit LED display to show status.

## Software install

You will need to install a bunch of software on the Edison.

Edit add these package repos using `vi /etc/opkg/base-feeds.conf`:

```
src all     http://iotdk.intel.com/repos/1.1/iotdk/all
src x86 http://iotdk.intel.com/repos/1.1/iotdk/x86
src i586    http://iotdk.intel.com/repos/1.1/iotdk/i586
src/gz edison http://repo.opkg.net/edison/repo/edison
src/gz core2-32 http://repo.opkg.net/edison/repo/core2-32
```

```
opkg update
opkg install screen git opencv-dev
```

## Camera
You can use the optional support for OpenCV and a web cam. This let's you take "drinkies" aka photos of the humans who have just had a drink made for them by a robot.

First install OpenCV itself. Then install `npm inistall cylon-opencv`. Last, set the `camera` option in the `config.json` file to `true`.

The LEDs will light up brightly, and then Drinkiebot will scan until it spots faces, then save an image.

## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
