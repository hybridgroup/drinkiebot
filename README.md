# Drinkiebot

A drink-making robot based on Cylon.js (http://cylonjs.com) that can be built for less than $200

Features:

	* Four pump system
	* API
	* Solid PVC construction
	* RGB LEDs

Drinkiebot requires a single board Linux SoC such as the Intel Edison that provides:

	* 4 GPIO digital outputs
	* 3 PWM
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

## Camera
You can use the optional support for OpenCV and a web cam. First install OpenCV itself. Then install `npm inistall cylon-opencv`. Last, set the `camera` option in the `config.json` file to `true`.

## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
