"use strict";

/*
 * Created with @iobroker/create-adapter v1.21.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const midi = require("easymidi");
const adapter  = utils.Adapter ("midi");
let midiIn;

// Note names
const NOTE_NAMES = [ "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B" ];

function noteNameFromMidiNumber (midi) {
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return note + octave;
}

class Midi extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "midi",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {

        adapter.log.info("Available MIDI Input Devices: " + midi.getInputs());
        adapter.log.info("config midiin: " + adapter.config.midiin);
        adapter.log.info("config usb: " + adapter.config.usb);
        
        //adapter.subscribeStates("*"); //not used for input

        //establish connection to midi input device
        try {
            midiIn = new midi.Input(adapter.config.midiin);
        } catch(e) {
            adapter.log.error(e.message);
        }
        
        //check if connection was successful
        if(typeof midiIn != "undefined") {
            adapter.setState("info.connection", true, true);
            adapter.log.info("Connected to " + adapter.config.midiin);

            //create all states in advance if configured
            if(adapter.config.createAllObjects) {
                for(let channel = 0; channel < 16; channel++) {
                    for(let note = 0; note < 128; note++) {
                        adapter.setObjectNotExists("channel" + channel + ".noteoff." + noteNameFromMidiNumber(note), {
                            type:"state",
                            common:{name:"Channel " + channel + " noteoff " + noteNameFromMidiNumber(note), type:"number", role:"value", read:true,write:false},
                            native:{}
                        });
                        adapter.setObjectNotExists("channel" + channel + ".noteon." + noteNameFromMidiNumber(note), {
                            type:"state",
                            common:{name:"Channel " + channel + " noteon " + noteNameFromMidiNumber(note), type:"number", role:"value", read:true,write:false},
                            native:{}
                        });
                        adapter.setObjectNotExists("channel" + channel + ".note." + noteNameFromMidiNumber(note), {
                            type:"state",
                            common:{name:"Channel " + channel + " note " + note, type:"number", role:"value", read:true,write:false},
                            native:{}
                        });
                        adapter.setObjectNotExists("channel" + channel + ".cc." + note, {
                            type:"state",
                            common:{name:"Channel " + channel + " cc " + note, type:"number", role:"value", read:true,write:false},
                            native:{}
                        });
                        adapter.setObjectNotExists("channel" + channel + ".polyaftertouch." + note, {
                            type:"state",
                            common:{name:"Channel " + channel + " polyaftertouch " + note, type:"number", role:"value", read:true,write:false},
                            native:{}
                        });
                        adapter.setObjectNotExists("channel" + channel + ".program." + note, {
                            type:"state",
                            common:{name:"Channel " + channel + " program " + note, type:"boolean", role:"value", read:true,write:false},
                            native:{}
                        });
                    }
                }
                        
                adapter.setObjectNotExists("position", {
                    type:"state",
                    common:{name:"Position", type:"number", role:"value", read:true,write:false},
                    native:{}
                });
            }
        
            //midi input handlers
            midiIn.on("noteoff", function (msg) {
                adapter.log.debug("midi < noteoff "+ noteNameFromMidiNumber(msg.note) +" "+ msg.velocity +" "+ msg.channel);
                adapter.setObjectNotExists("channel" + msg.channel + ".noteoff." + noteNameFromMidiNumber(msg.note), {
                    type:"state",
                    common:{name:"Channel " + msg.channel + " noteoff " + noteNameFromMidiNumber(msg.note), type:"number", role:"value", read:true,write:false},
                    native:{}
                });
                //set value of noteoff
                adapter.setStateAsync("channel" + msg.channel + ".noteoff." + noteNameFromMidiNumber(msg.note), msg.velocity.toString(), true);
                //set boolean for note to false
                adapter.setStateAsync("channel" + msg.channel + ".note." + noteNameFromMidiNumber(msg.note), false, true);
            }); 
                
            midiIn.on("noteon", function (msg) {
                adapter.log.debug("midi < noteon "+ noteNameFromMidiNumber(msg.note) +" "+ msg.velocity +" "+ msg.channel);
                adapter.setObjectNotExists("channel" + msg.channel + ".noteon." + noteNameFromMidiNumber(msg.note), {
                    type:"state",
                    common:{name:"Channel " + msg.channel + " noteon " + noteNameFromMidiNumber(msg.note), type:"number", role:"value", read:true,write:false},
                    native:{}
                });adapter.setObjectNotExists("channel" + msg.channel + ".note." + noteNameFromMidiNumber(msg.note), {
                    type:"state",
                    common:{name:"Channel " + msg.channel + " note " + noteNameFromMidiNumber(msg.note), type:"boolean", role:"value", read:true,write:false},
                    native:{}
                });
                //set value of noteon
                adapter.setStateAsync("channel" + msg.channel + ".noteon." + noteNameFromMidiNumber(msg.note), msg.velocity.toString(), true);
                //set boolean for note to true
                adapter.setStateAsync("channel" + msg.channel + ".note." + noteNameFromMidiNumber(msg.note), true, true);
            });
                
            midiIn.on("poly aftertouch", function (msg) {
                adapter.log.debug("midi < polyaftertouch "+ noteNameFromMidiNumber(msg.note) +" "+ msg.pressure +" "+ msg.channel);
                adapter.setObjectNotExists("channel" + msg.channel + ".polyaftertouch." + noteNameFromMidiNumber(msg.note), {
                    type:"state",
                    common:{name:"Channel " + msg.channel + " polyaftertouch " + noteNameFromMidiNumber(msg.note), type:"number", role:"value", read:true,write:false},
                    native:{}
                });
                adapter.setStateAsync("channel" + msg.channel + ".polyaftertouch." + noteNameFromMidiNumber(msg.note), msg.pressure.toString(), true);
            });
                
            midiIn.on("cc", function (msg) {
                adapter.log.debug("midi < cc "+ msg.controller +" "+ msg.value +" "+ msg.channel);
                adapter.setObjectNotExists("channel" + msg.channel + ".cc." + msg.controller, {
                    type:"state",
                    common:{name:"Channel " + msg.channel + " cc " + msg.controller, type:"number", role:"value", read:true,write:false},
                    native:{}
                });
                adapter.setStateAsync("channel" + msg.channel + ".cc." + msg.controller, msg.value.toString(), true);
            });
                
            midiIn.on("program", function (msg) {
                adapter.log.debug("midi < program "+ msg.number +" "+ msg.channel);
                
                adapter.setObjectNotExists("channel" + msg.channel + ".program." + msg.number, {
                    type:"state",
                    common:{name:"Channel " + msg.channel + " program " + msg.number, type:"boolean", role:"value", read:true,write:false},
                    native:{}
                });
                adapter.setStateAsync("channel" + msg.channel + ".program." + msg.number, true, true);
            });
                
            midiIn.on("position", function (msg) {
                adapter.log.debug("midi < position "+ msg.value);
                adapter.setObjectNotExists("position", {
                    type:"state",
                    common:{name:"Position", type:"number", role:"value", read:true,write:false},
                    native:{}
                });
                adapter.setStateAsync("position", msg.value.toString(), true);
            });

            //ToDo: implement states
            midiIn.on("channel aftertouch", function (msg) {
                adapter.log.debug("midi < channel aftertouch "+ msg.pressure +" "+ msg.channel);
            });
                
            midiIn.on("pitch", function (msg) {
                adapter.log.debug("midi < pitch "+ msg.value +" "+ msg.channel);
            });
                
                
            midiIn.on("select", function (msg) {
                adapter.log.debug("midi < select"+ msg.song);
            });
                
            midiIn.on("clock", function () {
                // adapter.log.debug("midi < clock");
            });
                
            midiIn.on("start", function () {
                adapter.log.debug("midi < start");
            });
                
            midiIn.on("continue", function () {
                adapter.log.debug("midi < continue");
            });
                
            midiIn.on("stop", function () {
                adapter.log.debug("midi < stop");
            });
                
            midiIn.on("reset", function () {
                adapter.log.debug("midi < reset");
            });
        } else { // connection failed
            adapter.setState("info.connection", false, true);
            adapter.log.error("Connection failed");
        }  
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            midiIn.close(); //close midi input connection
            adapter.setState("info.connection", false, true);
            
            this.log.info("cleaned everything up...");
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.message" property to be set to true in io-package.json
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "listMidiInputDevices") {
                const inputs = midi.getInputs();
                this.log.info("List of Midi Inputs: " + inputs);

                // Send response in callback
                if (obj.callback) this.sendTo(obj.from, obj.command, inputs, obj.callback);
            }
        }
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Midi(options);
} else {
    // otherwise start the instance directly
    new Midi();
}