// Drive the Grive RGB LCD (a JHD1313m1)
// We can do this in either of two ways
//
// The bext way is to use the upm library. which
// contains support for this device
//
// The alternative way is to drive the LCD directly from
// Javascript code using the i2c interface directly
// This approach is useful for learning about using
// the i2c bus. The lcd file is an implementation
// in Javascript for some of the common LCD functions

// configure jshint
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

// change this to false to use the hand rolled version
var useUpmVersion = false;

// we want mraa to be at least version 0.6.1
var mraa = require('mraa');
var version = mraa.getVersion();

//add MQTT depence
var mqtt = require('mqtt');
//var Data = require('intel-commerical-edge-network-database-models').DataModel;
var client  = mqtt.connect("mqtt://192.168.1.1");

//add express for http REST

var express = require('express');
var app = express();

// Declare a backlight object
var backlight = { r:0, g:60, b:255 };


// Declare a variable for the LCD text
//var lcdtext = "";
// Respond with a JSON string containing the LCD backlight status
app.get('/lcd/backlight/', function (request, response) {
  response.status(200).json(backlight);
});

app.post('/lcd/backlight/', function (request, response) {
  backlight.r=request("red");
  backlight.b=request("blue");
  backlight.g=request("green");
  response.status(200);
});


if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') ok');
}
else {
    console.log('meaa version(' + version + ') is old - this code may not work');
}

if (useUpmVersion) {
    useUpm();
}
else {      
    setInterval(function() {
        useLcd();
    }, 1000);
    //getTemperature();
}
/**
 * Rotate through a color pallette and display the
 * color of the background as text
 */
function rotateColors(display) {
    var red = 0;
    var green = 0;
    var blue = 0;
    display.setColor(red, green, blue);
    setInterval(function() {
        blue += 64;
        if (blue > 255) {
            blue = 0;
            green += 64;
            if (green > 255) {
                green = 0;
                red += 64;
                if (red > 255) {
                    red = 0;
                }
            }
        }
        display.setColor(red, green, blue);
        display.setCursor(0,0);
        display.write('red=' + red + ' grn=' + green + '  ');
        display.setCursor(1,0);
        display.write('blue=' + blue + '   ');  // extra padding clears out previous text
    }, 1000);
}

/**
 * Use the upm library to drive the two line display
 *
 * Note that this does not use the "lcd.js" code at all
 */
function useUpm() {
    var lcd = require('jsupm_i2clcd');
    var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);
    display.setCursor(1, 1);
    display.write('hi there');
    display.setCursor(0,0);
    display.write('more text');
    rotateColors(display);
}

/**
 * Use the hand rolled lcd.js code to do the
 * same thing as the previous code without the
 * upm library
 */
function useLcd() {
    var lcd = require('./lcd');
    var display = new lcd.LCD(0);
    var temp=getTemperature();
    

    display.setColor(backlight.r, backlight.g, backlight.b);
    display.setCursor(1, 1);
    display.write(temp.toFixed(5));
    display.setCursor(0,0);  
    display.write('temperature');
    pubMQTT(temp.toFixed(5));
/*
    display.waitForQuiescent()
    
        .then(function() {
        rotateColors(display);
    })
    .fail(function(err) {
        console.log(err);
        display.clearError();
        rotateColors(display);
    });
*/    
}

function getTemperature() {
var m = require('mraa'); //require mraa
console.log('MRAA Version: ' + m.getVersion()); //write the mraa version to the console

var analogPin0 = new m.Aio(0); //setup access analog inpuput pin 0
var analogValue = analogPin0.read(); //read the value of the analog pin
var analogValueFloat = analogPin0.readFloat(); //read the pin value as a float
console.log(analogValue); //write the value of the analog pin to the console
console.log(analogValueFloat.toFixed(5)); //write the value in the float format
return analogValueFloat;
}


function pubMQTT(temp){
    
console.log(temp);
    
client.subscribe('sensors/temperature/data');
client.publish('sensors/temperature/data', temp);

}