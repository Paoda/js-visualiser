'use strict';

let bgImage;
let result = window.location.href.match(/(\?|\&)[a-z]*=\d/gi); //accounts for ?var={num} and &var={num}
if (result) {
    if (result[0] === '?weeb=1') bgImage = true;
}

var audio = new Audio();
var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();

window.addEventListener('load', function (e) {
    var source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    visualize();
});
window.addEventListener('resize', resize, false);

var canvas = document.createElement('canvas');
canvas.id = 'visualiser';
canvas.draggable = true;
document.body.appendChild(canvas);
resize();

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

//Canvas Events START
canvas.onclick = () => {
    if (lessJumpy) lessJumpy = false;
    else lessJumpy = true;
};

canvas.ondragover = (e) => {
    e.preventDefault();
};
canvas.ondrop = (e) => {
    e.preventDefault();

    let dt = e.dataTransfer;

    if (dt.items) {
        for (let i = 0; i < dt.items.length; i++) {
            if (dt.items[i].kind === 'file') {
                let file = dt.items[i].getAsFile();
                
                if(file.type.match(/audio/gi)) {
                    audio.src = window.URL.createObjectURL(file);
                    audio.play();
                } else throw TypeError('File Uploaded was not an Audio File');
            } else throw TypeError('File Uploaded was not an Audio File');
        }
    } else {
        if(dt.files.length > 1) {
            console.log('Not a Item');
            let file = dt.files[0];

            if(file.type.match(/audio/gi)) {
                audio.src = window.URL.createObjectURL(file);
                audio.play();
            } else throw TypeError('File Uploaded was not an Audio File');
        }
    }
};
canvas.ondragend = (e) => {
    let dt = e.dataTransfer;
    if(dt.items) {
        for (let i = 0; i < dt.items.length; i++) {
            dt.items.remove(i);
        }
    } else {
        dt.clearData();
    }
};

canvas.ondblclick = (e) => {
    e.preventDefault();
    let input = document.createElement('input');
    input.type = 'file';

    let event = document.createEvent('MouseEvents');
    event.initEvent('click', true, false);
    input.dispatchEvent(event);

    input.onchange = (e) => {
        let file = input.files[0];

        if(file.type.match(/audio/gi)) {
            audio.src = window.URL.createObjectURL(file);
            audio.play();
        } else throw TypeError('File Uploaded was not an Audio File');
    };
};
//Canvas Events END
var lessJumpy = true;
var canvasCtx = canvas.getContext('2d');

var bars = 100;
var alpha = '1';
analyser.fftSize = 4096;
let num = 0;
let average= false;

function visualize() {
    let defaultWidth = canvas.width;
    let defaultHeight = canvas.height;
    var bufferLength = analyser.frequencyBinCount;
    console.log('Length of Buffer: ' + bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    if (bgImage) {
        var background = new Image();
        //background.src = 'https://i.imgur.com/xDCaIWm.png';
        background.src = 'https://i.imgur.com/F5jwToz.jpg';
    }

    //Size of dataArray and bufferLength is the same.

    let perGroup = ~~(bufferLength / bars); //2048 / 100 = 20.48 floor that and you should have 20 values in a group.
    console.log('Items per group ' + perGroup);
    let num = 0;
    function draw() {
        let WIDTH = canvas.width;
        let HEIGHT = canvas.height;

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        let drawVisual = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        if (bgImage) {
            //canvasCtx.drawImage(background,0,0,background.naturalWidth - canvas.width,background.naturalHeight - canvas.height);
            canvasCtx.drawImage(background, 0,0, WIDTH, HEIGHT);
        }
        else {
            //canvasCtx.fillStyle = 'rgba(255, 255, 255,' + alpha + ')';
            canvasCtx.fillStyle = '#F1F0FF';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        }

        var barWidth = (WIDTH / bars);
        var barHeight;
        var x = 0;

        for (var i = 0; i < bars; i++) {
            let avg = 0;
            if (average) {
                let dividend = perGroup;
                for (let r = 0; r < perGroup; r++) {
                    if (dataArray[num] === 0) {
                        //This bar never happened!
                        if (!audio.paused) {
                            //if (i < 0) i--;
                            if (r < 0) r--;
                            num++;
                            //zero = true;

                        } else {
                            break;
                        }
                    } else avg += dataArray[num];
                    num++;
                    if (num > bufferLength && i === bars - 1) num = 0;
                }
                avg = parseInt(avg / dividend);
            
            barHeight = avg;
            } else {
                barHeight = dataArray[i];
            }
            if (bgImage) canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',' + 85 + ',' + 197 + ')';
            else canvasCtx.fillStyle = 'rgb(75,0,' + (barHeight + 100) + ')';
            
            if (!lessJumpy) barHeight = ~~(barHeight * 1.5);

            if (bgImage) {
                canvasCtx.fillRect(x, (HEIGHT /2) - barHeight, barWidth, barHeight);
                if (x <= ~~(WIDTH/1.5)) x +=  barWidth + 2;
                else break;
            } else {
                canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
               x += barWidth + 2;
            }
        }
    }
    draw();
}