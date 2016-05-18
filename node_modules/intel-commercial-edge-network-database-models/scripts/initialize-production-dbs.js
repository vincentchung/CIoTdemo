/*
* Author: Daniel Holmlund <daniel.w.holmlund@Intel.com>
* Copyright (c) 2015 Intel Corporation.
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var config = require("./config.json");
var _ = require("lodash");

// Require the MongoDB libraries and connect to the database
var mongoose = require('mongoose');

// Import the Database Model Objects
var DataModel = require('intel-commerical-iot-database-models').DataModel;
var SensorModel = require('intel-commerical-iot-database-models').SensorModel;

mongoose.connect(config.mongodb.prodHost);
var db = mongoose.connection;

// Report database errors to the console
db.on('error', console.error.bind(console, 'connection error:'));

// Log when a connection is established to the MongoDB server
db.once('open', function (callback) {
  logger.info("Connection to MongoDB successful");
});

var json = {};

var sensor = new SensorModel(json);
sensor.save(function(err, sensor) {
  if (err)
  logger.error(err);
  else
  logger.trace("Wrote sensor to db:" + sensor.toString());
});

var value = new DataModel(json);
value.save(function(err, data) {
  if (err)
  logger.error(err);
  else
  logger.info(data.sensor_id + ":" + data.value);
  logger.trace("Wrote data to db:" + data.toString());
});
