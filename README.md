![Logo](admin/midi.png)
# ioBroker.midi

[![NPM version](http://img.shields.io/npm/v/iobroker.midi.svg)](https://www.npmjs.com/package/iobroker.midi)
[![Downloads](https://img.shields.io/npm/dm/iobroker.midi.svg)](https://www.npmjs.com/package/iobroker.midi)
![Number of Installations (latest)](http://iobroker.live/badges/midi-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/midi-stable.svg)
[![Dependency Status](https://img.shields.io/david/boriswerner/iobroker.midi.svg)](https://david-dm.org/boriswerner/iobroker.midi)
[![Known Vulnerabilities](https://snyk.io/test/github/boriswerner/ioBroker.midi/badge.svg)](https://snyk.io/test/github/boriswerner/ioBroker.midi)

[![NPM](https://nodei.co/npm/iobroker.midi.png?downloads=true)](https://nodei.co/npm/iobroker.midi/)

## midi adapter for ioBroker

The adapter processes midi input and output using easymidi

## Current Status
working:
- midi input
not working: 
- midi output
- device discovery in admin console

### States
- noteon
  - value represents the velocity of the noteon [0-127]
- noteoff
  - value represents the velocity of the noteoff [0-127]
- note
  - set to true when the noteon was seen for the note and set to false when the noteoff was seen for the note
- control change
  - value represents the value of the command (most of the times set to 127 when cc button is pushed, false when released) [0-127]
- poly aftertouch
  - value represents the pressure of the aftertouch [0-127]
- program change
  - boolean
- position
  - value of 0-16384


## Setup
In instance configuration insert the device id in the Midi In text field. The "MIDI input device" is supposed to be a dropdown with the available devices but currently not working correctly.
On adapter startup the log will show an info:
`(29332) Available MIDI Input Devices: Midi Through:Midi Through Port-0 14:0,Samson Graphite M25:Samson Graphite M25 MIDI 1 20:0`
This line represents two devices:
- `Midi Through:Midi Through Port-0 14:0`
- `Samson Graphite M25:Samson Graphite M25 MIDI 1 20:0`
The whole string has to be pasted to the configuration.

The "Create all objects in advance" checkbox should only be used with caution as it creates about 12000 states (all notes on all channels). If not set (default) only the objectas/states will be created, that already appeared.

## Changelog

### 0.0.2
* (Boris Werner) implemented basic midi input

### 0.0.1
* (Boris Werner) initial release from template

## License
MIT License

Copyright (c) 2020 Boris Werner <iobroker@boriswerner.eu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.