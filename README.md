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

## Circuitry
The basic circuit uses one Darlington TP120 transistor to control each 12V pumps. A rectifing diode is added to protect the Linux computer from voltage spikes when the pump is shut off. 

Three Darlington TP120 transistors are used to control the RGB LED strip, once each for red, green, and blue are attached to the PWM outputs.

The i2c output is connected to a `jhd1313m1` backlit LED display to show status.

## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
