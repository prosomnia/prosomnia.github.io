var w = window.innerWidth;
var h = window.innerHeight;

const serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

let writeCharacteristic,notifyCharacteristic;
let myBLE;

let duration_value;
let duration_slider;
let intensity_ceiling_slider;
let time_slider;
let intensity_ceiling_value;
let time_value;
var writeArr = new Uint8Array([40, 0, 0, 0]);
var isConnected = 0;
let small_read_arr;
let readArr = [];
let gyro1 = [];
let gyro2 = [];
let gyro3 = [];
let gyro4 = [];
let acc1 = [];
let acc2 = [];
let acc3 = [];
let acc4 = [];
let curr1 = [];
let curr2 = [];
let curr3 = [];
let curr4 = [];
let myarr1 = [];
let myarr2 = [];
let myarr3 = [];
let myarr4 = [];
let intensity_arr_1 = [];
let intensity_arr_2 = [];
let arrnum1 = 1;
let arrnum2 = 2;
let arrnum3 = 3;
let arrnum4 = 4;
let label1 = 'Gryometer 1';
let label2 = 'Gyrometer 2';
let label3 = 'Gyrometer 3';
let label4 = 'Gyrometer 4';
let factor = 156;
let shift = h/4 + h/14;
let sweep_type = '';
let sleep_on = false;
let hz = "";
let started = false;
let current_time = 0;
let duration_display = 0;
let time_display = 0;
let intensity_display = 1;

function preload(){
    logo = loadImage("logo.png")
}

function sweep_set_linear() {
    sweep_type = 'linear';
}

function sweep_set_sin() {
    sweep_type = 'sin';
}

function times() {
    configDevice();

    setTimeout(setIntensity, 500);

    duration_value = duration_slider.value();
    time_value = time_slider.value();
    intensity_ceiling_value = intensity_ceiling_slider.value();

    if (sweep_type == 'sin') {
        setTimeout(setSin, 1000);
    }
    if (sweep_type == 'linear') {
        setTimeout(setLinear, 1000);
    }

    sleep_on = true;

    let timer_func = setInterval(update_time, 1000);
    function update_time() {
        if (isConnected === 1 && current_time <= duration_value * 60) {
            text('Stimulation Remaining: ' + (duration_value * 60 - current_time).toString() + ' seconds', w/9, h/4);
        }
        else {
            text('Stimulation Remaining: ' + '0' + ' seconds', w/9, h/4);
        }

        text('Total Duration: ' + current_time.toString() + ' seconds', w/9, h/4 + h/25);
        current_time += 1;

        if (isConnected === 0) {
            clearInterval(timer_func)
        }
    }
}

function resetDevice(){
    writeArr[0] = 60 ;
    writeArr[1] = 0;
    writeArr[2] = 0;
    writeArr[3] = 0;
    writeToBle();
}

function configDevice(){
    writeArr[0] = 25; //26 for pitch
    writeArr[1] = 0;
    writeArr[2] = 0;
    writeArr[3] = 0;
    writeToBle();
}

function setIntensity(){
    writeArr[0] = 50;
    writeArr[1] = 0;
    writeArr[2] = intensity_floor_value;
    writeArr[3] = intensity_ceiling_value;
    writeToBle();
}

function setSin(){
    writeArr[0] = 40;
    writeArr[1] = 0;
    writeArr[2] = time_value;
    writeArr[3] = 0; //change roll to pitch 0 - 2
    writeToBle();
}


function setLinear(){
    writeArr[0] = 30;
    writeArr[1] = 0;
    writeArr[2] = 1;
    writeArr[3] = 0;
    writeToBle();
}


function update_gyro(){
    myarr1 = gyro1;
    myarr2 = gyro2;
    myarr3 = gyro3;
    myarr4 = gyro4;
    arrnum1 = 1;
    arrnum2 = 2;
    arrnum3 = 3;
    arrnum4 = 4;
    label1 = 'Gyrometer 1';
    label2 = 'Gyrometer 2';
    label3 = 'Gyrometer 3';
    label4 = 'Gyrometer 4';
    factor = 156;
    shift = h/4 + h/14;
    redraw();
}

function update_acc(){
    myarr1 = acc1;
    myarr2 = acc2;
    myarr3 = acc3;
    myarr4 = acc4;
    arrnum1 = 5;
    arrnum2 = 6;
    arrnum3 = 7;
    arrnum4 = 8;
    label1 = 'Accelerometer 1';
    label2 = 'Accelerometer 2';
    label3 = 'Accelerometer 3';
    label4 = 'Accelerometer 4';
    factor = 1000;
    shift = h/4 + h/14;
    redraw();
}


function update_curr(){
    myarr1 = curr1;
    myarr2 = curr2;
    myarr3 = curr3;
    myarr4 = curr4;
    arrnum1 = 9;
    arrnum2 = 10;
    arrnum3 = 11;
    arrnum4 = 12;
    label1 = 'Current 1';
    label2 = 'Current 2';
    label3 = 'Current 3';
    label4 = 'Current 4';
    factor = 100;
    shift = h/4 + h/14;
    redraw();
}

function setup() {
    // Create a p5ble class
    myBLE = new p5ble();

    canvas = createCanvas(w, h);

    duration_slider = createSlider(0, 30, 0, 5);
    duration_slider.position(w/10, h/2 - h/20);
    duration_slider.style('width', '170px');

    intensity_ceiling_slider = createSlider(0, 100, 0, 20);
    intensity_ceiling_slider.position(w/10, h/2 + 3*h/20);
    intensity_ceiling_slider.style('width', '170px');

    time_slider = createSlider(1, 4, 0, 1);
    time_slider.position(w/10, h/2 + 7*h/20);
    time_slider.style('width', '170px');

    sin_wave_button = createButton('Sine Wave');
    sin_wave_button.position(w/15, h - h/10);
    sin_wave_button.mousePressed(sweep_set_sin);

    linear_button = createButton('Linear Sweep');
    linear_button.position(w/5, h - h/10);
    linear_button.mousePressed(sweep_set_linear);

    // Create 'Sleep' button
    sleep_button = createButton('Sleep');
    sleep_button.position(w/2 - w/15, h * (9/10));
    sleep_button.mousePressed(times);

    reset_button = createButton('Reset');
    reset_button.position(w/2 + w/15, h * (9/10));
    reset_button.mousePressed(resetDevice);

    // Create a 'Connect' button
    const connectButton = createButton('Connect')
    connectButton.mousePressed(connectToBle);
    connectButton.position(w/3, 110);

    // Create a 'Stop' button
    const stopButton = createButton('Stop Notifications');
    stopButton.mousePressed(stopNotifications);
    stopButton.position(w * (2/3), 110);

    const gyroButton = createButton('Gyrometer');
    gyroButton.mousePressed(update_gyro);
    gyroButton.position(w * (3.25/4), h * (8/10));

    const accButton = createButton('Accelerometer');
    accButton.mousePressed(update_acc);
    accButton.position(w * (3.25/4), h * (8.5/10));

    const currButton = createButton('Current');
    currButton.mousePressed(update_curr);
    currButton.position(w * (3.25/4), h * (9/10));

    // console_output = setInterval(update_graphs, 1000);
}

function draw() {
    background(202, 222, 238);

    image(logo, w/2 - 175, h/2 - 150, 350, 300);

    let duration_header = 'Stimulation Duration: ' + duration_display.toString() + ' minutes';
    text(duration_header, w/9, h/2 - h/10);
    let intensity2_header = 'Maximum Intensity Percent: ' + intensity_display.toString() + '%';
    text(intensity2_header, w/9, h/2 + h/10);
    let time_header = "Time: " + hz;
    text(time_header, w/9, h/2 + 3*h/10);

    duration_display = duration_slider.value();
    time_display = time_slider.value();
    if (time_display == 1) {
        hz = "1 hz";
    }
    else if (time_display == 2) {
        hz = "0.5 hz";
    }
    else if (time_display == 3) {
        hz = "0.33 hz";
    }
    else if (time_display == 4) {
        hz = "0.25 hz";
    }
    intensity_display = intensity_ceiling_slider.value();

    text(label1, w * (3.25/4), h/4);
    text(label2, w * (3.25/4), h/4 + h/7);
    text(label3, w * (3.25/4), h/4 + 2*(h/7));
    text(label4, w * (3.25/4), h/4 + 3*(h/7));

    if (isConnected === 1) {
        update_graphs();
    }

    else if (started === true && isConnected === 0) {
        make_csv();
    }
}


function connectToBle() {
    // Connect to a device by passing the service UUID
    myBLE.connect(serviceUuid, gotCharacteristics);
    isConnected = 1;
    started = true;
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
    if (error) console.log('error: ', error);
    console.log('characteristics: ', characteristics);
    writeCharacteristic = characteristics[0];
    notifyCharacteristic = characteristics[1];
    myBLE.startNotifications(notifyCharacteristic, handleNotifications,'custom');
}

// A function that will be called once got characteristics
function handleNotifications(data) {
    let numVals = data.byteLength/2 ;
    var readarr = new Int16Array(numVals);
    for( var i=0; i < numVals; i++){
        readarr[i] = data.getInt16(i*2,true);
    }
    small_read_arr = readarr;
    console.log('data: ', readarr);
    readArr.push(readarr);
}

function writeToBle() {
    try{
        writeCharacteristic.writeValue(writeArr);
    }
    catch(err){
        isConnected = 0;
    }
    console.log(writeArr);
}

function stopNotifications() {
    myBLE.stopNotifications(notifyCharacteristic);
    isConnected = 0;
    make_csv();
}

function make_csv() {
    let csvContent = "data:text/csv;charset=utf-8,"
        + readArr.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}

// Circle class
function Circle(x, y, this_arr) {
    this.x = Number(x);
    this.y = Number(y);
    this.this_arr = this_arr;
    this.speed = 2;
    this.diameter = Number(2);

    this.move = function() {
        this.x -= this.speed;
    };

    if(this.x <= w/3){
        this.this_arr.shift();
    }

    this.display = function() {
        ellipse(this.x, this.y, this.diameter);
        if (label1 ==='Gyrometer 1'){
            if ((this.y >= (0/factor + shift) && this.y < (400/factor + shift)) || (this.y > (-400/factor + shift) && this.y < (0/factor + shift))
            || (this.y >= (0/factor + shift + h/7) && this.y < (400/factor + shift + h/7)) || (this.y > (-400/factor + shift + h/7) && this.y < (0/factor + shift + h/7))
            || (this.y >= (0/factor + shift + 2*h/7) && this.y < (400/factor + shift + 2*h/7)) || (this.y > (-400/factor + shift + 2*h/7) && this.y < (0/factor + shift + 2*h/7))
            || (this.y >= (0/factor + shift + 3*h/7) && this.y < (400/factor + shift + 3*h/7)) || (this.y > (-400/factor + shift + 3*h/7) && this.y < (0/factor + shift + 3*h/7))) {
                fill(color(115, 157, 179));
            }

            else if ((this.y >= (-750/factor + shift) && this.y < (-400/factor + shift)) || (this.y > (400/factor + shift) && this.y < (750/factor + shift))
                || (this.y >= (-750/factor + shift + h/7) && this.y < (-400/factor + shift + h/7)) || (this.y > (400/factor + shift + h/7) && this.y < (750/factor + shift + h/7))
                || (this.y >= (-750/factor + shift + 2*h/7) && this.y < (-400/factor + shift + 2*h/7)) || (this.y > (400/factor + shift + 2*h/7) && this.y < (750/factor + shift + 2*h/7))
                || (this.y >= (-750/factor + shift + 3*h/7) && this.y < (-400/factor + shift + 3*h/7)) || (this.y > (400/factor + shift + 3*h/7) && this.y < (750/factor + shift + 3*h/7))){
                    fill(color(0, 0, 225));
            }

            else if (this.y <= -750/factor + shift || this.y >= 750/factor + shift ||
                this.y <= -750/factor + shift + h/7 || this.y >= 750/factor + shift + h/7 ||
                this.y <= -750/factor + shift + 2*h/7 || this.y >= 750/factor + shift + 2*h/7 ||
                this.y <= -750/factor + shift + 3*h/7 || this.y >= 750/factor + shift + 3*h/7){
                    fill(color(0, 255, 255));
            }
        }
    }
}


function update_graphs() {
    if (isConnected === 1){
        myarr1.push(new Circle(w - 20, small_read_arr[arrnum1]/factor + shift, myarr1));
        myarr2.push(new Circle(w - 20, small_read_arr[arrnum2]/factor + shift + h/7, myarr2));
        myarr3.push(new Circle(w - 20, small_read_arr[arrnum3]/factor + shift + 2*(h/7), myarr3));
        myarr4.push(new Circle(w - 20, small_read_arr[arrnum4]/factor + shift + 3*(h/7), myarr4));

        var left_graph = small_read_arr[14] - small_read_arr[13]
        var right_graph = small_read_arr[13] - small_read_arr[14]

        intensity_arr_1.push(new Circle(w/2 - 175, left_graph + h/2 + intensity_floor_value, intensity_arr_1));
        intensity_arr_2.push(new Circle(w/2 + 250, right_graph + h/2 + intensity_floor_value, intensity_arr_2));

        for(var i = 0; i < myarr1.length; i++){
            myarr1[i].move();
            if (myarr1[i].x >= 1056) {
                myarr1[i].display();
            }
        }

        for(var j = 0; j < myarr2.length; j++){
            myarr2[j].move();
            if (myarr2[j].x >= 1056) {
                myarr2[j].display();
            }
        }

        for(var k = 0; k < myarr3.length; k++){
            myarr3[k].move();
            if (myarr3[k].x >= 1056) {
                myarr3[k].display();
            }
        }

        for(var l = 0; l < myarr4.length; l++){
            myarr4[l].move();
            if (myarr4[l].x >= 1056) {
                myarr4[l].display();
            }
        }

        for(var m = 0; m < intensity_arr_1.length; m++){
            intensity_arr_1[m].move();
            if (intensity_arr_1[m].x >= (w/2 - 250) && intensity_arr_1[m].y > h/2) {
                intensity_arr_1[m].display();
            }
        }

        for(var n = 0; n < intensity_arr_2.length; n++){
            intensity_arr_2[n].move();
            if (intensity_arr_2[n].x >= (w/2 + 175) && intensity_arr_2[n].y > h/2) {
                intensity_arr_2[n].display();
            }
        }
    }
}

window.onresize = function() {
    // assigns new values for width and height variables
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.size(w,h);
}