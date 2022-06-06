// Copyright (c) 2018 p5ble
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

let writeCharacteristic,notifyCharacteristic;
let myValue = 0;
let myBLE;

var isConnected = 0;
var writeArr = new Uint8Array([50, 0, 0, 0]);
var strength = 0 ;

function setup() {
  colorMode(HSB, 255);
  // Create a p5ble class
  myBLE = new p5ble();

  createCanvas(200, 200);
  textSize(20);
  textAlign(CENTER, CENTER);

  // Create a 'Connect' button
  const connectButton = createButton('Connect')
  connectButton.mousePressed(connectToBle);

  const sendButton = createButton('Send')
  sendButton.mousePressed(writeToBle);
}

function draw() {
  if(myValue || myValue === 0){
  background(myValue,255,255);
  // Write value on the canvas
  text(myValue, 100, 100);
  }
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
  isConnected = 1;
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  if (error) console.log('error: ', error);
  console.log('characteristics: ', characteristics);
  writeCharacteristic = characteristics[0];
  notifyCharacteristic = characteristics[1];
  myBLE.startNotifications(notifyCharacteristic, handleNotifications,'custom');
  // You can also pass in the dataType
  // Options: 'unit8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float32', 'float64', 'string'
  //myBLE.startNotifications(notifyCharacteristic, handleNotifications, 'int16');
}

// A function that will be called once got characteristics
function handleNotifications(data) {

  let numVals = data.byteLength/2 ;
  
  var readarr = new Int16Array(numVals);

  for( var i=0; i < numVals; i++){
      readarr[i] = data.getInt16(i*2,true);
  }

  //console.log('data: ', readarr);
  //myValue = readarr[6]/256;
}


function writeToBle() {

  if(strength == 0) strength = 255 ;
  else if(strength == 255) strength = 0 ;

  writeArr[2] = strength;
  myValue = strength;

  try{
    writeCharacteristic.writeValue(writeArr);
  }
  catch(err){
    isConnected = 0;
  }

}

